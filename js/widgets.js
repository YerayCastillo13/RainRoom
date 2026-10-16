/* RainRoom · widgets. Añadir uno = añadir un objeto a WIDGETS:
   name, cfg() → configuración por defecto, mount(el, cfg, api) → función de limpieza. api = {save, chime, fadeOut} */
const WIDGETS={
 clock:{name:"Reloj",cfg:()=>({}),mount(e){e.innerHTML='<div class="ck"></div><div class="cd"></div>';const t=e.firstChild,d=e.lastChild,
   fT=new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit"}),fD=new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long"});
  const f=()=>{const n=new Date();t.textContent=fT.format(n);d.textContent=fD.format(n)};f();const i=setInterval(f,5000);return()=>clearInterval(i)}},
 sleep:{name:"Dormir",cfg:()=>({}),mount(e,cfg,api){e.innerHTML='<div class="ph">Apagar en</div><div class="pt">—</div><div class="rw"></div>';
  const T=e.querySelector(".pt"),R=e.querySelector(".rw");let on=false;
  const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
  const mk=(t,fn,l)=>{const b=document.createElement("button");b.textContent=t;if(l)b.setAttribute("aria-label",l);b.onclick=fn;R.appendChild(b)};
  const draw=()=>{const end=api.sleepEnd();if(!R.firstChild||(!!end)!==on){on=!!end;R.innerHTML="";if(on)mk("Cancelar",()=>{api.sleepCancel();draw()});else[15,30,60,90].forEach(m=>mk(m,()=>{api.sleepArm(m);draw()},m+" minutos"))}
   T.textContent=end?fmt(Math.max(0,Math.ceil((end-Date.now())/1000))):"—"};
  draw();const iv=setInterval(draw,1000);return()=>clearInterval(iv)}},
 intent:{name:"Intención",cfg:()=>({text:""}),mount(e,cfg,api){e.innerHTML='<div class="ph">Hoy</div><input maxlength="60" placeholder="¿Qué toca hoy?" aria-label="Intención del día">';
  const t=e.querySelector("input");t.value=cfg.text;let h;t.oninput=()=>{cfg.text=t.value;clearTimeout(h);h=setTimeout(api.save,400)};return()=>clearTimeout(h)}}};
