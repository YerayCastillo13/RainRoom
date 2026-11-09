/* Dimrain · páginas superpuestas.
   Las guías, «Los sonidos», «Acerca de», «Contacto» y los textos legales se abren como una hoja sobre la sala, así el
   sonido no se corta. Los enlaces siguen siendo enlaces normales (href real): sin JavaScript, desde un buscador, con
   Ctrl/⌘/clic central o si algo falla, se abre la página completa de siempre.
   - Se descarga la página, se toma su <main> y su pie y se pintan dentro de un Shadow DOM con el CSS de las guías
     (guias/guias.css), de modo que no se mezclan con los estilos de la sala.
   - La URL cambia (pushState): el botón Atrás o el gesto de volver cierran la hoja y la sala sigue sonando.
   - Un enlace «Abrir esta mezcla» aplica la mezcla en la sala que ya suena (Dimrain.openMix) y cierra la hoja.
   - La publicidad de las páginas no se carga aquí (se quita su contenedor y no se ejecuta ningún script de la página). */
(()=>{"use strict";
const pg=document.getElementById("pg");
if(!pg||!window.fetch||!history.pushState||!pg.attachShadow)return;
const bar=pg.querySelector(".pgbar"),closeB=pg.querySelector(".pgx"),title=pg.querySelector(".pgt"),snd=pg.querySelector(".pgsnd"),
 box=pg.querySelector(".pgc"),bd=pg.querySelector(".pgbd"),sheetEl=pg.querySelector(".pgs");
const root=box.attachShadow({mode:"open"});
const PAGE=/^\/(guias|sonidos|acerca|contacto|legal)(\/|$)/,ASSET=/\.(?:css|js|png|jpe?g|webp|svg|mp3|mp4|json|xml|txt|webmanifest|ico)$/i;
const baseTitle=document.title,home=location.pathname+location.search;
const cache=new Map(),pending=new Map();
let css="",cssP=null,depth=0,tok=0,isOpen=false,opener=null,hideT=0;

/* CSS de las guías, adaptado al Shadow DOM (:root → :host, body → .pgw) */
const loadCss=()=>cssP||(cssP=fetch("/guias/guias.css").then(r=>r.ok?r.text():Promise.reject(0)).then(t=>{
 css=t.replace(/html\{[^}]*\}/g,"").replace(/:root\{/g,":host{").replace(/(^|\})\s*body\{/g,"$1.pgw{")
  +":host{display:block;color:var(--fg)}.pgw{min-height:0;background:none;padding:0 0 max(28px,env(safe-area-inset-bottom))}header{justify-content:flex-start;padding-top:14px}header nav{justify-content:flex-start}h1{margin-top:22px}";
}).catch(e=>{cssP=null;throw e}));

/* Descarga una página y se queda con lo que se va a mostrar */
const load=key=>{
 if(cache.has(key))return Promise.resolve(cache.get(key));
 if(pending.has(key))return pending.get(key);
 const p=Promise.all([fetch(key,{credentials:"same-origin"}),loadCss()]).then(async([r])=>{
  if(!r.ok||!(r.headers.get("content-type")||"").includes("html"))throw 0;
  const doc=new DOMParser().parseFromString(await r.text(),"text/html"),main=doc.querySelector("main");
  if(!main)throw 0;
  const clean=n=>{n.querySelectorAll("script,[data-ad],[data-privacy-options]").forEach(x=>x.remove());return n};
  const foot=doc.querySelector("footer"),nav=doc.querySelector("header nav"),t=(doc.title||"").trim();
  const d={path:new URL(r.url).pathname,title:t,label:t.replace(/\s*·\s*Dimrain\s*$/,"")||"Dimrain",
   main:clean(main.cloneNode(true)),foot:foot?clean(foot.cloneNode(true)):null,nav:nav?nav.cloneNode(true):null};
  cache.set(key,d);cache.set(d.path,d);return d;
 }).finally(()=>pending.delete(key));
 pending.set(key,p);return p;
};

const render=d=>{
 const st=document.createElement("style");st.textContent=css;
 const w=document.createElement("div");w.className="pgw";
 if(d.nav){const h=document.createElement("header");h.appendChild(d.nav.cloneNode(true));w.appendChild(h)}
 w.appendChild(d.main.cloneNode(true));
 if(d.foot)w.appendChild(d.foot.cloneNode(true));
 root.replaceChildren(st,w);
 box.scrollTop=0;title.textContent=d.label;document.title=d.title||baseTitle;
};

/* Mientras la hoja está abierta, el resto de la página no recibe foco ni lectores de pantalla */
const inertOthers=on=>[...document.body.children].forEach(el=>{
 if(el===pg||el.tagName==="SCRIPT"||el.tagName==="NOSCRIPT")return;
 if(on){if(!el.hasAttribute("inert")){el.setAttribute("inert","");el.dataset.pgi="1"}}
 else if(el.dataset.pgi){el.removeAttribute("inert");delete el.dataset.pgi}
});

const show=()=>{
 if(isOpen)return;
 isOpen=true;clearTimeout(hideT);
 const sh=document.getElementById("sheet");if(sh)sh.classList.remove("open");
 pg.hidden=false;inertOthers(true);
 snd.hidden=!(window.Dimrain&&window.Dimrain.playing());
 void pg.offsetWidth;pg.classList.add("on");
};
const hideNow=()=>{
 if(!isOpen)return;
 isOpen=false;depth=0;tok++;
 pg.classList.remove("on","drag");sheetEl.style.transform="";bd.style.opacity="";
 document.title=baseTitle;inertOthers(false);
 hideT=setTimeout(()=>{if(!isOpen){pg.hidden=true;root.replaceChildren()}},520);
 const o=opener&&document.contains(opener)?opener:document.getElementById("brand");opener=null;
 try{if(o)o.focus({preventScroll:true})}catch(e){}
};

/* Abrir una página (push=true: nueva entrada de historial; false: venimos de Atrás/Adelante) */
const open=async(path,push)=>{
 const my=++tok,slow=setTimeout(()=>{if(tok===my)box.setAttribute("aria-busy","true")},160);
 let d;
 try{d=await load(path)}
 catch(e){clearTimeout(slow);box.removeAttribute("aria-busy");if(tok===my)location.assign(path);return} // si falla, navegación normal
 clearTimeout(slow);box.removeAttribute("aria-busy");
 if(tok!==my)return;
 render(d);show();
 if(push){if(location.pathname!==d.path){depth++;history.pushState({dr:depth},"",d.path)}}
 else if(history.state&&history.state.dr)depth=history.state.dr;
 try{box.focus({preventScroll:true})}catch(e){}
};

/* Cerrar: se deshacen las entradas de historial que añadió la hoja (la sala no se recarga ni se corta el sonido) */
const close=()=>{
 if(!isOpen)return;
 tok++;
 if(depth>0){history.go(-depth);setTimeout(()=>{if(isOpen){history.replaceState(null,"",home);hideNow()}},700)}
 else hideNow();
};
addEventListener("popstate",e=>{
 const s=e.state;tok++;
 if(s&&s.dr&&PAGE.test(location.pathname))open(location.pathname,false);
 else if(isOpen)hideNow();
});

/* Clics en enlaces (de la sala y de dentro de la hoja) */
const route=(e,a)=>{
 if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 if((a.target&&a.target!=="_self")||a.hasAttribute("download"))return;
 let u;try{u=new URL(a.getAttribute("href"),location.href)}catch(x){return}
 if(u.origin!==location.origin)return;
 if(isOpen&&u.pathname===location.pathname&&u.hash&&!u.search){ // ancla dentro de la página
  e.preventDefault();const t=root.getElementById(decodeURIComponent(u.hash.slice(1)));if(t)t.scrollIntoView({block:"start"});return}
 if(u.pathname==="/"&&isOpen){ // «Abrir esta mezcla» / «Volver a la sala»
  e.preventDefault();
  if(u.searchParams.has("sala")&&!(window.Dimrain&&window.Dimrain.openMix(u.searchParams))){location.assign(u.href);return}
  close();return}
 if(PAGE.test(u.pathname)&&!ASSET.test(u.pathname)){
  e.preventDefault();if(!isOpen){opener=document.activeElement;if(!opener||opener===document.body)opener=a}
  open(u.pathname,true)}
};
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("a[href]");if(a)route(e,a)});
root.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("a[href]");if(a)route(e,a)});

