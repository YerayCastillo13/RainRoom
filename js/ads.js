/* RainRoom · publicidad.
   Por defecto está APAGADA: sin configurar no se muestra nada ni se carga ningún script de terceros.

   Para probar el diseño sin red publicitaria: abre la web con ?ads=demo (muestra marcadores de posición).
   Para activarla de verdad:
     1. Rellena CFG (enabled:true, client y slots de tu cuenta de AdSense).
     2. Integra un CMP certificado por Google (obligatorio en UE/Reino Unido/Suiza) y llama a RainAds.consent(true/false)
        con su respuesta. Mientras consentRequired sea true y no haya consentimiento, NO se carga ningún anuncio.
     3. Actualiza la política de privacidad y cookies (hoy dicen que no hay publicidad).

   Reglas de diseño (políticas de AdSense/AdMob):
     - El anuncio nunca bloquea el sonido ni los controles; se cierra con la X de su propia barra.
     - No es arrastrable y no se solapa con el dock ni con el panel.
     - Sin vídeo ni sonido. Desaparece cuando arranca el temporizador de dormir (html[data-sleep]).
     - No se pide ningún anuncio hasta que su contenedor esté visible. Cerrar el anuncio solo lo oculta en esta visita. */
(()=>{"use strict";
const CFG={enabled:false,provider:"adsense",client:"ca-pub-XXXXXXXXXXXXXXXX",slotRoom:"0000000000",slotSheet:"0000000001",consentRequired:true};
const demo=new URLSearchParams(location.search).get("ads")==="demo";
if(!CFG.enabled&&!demo)return;

const KEY="rainroom.consent";let consent=null;
try{consent=localStorage.getItem(KEY)}catch(e){}
const ok=()=>demo||!CFG.consentRequired||consent==="granted";

let sdk=null;
const loadSDK=()=>sdk||(sdk=new Promise((res,rej)=>{const s=document.createElement("script");s.async=true;s.crossOrigin="anonymous";
 s.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+encodeURIComponent(CFG.client);s.onload=res;s.onerror=rej;document.head.appendChild(s)}));

const filled=new WeakSet();
const fill=(box,slot,fmt)=>{if(filled.has(box)||!ok())return;filled.add(box);
 if(demo){box.innerHTML='<div class="adph">Anuncio de prueba<br>'+fmt+'</div>';return}
 loadSDK().then(()=>{const ins=document.createElement("ins");ins.className="adsbygoogle";ins.style.display="block";ins.style.width="100%";
  ins.setAttribute("data-ad-client",CFG.client);ins.setAttribute("data-ad-slot",slot);ins.setAttribute("data-ad-format",fmt);ins.setAttribute("data-full-width-responsive","false");
  box.appendChild(ins);try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}}).catch(()=>{box.closest("#adw,#adSheet").hidden=true})};

// Anuncio de la sala: aparece un instante después de entrar, en cada visita. Se cierra con su X.
const adw=document.getElementById("adw"),slot=document.getElementById("adSlot");
const showRoom=()=>{if(!adw||!ok())return;adw.hidden=false;fill(slot,CFG.slotRoom,"rectangle")};
document.getElementById("adx")?.addEventListener("click",()=>{adw.hidden=true});
setTimeout(showRoom,1200);

// Banner del panel de ajustes: solo se pide cuando el panel se abre por primera vez.
const sheet=document.getElementById("sheet"),as=document.getElementById("adSheet"),slot2=document.getElementById("adSlot2");
if(sheet&&as)new MutationObserver(()=>{if(sheet.classList.contains("open")&&ok()){as.hidden=false;fill(slot2,CFG.slotSheet,"horizontal")}}).observe(sheet,{attributes:true,attributeFilter:["class"]});

// Punto de entrada para el CMP: RainAds.consent(true) cuando el usuario acepta, false cuando rechaza.
window.RainAds={consent(v){consent=v?"granted":"denied";try{localStorage.setItem(KEY,consent)}catch(e){}if(v){showRoom();if(sheet&&sheet.classList.contains("open")){as.hidden=false;fill(slot2,CFG.slotSheet,"horizontal")}}else{adw.hidden=true;as.hidden=true}}};
})();
