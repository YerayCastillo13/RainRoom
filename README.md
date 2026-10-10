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
- `js/rooms.js`: registro de salas (fondo + mezcla de sonidos); añadir una sala = añadir un objeto
- `assets/audio/rain.mp3`: grabación de lluvia en bucle
- `js/widgets.js`: registro de widgets (reloj, Pomodoro, notas, respirar); añadir uno = añadir un objeto
- `assets/scenes/`: fotos de fondo. Si existen `city.jpg`, `forest.jpg` o `lounge.jpg`, sustituyen al dibujo de esa sala (recomendado: 1600 px o más en el lado largo)

## Antes de publicar con publicidad
Comprueba que tienes derechos comerciales sobre la grabación de lluvia y sobre cualquier foto que añadas (propias o con licencia que lo permita).
