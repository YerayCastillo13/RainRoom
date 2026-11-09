# Licencias de los sonidos

Todos los audios externos proceden de [Freesound](https://freesound.org) y sus autores los publican con **Creative Commons Zero (CC0 1.0)**: dominio público, uso comercial permitido y sin obligación de atribución. La licencia se comprobó en la ficha de cada sonido el 8 de noviembre de 2026.

| Archivo en `assets/audio/` | Sonido | Autor | Ficha | Licencia |
|---|---|---|---|---|
| `traffic.mp3` | «Moderate traffic.» | Tom_Kaszuba | https://freesound.org/people/Tom_Kaszuba/sounds/669416/ | CC0 |
| `fire.mp3` | «Aachen_Burning Fireplace Crackling Fire Sounds.wav» | visionear | https://freesound.org/people/visionear/sounds/501417/ | CC0 |
| `wind.mp3` | «Wind blowing into some cactus spine, on the top of the mountain, in the desert of Atacama (Chile).» | felix.blume | https://freesound.org/people/felix.blume/sounds/156414/ | CC0 |
| `thunder.mp3` (siete truenos) | «Thunderstorm» | regosss | https://freesound.org/people/regosss/sounds/238295/ | CC0 |
| `thunder.mp3` (siete truenos) | «Lightning» | johnnydekk | https://freesound.org/people/johnnydekk/sounds/625354/ | CC0 |
| `rain.mp3` | «Two Hours of rain and soothing thunder» (tramo de 45 s, minutos 10:30–11:15 del original, sin truenos ni pájaros; filtrado de zumbidos graves) | Simon Spiers | https://freesound.org/people/Simon%20Spiers/sounds/662016/ | CC0 |

Guarda aquí una captura o PDF de cada ficha si quieres tener prueba de la licencia (las fichas pueden cambiar o desaparecer).

La lluvia anterior (`rain.mp3` de octubre de 2026) se sustituyó porque no se podía demostrar su origen; sigue en el historial de git por si quieres recuperarla.

## Cómo se prepararon
`node tools/build-audio.mjs <carpeta con los originales>` reproduce los archivos. Los originales usados son la vista previa de alta calidad (MP3) que Freesound publica sin iniciar sesión; si prefieres partir de los WAV originales, descárgalos con tu cuenta y vuelve a ejecutar el script.

- **Bucles** (`rain`, `traffic`, `fire`, `wind`): tramo estable de la grabación; el final se funde con el principio (potencia constante) para que el archivo enlace consigo mismo; igualados a −20 LUFS  con limitador de pico.
- **Truenos**: se recortan siete truenos sueltos de cada grabación, se normaliza el pico de cada uno a −3 dBFS y se encadenan en un solo archivo. `thunder.json` indica `[inicio, duración]` en segundos de cada uno.

## Fotos y vídeo de las salas
Falta documentar el origen y la licencia de `assets/scenes/*`.
