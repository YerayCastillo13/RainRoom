/* RainRoom · configura el dominio y la publicidad en todo el proyecto de una vez.

   Cambiar de dominio (canonical, og:url, JSON-LD, sitemap, robots, textos legales):
     node tools/configurar.mjs --dominio https://tudominio.com

   Activar AdSense (cuando la cuenta esté aprobada):
     node tools/configurar.mjs --client ca-pub-1234567890123456 --slot-contenido 1111111111 --activar
     (opcionales: --slot-sala 2222222222 --slot-ajustes 3333333333 --sala --ajustes para mostrarlos)

   Se pueden combinar. Sin argumentos, muestra el estado actual. */
import {readFileSync,writeFileSync,readdirSync,statSync} from "node:fs";
import {join,extname} from "node:path";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("..",import.meta.url));
const args=process.argv.slice(2),opt=n=>{const i=args.indexOf("--"+n);return i<0?null:(args[i+1]&&!args[i+1].startsWith("--")?args[i+1]:true)};
const walk=d=>readdirSync(d).flatMap(f=>{if([".git","node_modules",".claude","assets","tools"].includes(f))return[];const p=join(d,f);return statSync(p).isDirectory()?walk(p):[p]});
const files=walk(root).filter(f=>[".html",".xml",".txt",".webmanifest",".md",".js",".json"].includes(extname(f))&&!/PLAN-LANZAMIENTO|package/.test(f));
const adsPath=join(root,"js","ads.js");
let ads=readFileSync(adsPath,"utf8");
const cur=(readFileSync(join(root,"robots.txt"),"utf8").match(/Sitemap:\s*(https?:\/\/[^/\s]+)/)||[])[1];

if(!args.length){console.log("Dominio actual:",cur);console.log("AdSense:",/enabled:true/.test(ads)?"ACTIVO":"apagado",(ads.match(/client:"([^"]+)"/)||[])[1]);process.exit(0)}

const dom=opt("dominio");
if(dom&&dom!==true){const nd=dom.replace(/\/+$/,"");if(!/^https:\/\/[a-z0-9.-]+$/i.test(nd)){console.error("Dominio no válido. Ejemplo: https://tudominio.com");process.exit(1)}
 let n=0;for(const f of files){const s=readFileSync(f,"utf8");if(s.includes(cur)){writeFileSync(f,s.split(cur).join(nd));n++}}
 // LICENCIAS/README no llevan dominio; ads.js tampoco. Actualiza también los textos que citan el host sin https://.
 const host=cur.replace("https://",""),nh=nd.replace("https://","");
 for(const f of files){const s=readFileSync(f,"utf8");if(s.includes(host)){writeFileSync(f,s.split(host).join(nh));n++}}
 console.log("Dominio:",cur,"→",nd,`(${n} cambios de archivo)`);ads=readFileSync(adsPath,"utf8")}

const client=opt("client");
if(client&&client!==true){if(!/^ca-pub-\d{10,20}$/.test(client)){console.error("El client debe parecerse a ca-pub-1234567890123456");process.exit(1)}
 ads=ads.replace(/client:"[^"]*"/,`client:"${client}"`);
 writeFileSync(join(root,"ads.txt"),`google.com, ${client.replace("ca-","")}, DIRECT, f08c47fec0942fa0\n`);console.log("ads.txt escrito para",client.replace("ca-",""))}
for(const [k,key] of [["slot-contenido","content"],["slot-sala","room"],["slot-ajustes","sheet"]]){const v=opt(k);
 if(v&&v!==true){if(!/^\d{6,15}$/.test(v)){console.error("--"+k+" debe ser el ID numérico del bloque");process.exit(1)}
  ads=ads.replace(new RegExp(key+':"[^"]*"(?=[,}])'),`${key}:"${v}"`)}}
if(opt("sala"))ads=ads.replace(/room:(true|false)\}/,"room:true}").replace(/(placements:\{[^}]*?)room:(true|false)/,"$1room:true");
if(opt("ajustes"))ads=ads.replace(/(placements:\{[^}]*?)sheet:(true|false)/,"$1sheet:true");
if(opt("activar")){if(/XXXXXXXX/.test(ads)){console.error("Primero indica --client ca-pub-…");process.exit(1)}ads=ads.replace(/enabled:(true|false)/,"enabled:true");console.log("Publicidad ACTIVADA")}
if(opt("desactivar")){ads=ads.replace(/enabled:(true|false)/,"enabled:false");console.log("Publicidad apagada")}
writeFileSync(adsPath,ads);
console.log("Hecho. Recuerda subir una versión nueva del service worker (sw.js, constante V) para que los visitantes reciban los cambios.");
