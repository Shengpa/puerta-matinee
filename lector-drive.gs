// Lector para la app Puerta Matinée (Google Apps Script).
// Lee el Excel (o la Hoja de cálculo) de Drive y devuelve SOLO las columnas
// "Nombre y apellido" e "Invitado por" en CSV. El archivo original no se modifica
// ni se comparte: el script lo abre con la cuenta de quien lo publica.
// Publicar: Implementar → Nueva implementación → App web →
//   Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario.

var FILE_ID = 'PEGAR_ID_DEL_ARCHIVO';
var HOJA = 'entradas';

function doGet() {
  var f = DriveApp.getFileById(FILE_ID);
  var key = 'v1_' + f.getLastUpdated().getTime();
  var cache = CacheService.getScriptCache();
  var csv = cache.get(key);
  if (!csv) {
    csv = armarCsv(leerFilas(f));
    try { cache.put(key, csv, 21600); } catch (e) {}
  }
  return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
}

function leerFilas(f) {
  if (f.getMimeType() === MimeType.GOOGLE_SHEETS) {
    var ss = SpreadsheetApp.openById(f.getId());
    var sh = ss.getSheetByName(HOJA) || ss.getSheets()[0];
    return sh.getDataRange().getDisplayValues();
  }
  var blob = f.getBlob();
  blob.setContentType('application/zip');
  var files = {};
  Utilities.unzip(blob).forEach(function (b) { files[b.getName()] = b.getDataAsString('UTF-8'); });
  return filasXlsx(files, HOJA);
}

// ---- lectura de .xlsx sin servicios extra (texto XML dentro del zip) ----
function xmlDecode(s) {
  return s.replace(/&#x([0-9a-f]+);/gi, function (m, h) { return String.fromCharCode(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(+d); })
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}
function attrs(tag) {
  var o = {}, re = /([\w:]+)="([^"]*)"/g, m;
  while ((m = re.exec(tag))) o[m[1]] = xmlDecode(m[2]);
  return o;
}
function textos(xml) {
  var out = [], re = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g, m;
  while ((m = re.exec(xml))) out.push(xmlDecode(m[1]));
  return out.join('');
}
function colIndex(ref) {
  var letras = ref.replace(/\d+/g, ''), n = 0;
  for (var i = 0; i < letras.length; i++) n = n * 26 + (letras.charCodeAt(i) - 64);
  return n - 1;
}
function filasXlsx(files, nombreHoja) {
  var shared = [], m, re;
  var ss = files['xl/sharedStrings.xml'] || '';
  re = /<si>([\s\S]*?)<\/si>/g;
  while ((m = re.exec(ss))) shared.push(textos(m[1]));

  var rels = {};
  re = /<Relationship\s[^>]*>/g;
  while ((m = re.exec(files['xl/_rels/workbook.xml.rels'] || ''))) { var a = attrs(m[0]); rels[a.Id] = a.Target; }
  var hojas = [];
  re = /<sheet\s[^>]*>/g;
  while ((m = re.exec(files['xl/workbook.xml'] || ''))) { var s = attrs(m[0]); hojas.push({nombre: s.name, rid: s['r:id']}); }
  var elegida = hojas.filter(function (h) { return h.nombre === nombreHoja; })[0] || hojas[0];
  var ruta = rels[elegida.rid].replace(/^\/?(xl\/)?/, 'xl/');
  var xml = files[ruta];

  var filas = [];
  re = /<row\s[^>]*>([\s\S]*?)<\/row>|<row\s[^>]*\/>/g;
  while ((m = re.exec(xml))) {
    var fila = [], rc = /<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, c;
    while ((c = rc.exec(m[1] || ''))) {
      var at = attrs(c[1]), cuerpo = c[2] || '', val = '';
      var v = /<v>([\s\S]*?)<\/v>/.exec(cuerpo);
      if (at.t === 's' && v) val = shared[+v[1]] || '';
      else if (at.t === 'inlineStr') val = textos(cuerpo);
      else if (v) val = xmlDecode(v[1]);
      fila[colIndex(at.r)] = val;
    }
    for (var i = 0; i < fila.length; i++) if (fila[i] === undefined) fila[i] = '';
    filas.push(fila);
  }
  return filas;
}

// ---- deja solo las columnas que necesita la puerta ----
function armarCsv(filas) {
  var enc = (filas[0] || []).map(function (x) { return String(x).trim().toLowerCase(); });
  var cols = [];
  enc.forEach(function (x, i) { if (x === 'nombre y apellido' || x.indexOf('invitado') === 0) cols.push(i); });
  if (!cols.length) throw new Error('No encuentro las columnas "Nombre y apellido" / "Invitado por"');
  return filas
    .filter(function (r, i) { return i === 0 || String(r[cols[0]] || '').trim(); })
    .map(function (r) { return cols.map(function (i) { return '"' + String(r[i] || '').trim().replace(/"/g, '""') + '"'; }).join(','); })
    .join('\n');
}
