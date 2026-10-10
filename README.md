# RainRoom

Tu sala de lluvia: cristal mojado en WebGL, sonidos mezclables y fondos propios.

## Probar en local
El audio se carga como archivo, así que hace falta un servidor (no vale abrir `index.html` con doble clic):

    npx serve .
    # o: python3 -m http.server 8080

## Subir a Vercel
Importa la carpeta como proyecto estático (sin build). `vercel.json` ya está incluido.

## Estructura
- `index.html`, `css/style.css`, `js/app.js`: la aplicación
- `assets/audio/rain.mp3`: grabación de lluvia en bucle
- `assets/scenes/`: reservado para fotos de fondo (el selector de salas llega en la fase 2)

## Antes de publicar con publicidad
Comprueba que tienes derechos comerciales sobre la grabación de lluvia y sobre cualquier foto que añadas (propias o con licencia que lo permita).
