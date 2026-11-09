# Dimrain

Tu sala de lluvia: cristal mojado en WebGL, sonidos mezclables y fondos propios.

## Probar en local
El audio se carga como archivo, así que hace falta un servidor (no vale abrir `index.html` con doble clic):

    npx serve .
    # o: python3 -m http.server 8080

## Publicar
Es una web estática (sin build). Hoy está en Cloudflare (Worker con archivos estáticos conectado a GitHub); `_headers` lleva las cabeceras de caché. También vale Vercel (`vercel.json` incluido) o cualquier hosting estático.

## Estructura
- `index.html`, `css/style.css`, `js/app.js`: la aplicación
- `js/rooms.js`: registro de salas (fondo + mezcla de sonidos); añadir una sala = añadir un objeto
- `assets/audio/`: `rain.mp3`, `wind.mp3`, `fire.mp3`, `traffic.mp3` (bucles sin cortes de 45-60 s), `thunder.mp3` + `thunder.json` (14 truenos sueltos y dónde empieza cada uno). Si un archivo falta, se usa el sonido sintético. Origen y licencias en `LICENCIAS.md`; se regeneran con `tools/build-audio.mjs`
- `acerca/`, `sonidos/`, `contacto/`, `guias/`, `legal/`: páginas de contenido (necesarias para AdSense). `js/ads.js` y `tools/configurar.mjs`: publicidad y dominio, ver `PUBLICIDAD.md`
- `js/widgets.js`: registro de widgets (reloj, dormir, intención); añadir uno = añadir un objeto
- `assets/scenes/`: fotos de fondo. Si existen `city.jpg`, `forest.jpg` o `lounge.jpg`, sustituyen al dibujo de esa sala (recomendado: 1600 px o más en el lado largo)

## Antes de publicar con publicidad
Sigue `PUBLICIDAD.md`. Los sonidos están documentados en `LICENCIAS.md`; faltan por documentar las fotos y vídeos de las salas.

## Modo noche (iPhone)
Para que suene con el interruptor de silencio y con la pantalla bloqueada: abre la web desde HTTPS (Cloudflare, Vercel u otro hosting), toca la pantalla una vez y, mejor aún, usa Compartir > "Añadir a pantalla de inicio".
Prueba: 1) interruptor en silencio, 2) bloquear la pantalla, 3) usar los controles de la pantalla de bloqueo.

## Fondos (la mayor palanca de realismo)
- Foto: `assets/scenes/city.jpg`, `forest.jpg`, `lounge.jpg` (1600 px o más en el lado largo).
- Vídeo en bucle: `assets/scenes/city.mp4`, `forest.mp4`, `lounge.mp4` (720p, sin audio, 10-20 s, idealmente < 8 MB). Si existe, sustituye a la foto y el cristal se aplica por encima. La foto sirve de miniatura y de respaldo.
- Licencias: usa solo material propio o con licencia que permita uso comercial.

## Lista antes de lanzar
- Aviso legal, política de privacidad y cookies; si hay publicidad en la UE, consentimiento previo.
- Nombre y dominio: Dimrain (dimrain.com). Comprobado en TMView (UE y EE. UU.) sin marcas idénticas; DIMRAN (EE. UU., clase 9, accesorios físicos) es la más parecida. Pendiente: búsqueda oficial en EUIPO/USPTO y compra del dominio.
- Probar en iPhone (Safari y app instalada), Android (Chrome) y escritorio (Chrome, Safari, Firefox).
