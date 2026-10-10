/* RainRoom · widgets. Añadir uno = añadir un objeto a WIDGETS:
   name, cfg() → configuración por defecto, mount(el, cfg, api) → función de limpieza. api = {save, chime} */
const WIDGETS={
 clock:{name:"Reloj",cfg:()=>({}),mount(e){e.innerHTML='<div class="ck"></div><div class="cd"></div>';const t=e.firstChild,d=e.lastChild,
   fT=new Intl.DateTimeFormat("es-ES",{hour:"2-digit",minute:"2-digit"}),fD=new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long"});
  const f=()=>{const n=new Date();t.textContent=fT.format(n);d.textContent=fD.format(n)};f();const i=setInterval(f,5000);return()=>clearInterval(i)}},
 pomodoro:{name:"Pomodoro",cfg:()=>({work:25,rest:5}),mount(e,cfg,api){let ph="work",left=cfg.work*60,run=false,end=0;
  e.innerHTML='<div class="ph"></div><div class="pt"></div><div class="rw"><button data-a="m" aria-label="Menos tiempo">−</button><button data-a="s">Iniciar</button><button data-a="p" aria-label="Más tiempo">+</button><button data-a="r" aria-label="Reiniciar">↺</button></div>';
  const q=a=>e.querySelector(`[data-a="${a}"]`),T=e.querySelector(".pt"),P=e.querySelector(".ph");
  const draw=()=>{const s=Math.max(0,Math.ceil(left));T.textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");P.textContent=ph==="work"?"Concentración":"Descanso";q("s").textContent=run?"Pausar":"Iniciar"};
  const loop=()=>{if(!run)return;left=(end-Date.now())/1000;if(left<=0){ph=ph==="work"?"rest":"work";left=(ph==="work"?cfg.work:cfg.rest)*60;end=Date.now()+left*1000;api.chime()}draw()};
  const iv=setInterval(loop,250);
  q("s").onclick=()=>{run=!run;if(run)end=Date.now()+left*1000;draw()};
  q("r").onclick=()=>{run=false;ph="work";left=cfg.work*60;draw()};
  const adj=d=>()=>{if(run)return;cfg.work=Math.min(60,Math.max(5,cfg.work+d));if(ph==="work")left=cfg.work*60;draw();api.save()};
  q("m").onclick=adj(-5);q("p").onclick=adj(5);draw();return()=>clearInterval(iv)}},
 notes:{name:"Notas",cfg:()=>({text:""}),mount(e,cfg,api){e.innerHTML='<textarea placeholder="Escribe algo…" aria-label="Notas"></textarea>';const t=e.firstChild;t.value=cfg.text;let h;
  t.oninput=()=>{cfg.text=t.value;clearTimeout(h);h=setTimeout(api.save,400)};return()=>clearTimeout(h)}},
 breathe:{name:"Respirar",cfg:()=>({}),mount(e){e.innerHTML='<div class="br"><i></i></div><div class="bt"></div>';const c=e.querySelector("i"),t=e.querySelector(".bt");let s=0,h;
  c.style.transform="scale(.45)";
  const step=()=>{const inh=s%2===0;t.textContent=inh?"Inhala":"Exhala";c.style.transitionDuration=(inh?4:6)+"s";c.style.transform=inh?"scale(1)":"scale(.45)";s++;h=setTimeout(step,inh?4000:6000)};
  h=setTimeout(step,50);return()=>clearTimeout(h)}}};
