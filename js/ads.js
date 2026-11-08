/* RainRoom · publicidad.
   Por defecto está APAGADA: sin configurar no se muestra nada ni se carga ningún script de terceros.

   Cómo activarla cuando tengas dominio y la cuenta de AdSense aprobada (ver PUBLICIDAD.md):
     node tools/configurar.mjs --dominio https://tudominio.com --client ca-pub-123… --slot-contenido 123… --activar

   Dónde se muestra (CFG.placements):
     - content: páginas con texto propio (guías, sonidos, acerca de). ENCENDIDO: es el sitio que AdSense admite sin problemas.
     - room:    widget flotante sobre la sala. APAGADO: una pantalla de aplicación sin texto editorial puede incumplir
                la política de AdSense («anuncios en pantallas sin contenido del editor»). Actívalo solo si Google lo acepta.
     - sheet:   banner en el panel de ajustes. APAGADO por la misma razón.

   Consentimiento (UE/Reino Unido/Suiza):
     - consent:"google"  → mensaje de consentimiento gratuito de Google (Funding Choices, certificado TCF). Se crea en
                           AdSense > Privacidad y mensajes. Aquí solo se carga su script; el anuncio respeta la decisión.
     - consent:"custom"  → tu propio CMP certificado: llama a RainAds.consent(true|false). Sin consentimiento no se carga nada.

   Reglas de diseño: el anuncio nunca bloquea el sonido ni los controles; sin vídeo ni sonido; desaparece al armar el
   temporizador de dormir (html[data-sleep]); no se pide ningún anuncio hasta que su contenedor esté visible.
   Para probar el diseño sin red publicitaria: abre cualquier página con ?ads=demo. */
(()=>{"use strict";
const CFG={enabled:false,client:"ca-pub-XXXXXXXXXXXXXXXX",
 slots:{content:"0000000000",room:"0000000001",sheet:"0000000002"},
 placements:{content:true,room:false,sheet:false},
 consent:"google"};
const demo=new URLSearchParams(location.search).get("ads")==="demo";
if(!CFG.enabled&&!demo)return;

const KEY="rainroom.consent";let consent=null;
try{consent=localStorage.getItem(KEY)}catch(e){}
const ok=()=>demo||CFG.consent==="google"||consent==="granted";
const on=p=>demo||CFG.placements[p];

const script=(src,attrs)=>new Promise((res,rej)=>{const s=document.createElement("script");s.async=true;s.src=src;for(const k in attrs||{})s.setAttribute(k,attrs[k]);s.onload=res;s.onerror=rej;document.head.appendChild(s)});

// Mensaje de consentimiento de Google (Funding Choices): se carga antes que los anuncios.
let cmp=null;
const loadCMP=()=>cmp||(cmp=CFG.consent!=="google"||demo?Promise.resolve():(()=>{
 const pub=CFG.client.replace(/^ca-/,"");
 const p=script("https://fundingchoicesmessages.google.com/i/"+encodeURIComponent(pub)+"?ers=1").catch(()=>{});
 const mark=()=>{if(window.frames.googlefcPresent)return;if(document.body){const f=document.createElement("iframe");f.style.cssText="width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;display:none";f.name="googlefcPresent";document.body.appendChild(f)}else setTimeout(mark,0)};
 mark();return p})());

let sdk=null;
const loadSDK=()=>sdk||(sdk=loadCMP().then(()=>script("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+encodeURIComponent(CFG.client),{crossorigin:"anonymous"})));

const filled=new WeakSet();
const fill=(box,slot,fmt,full)=>{if(!box||filled.has(box)||!ok())return;filled.add(box);
 if(demo){box.innerHTML='<div class="adph">Anuncio de prueba<br>'+fmt+'</div>';return}
 loadSDK().then(()=>{const ins=document.createElement("ins");ins.className="adsbygoogle";ins.style.display="block";ins.style.width="100%";
  ins.setAttribute("data-ad-client",CFG.client);ins.setAttribute("data-ad-slot",slot);ins.setAttribute("data-ad-format",fmt);ins.setAttribute("data-full-width-responsive",full?"true":"false");
  box.appendChild(ins);try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}}).catch(()=>{const w=box.closest("[data-ad],#adw,#adSheet");if(w)w.hidden=true})};

// Enlace «Preferencias de privacidad»: reabre el mensaje de consentimiento para cambiar la decisión.
document.querySelectorAll("[data-privacy-options]").forEach(a=>{a.hidden=false;a.addEventListener("click",e=>{e.preventDefault();
 if(CFG.consent==="google"){window.googlefc=window.googlefc||{};googlefc.callbackQueue=googlefc.callbackQueue||[];googlefc.callbackQueue.push({CONSENT_DATA_READY:()=>{try{googlefc.showRevocationMessage()}catch(x){}}})}
 else{consent=null;try{localStorage.removeItem(KEY)}catch(x){}location.reload()}})});

// Páginas de contenido: cada <aside data-ad="content"> se rellena cuando está a punto de verse.
if(on("content")){const boxes=[...document.querySelectorAll("[data-ad=content]")];
 const show=a=>{a.hidden=false;fill(a.querySelector(".adb"),CFG.slots.content,"auto",true)};
 if(boxes.length){if("IntersectionObserver" in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);show(e.target)}}),{rootMargin:"300px"});
  boxes.forEach(a=>{a.hidden=false;io.observe(a)})}else boxes.forEach(show)}}

// Sala: aparece un instante después de entrar. Se cierra con su X.
const adw=document.getElementById("adw"),sheet=document.getElementById("sheet"),as=document.getElementById("adSheet");
const showRoom=()=>{if(!adw||!on("room")||!ok())return;adw.hidden=false;fill(document.getElementById("adSlot"),CFG.slots.room,"rectangle")};
document.getElementById("adx")?.addEventListener("click",()=>{adw.hidden=true});
if(adw)setTimeout(showRoom,1200);

// Banner del panel de ajustes: solo se pide cuando el panel se abre.
const showSheet=()=>{if(!as||!on("sheet")||!ok())return;as.hidden=false;fill(document.getElementById("adSlot2"),CFG.slots.sheet,"horizontal")};
if(sheet&&as)new MutationObserver(()=>{if(sheet.classList.contains("open"))showSheet()}).observe(sheet,{attributes:true,attributeFilter:["class"]});

// Punto de entrada para un CMP propio (consent:"custom").
window.RainAds={consent(v){consent=v?"granted":"denied";try{localStorage.setItem(KEY,consent)}catch(e){}
 if(v){showRoom();if(sheet&&sheet.classList.contains("open"))showSheet();document.querySelectorAll("[data-ad=content]").forEach(a=>{a.hidden=false;fill(a.querySelector(".adb"),CFG.slots.content,"auto",true)})}
 else{if(adw)adw.hidden=true;if(as)as.hidden=true;document.querySelectorAll("[data-ad]").forEach(a=>a.hidden=true)}}};
})();
