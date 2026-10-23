# Puerta Matinée — control de entrada

App para que varias personas en la puerta marquen quién entra, y todos lo vean al instante.
Funciona en Android y iPhone desde el navegador, sin pasar por las tiendas (igual que el Kiosko).

## Puesta en marcha (una sola vez, ~15 min)

### 1. Firebase (proyecto kiosco-liceo, ya configurado en index.html)
El Kiosko y Tiburones usan Realtime Database; esta app usa **Firestore**, así que no los toca.

1. Consola Firebase → **Authentication → Método de acceso → Anónimo → Habilitar**.
2. **Firestore Database → Crear base de datos** → ubicación `southamerica-east1` → modo producción.
3. **Firestore → Reglas** → pegá el contenido de `firestore.rules` → Publicar.
4. En `index.html` (arriba del script), cambiá `pinPuerta` y `pinAdmin` por los que quieras.

### 2. GitHub Pages
1. Creá un repo nuevo en tu cuenta Shengpa, por ejemplo `puerta-matinee`.
2. Subí todos los archivos de esta carpeta (index.html, manifest.json, sw.js, los dos íconos).
3. Settings → Pages → Branch `main` / root → Save.
4. Queda en `https://shengpa.github.io/puerta-matinee/`.

### 3. Crear el evento y conectar la planilla de Drive
1. Abrí esa dirección, tocá **Soy organizador** y poné el PIN de organizador.
2. En Drive, abrí la planilla (tiene que ser una **Hoja de cálculo de Google**; si es un Excel subido,
   abrilo y hacé *Archivo → Guardar como Hojas de cálculo de Google*).
3. **Compartir → Acceso general → Cualquier persona con el enlace → Lector → Copiar vínculo.**
4. En la app: ⚙️ → **Lista desde Drive** → pegá el link → **Leer planilla** → revisá qué columna es
   Nombre, Apellido, DNI y el dato extra → **Conectar y cargar**.
5. Listo: todos los celulares revisan la planilla cada 2 minutos y agregan solos a los que se suman.
   Nunca pisa a los que ya entraron. Si alguien se borra de la planilla, en la app queda (se borra a mano desde ⚙️).
   Solo se suben las columnas elegidas: teléfonos, mails y comprobantes no salen de la planilla.

**Consejo de privacidad:** la planilla compartida con enlace la puede abrir cualquiera que tenga ese link.
Lo ideal es una planilla aparte solo con nombre, DNI y "invitado de", por ejemplo con
`=IMPORTRANGE("link de la planilla del Form"; "Respuestas!C:G")` o copiando esas columnas,
y conectar esa en la app. El link de la planilla no queda en el código: se guarda dentro del evento.

Si no hay Drive a mano, en ⚙️ está **Importar un archivo Excel/CSV** como alternativa.

### 4. El equipo de puerta
1. ⚙️ → **Compartir link** → mandalo por WhatsApp solo al equipo de puerta, con el PIN de puerta.
2. Cada uno abre el link, pone el PIN y su nombre ("Puerta - Gaby").
3. Para que quede como app:
   - **iPhone (Safari):** botón Compartir → *Agregar a pantalla de inicio*.
   - **Android (Chrome):** menú ⋮ → *Agregar a pantalla principal* / *Instalar app*.

## En la noche
- Buscás por nombre o DNI, tocás a la persona → **MARCAR INGRESO**. Todos los celulares lo ven en 1–2 segundos.
- Si alguien ya había entrado, la app avisa con la hora y quién lo marcó.
- **＋ Venta en puerta**: carga a quien paga ahí ($20.000 por defecto) y lo marca adentro. Arriba se ve cuántas ventas y cuánta plata.
- **Sin señal:** se puede seguir marcando. Arriba aparece "SIN SEÑAL"; los ingresos se suben solos cuando vuelve.
  (Ojo: mientras un celular no tiene señal, los demás no ven lo que marca ese.)
- Al final: ⚙️ → **Descargar planilla de asistencia**.

## Antes del 31: probá
Hacé un ensayo con 2 o 3 celulares y una lista de prueba, y dejá que los de puerta se familiaricen.
Para empezar de cero con la lista real, el organizador puede crear un evento nuevo: borrá los datos del sitio en el navegador (o abrilo en una ventana privada), "Soy organizador" otra vez, y compartí el link nuevo.

## Seguridad y datos
La lista tiene nombres de chicos de 12 a 15 años, así que:
- Solo se sube nombre, DNI (si elegís esa columna) y un dato extra.
- La lista solo se puede leer conociendo el link del evento; no lo publiques en grupos abiertos ni redes.
- Los PIN son una traba liviana (se pueden ver en el código), no una seguridad fuerte.
- Después de la fiesta, borrá la colección `eventos` en Firestore.

## Modo demo
Agregando `?demo` al final de la dirección (`…/puerta-matinee/?demo`) la app funciona sin Firebase y guarda solo en ese navegador. Sirve para mostrarla o practicar sin tocar la lista real.