/* Precarga al acercar el dedo o el ratón: así la hoja abre al instante */
const warm=e=>{const a=e.target.closest&&e.target.closest("a[href]");if(!a)return;
 try{const u=new URL(a.getAttribute("href"),location.href);if(u.origin===location.origin&&PAGE.test(u.pathname)&&!ASSET.test(u.pathname))load(u.pathname).catch(()=>{})}catch(x){}};
["pointerover","touchstart","focusin"].forEach(t=>document.addEventListener(t,warm,{passive:true}));

closeB.addEventListener("click",close);
bd.addEventListener("click",close);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&isOpen){e.preventDefault();close()}});

/* Arrastrar la barra hacia abajo para cerrar (móvil) */
let drag=null;
bar.addEventListener("pointerdown",e=>{if(e.target.closest(".pgx")||e.button>0)return;
 drag={y:e.clientY,t:performance.now(),dy:0};try{bar.setPointerCapture(e.pointerId)}catch(x){}pg.classList.add("drag")});
bar.addEventListener("pointermove",e=>{if(!drag)return;
 drag.dy=Math.max(0,e.clientY-drag.y);sheetEl.style.transform="translateY("+drag.dy+"px)";bd.style.opacity=String(Math.max(0,1-drag.dy/520))});
const endDrag=()=>{if(!drag)return;const{dy,t}=drag;drag=null;pg.classList.remove("drag");
 const v=dy/Math.max(1,performance.now()-t);
 if(dy>110||(v>.6&&dy>40))close();else{sheetEl.style.transform="";bd.style.opacity=""}};
bar.addEventListener("pointerup",endDrag);bar.addEventListener("pointercancel",endDrag);
})();
