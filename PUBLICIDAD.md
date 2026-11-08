# Publicidad: qué está listo y qué falta

La web ya está preparada para AdSense. La publicidad está **apagada** (`js/ads.js`, `enabled:false`): no se carga ningún script de terceros hasta que la actives.

## Ya hecho en el código
- **Contenido propio y visible** que AdSense exige: 3 guías originales + 1 nueva (`/guias/chimenea-y-lluvia`), `/sonidos/` (qué es cada sonido, cómo mezclarlo, autores), `/acerca/` (qué es + preguntas frecuentes) y `/contacto/`.
- **Anuncios solo donde hay texto**: bloques `data-ad="content"` en guías, sonidos y acerca de. El widget sobre la sala y el banner de ajustes existen pero están **apagados** (`placements.room/sheet:false`), porque una pantalla de aplicación sin texto puede incumplir la política de AdSense. Actívalos solo si lo aceptan (`--sala`, `--ajustes`).
- **Consentimiento**: `consent:"google"` carga el mensaje gratuito de Google (Funding Choices, certificado TCF) y el enlace «Preferencias de privacidad» del pie lo reabre. Hay que crearlo en la cuenta (ver abajo).
- **Textos legales** de privacidad y cookies ya describen AdSense, cookies de terceros, consentimiento y cómo cambiarlo.
- `ads.txt` (con plantilla), `sitemap.xml` con todas las páginas, enlaces a legales y contacto en el pie, `LICENCIAS.md` con el origen de cada sonido.
- `?ads=demo` en cualquier página muestra marcadores de posición para ver cómo quedan los anuncios.

## Lo que depende de ti
1. **Dominio propio** (AdSense no suele aprobar `*.vercel.app`). Al tenerlo: `node tools/configurar.mjs --dominio https://tudominio.com` actualiza canonical, og:url, JSON-LD, sitemap, robots y textos legales.
2. **Rellenar** `[TU NOMBRE]` y `[TU EMAIL]` en `legal/privacidad.html`, `legal/aviso-legal.html` y `contacto/index.html` (están resaltados). Sin identificar al titular, AdSense y la ley lo ven mal.
3. **Alta como autónomo/empresa** si vas a cobrar (consúltalo con una gestoría).
4. **Solicitar AdSense** con el dominio ya publicado y las páginas indexadas (Search Console). Suele tardar de días a semanas; mejor con algo de tráfico.
5. En AdSense: **Privacidad y mensajes → Consentimiento europeo → crear y publicar el mensaje**. Crea un **bloque de anuncios responsive** y copia su ID.
6. Ejecuta: `node tools/configurar.mjs --client ca-pub-… --slot-contenido 1234567890 --activar` (también escribe `ads.txt`).
7. **Sube la constante `V` de `sw.js`** (p. ej. `rr-v8`) y despliega.
8. Vigila el informe de AdSense el primer mes (clics accidentales, tráfico no válido).

## Pendiente de documentar
- Origen y licencia de las fotos/vídeos de `assets/scenes/` (ver `LICENCIAS.md`).
