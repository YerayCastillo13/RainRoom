(()=>{"use strict";
const $=s=>document.querySelector(s),clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rand=(a,b)=>a+Math.random()*(b-a),lerp=(a,b,t)=>a+(b-a)*t;
const KEY="rainroom.v4";let S={int:.7,room:"city",mix:{}};
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)))}catch(e){}
const save=()=>{S.mix=S.mix||{};S.mix[S.room]={snd:M.state(),int:S.int,w:stateW()};try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};

/* ---------- AUDIO ---------- */
let ctx,master,rainBuf=null,boomFn=null,uv=null;
const ensure=()=>{if(!ctx){ctx=new(window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=.9;uv=ctx.createGain();uv.gain.value=S.vol==null?1:S.vol;const cp=ctx.createDynamicsCompressor();cp.threshold.value=-14;cp.ratio.value=4;cp.attack.value=.01;cp.release.value=.3;master.connect(uv);uv.connect(cp);cp.connect(ctx.destination)}if(ctx.state==="suspended")ctx.resume();return ctx};
const bufs={};let rainP;
const noise=c=>{const n=c.sampleRate*5,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}const s=c.createBufferSource();s.buffer=b;s.loop=true;return s};
const wander=(c,p,base,dep,rate)=>{let a=true,t;const f=()=>{if(!a)return;p.setTargetAtTime(base+rand(-dep,dep),c.currentTime,rate);t=setTimeout(f,rand(400,1800))};f();return()=>{a=false;clearTimeout(t)}};
// Bucle sin cortes: cada pasada se funde con la siguiente (potencia constante)
const loopSample=(c,buf,out)=>{const F=Math.min(1.6,buf.duration/3),N=64,up=new Float32Array(N),dn=new Float32Array(N);
 for(let i=0;i<N;i++){const t=i/(N-1)*Math.PI/2;up[i]=Math.sin(t);dn[i]=Math.cos(t)}
 let alive=true,tm,srcs=[];
 const play=(w,first)=>{if(!alive)return;const s=c.createBufferSource(),g=c.createGain(),d=buf.duration;s.buffer=buf;s.connect(g).connect(out);
  if(first)g.gain.setValueAtTime(1,w);else g.gain.setValueCurveAtTime(up,w,F);
  g.gain.setValueCurveAtTime(dn,w+d-F,F);s.start(w);s.stop(w+d+.1);srcs.push(s);
  const nx=w+d-F;tm=setTimeout(()=>play(nx,false),Math.max(0,(nx-c.currentTime-1)*1000))};
 play(c.currentTime+.05,true);
 return()=>{alive=false;clearTimeout(tm);srcs.forEach(s=>{try{s.stop()}catch(e){}})}};
const SRC={
 rain:{l:"Lluvia",v:.7,f:"assets/audio/rain.mp3",i:'<path d="M7 15a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 15"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>',
  build(c,o){const n=noise(c),f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=900;n.connect(f).connect(o);n.start();return()=>{try{n.stop()}catch(e){}}}},
 thunder:{l:"Trueno",v:.3,i:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  build(c,o){const n=noise(c),f=c.createBiquadFilter(),g=c.createGain();f.type="lowpass";f.frequency.value=130;g.gain.value=0;n.connect(f).connect(g).connect(o);n.start();const boom=d=>{const w=c.currentTime+d;g.gain.cancelScheduledValues(c.currentTime);g.gain.setValueAtTime(0,w);g.gain.linearRampToValueAtTime(rand(.5,1),w+.12);g.gain.exponentialRampToValueAtTime(1e-4,w+rand(2.5,5.5))};boomFn=boom;return()=>{boomFn=null;try{n.stop()}catch(e){}}}},
 wind:{l:"Viento",v:.2,f:"assets/audio/wind.mp3",i:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  build(c,o){const n=noise(c),f=c.createBiquadFilter(),g=c.createGain();f.type="bandpass";f.frequency.value=420;f.Q.value=.5;g.gain.value=.5;n.connect(f).connect(g).connect(o);
   const a=wander(c,f.frequency,420,200,1.6),b=wander(c,g.gain,.5,.35,2.2);n.start();return()=>{a();b();try{n.stop()}catch(e){}}}}};
Object.assign(SRC,{
 fire:{l:"Chimenea",v:.5,f:"assets/audio/fire.mp3",i:'<path d="M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 3-7 .5 1.5 1.5 2 2 1.5z"/>',
  build(c,o){const n=noise(c),f=c.createBiquadFilter(),g=c.createGain();f.type="lowpass";f.frequency.value=380;g.gain.value=.5;n.connect(f).connect(g).connect(o);n.start();let a=true,t;
   const pop=()=>{if(!a)return;const s=c.createBufferSource(),b=c.createBuffer(1,c.sampleRate*.04,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);s.buffer=b;const q=c.createBiquadFilter(),h=c.createGain();q.type="bandpass";q.frequency.value=rand(1200,4500);q.Q.value=1.5;h.gain.value=rand(.15,.9);s.connect(q).connect(h).connect(o);s.start();t=setTimeout(pop,rand(40,500)*(Math.random()<.2?.2:1))};pop();
   return()=>{a=false;clearTimeout(t);try{n.stop()}catch(e){}}}},
 traffic:{l:"Tráfico",v:.35,f:"assets/audio/traffic.mp3",i:'<path d="M5 16l1.5-5h11L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5"/>',
  build(c,o){const n=noise(c),nb=n.buffer,f=c.createBiquadFilter(),g=c.createGain();f.type="lowpass";f.frequency.value=200;g.gain.value=.7;n.connect(f).connect(g).connect(o);n.start();
   const h=c.createBufferSource(),hb=c.createBiquadFilter(),hg=c.createGain();h.buffer=nb;h.loop=true;hb.type="bandpass";hb.frequency.value=1400;hb.Q.value=.5;hg.gain.value=.05;h.connect(hb).connect(hg).connect(o);h.start();
   const wd=wander(c,g.gain,.7,.25,2.5);let a=true,t;
   const car=()=>{if(!a)return;const w0=c.currentTime,d=rand(3,6),dir=Math.random()<.5?-1:1,e=c.createOscillator(),ef=c.createBiquadFilter(),tn=c.createBufferSource(),tb=c.createBiquadFilter(),m=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null,f0=rand(55,95);
    e.type="sawtooth";e.frequency.setValueAtTime(f0*1.12,w0);e.frequency.linearRampToValueAtTime(f0*.9,w0+d);ef.type="lowpass";ef.frequency.value=320;
    tn.buffer=nb;tn.loop=true;tb.type="bandpass";tb.Q.value=.8;tb.frequency.setValueAtTime(rand(1500,2100),w0);tb.frequency.linearRampToValueAtTime(rand(900,1200),w0+d);
    m.gain.setValueAtTime(0,w0);m.gain.linearRampToValueAtTime(rand(.5,1),w0+d*.5);m.gain.linearRampToValueAtTime(0,w0+d);
    e.connect(ef).connect(m);tn.connect(tb).connect(m);let out=m;if(p){p.pan.setValueAtTime(-dir*.8,w0);p.pan.linearRampToValueAtTime(dir*.8,w0+d);m.connect(p);out=p}out.connect(o);
    e.start(w0);tn.start(w0);e.stop(w0+d+.1);tn.stop(w0+d+.1);t=setTimeout(car,rand(1200,5000))};
   t=setTimeout(car,800);return()=>{a=false;wd();clearTimeout(t);[n,h].forEach(s=>{try{s.stop()}catch(x){}})}}}});
let unlocked=false;
const M={ch:{},
 init(){for(const k in SRC)this.ch[k]={v:SRC[k].v,on:false,stop:null,g:null}},
 start(k){const c=this.ch[k];if(c.stop)return;const a=ensure();c.g=a.createGain();c.g.gain.value=c.v;c.g.connect(master);c.stop=bufs[k]?loopSample(a,bufs[k],c.g):SRC[k].build(a,c.g)},
 halt(k){const c=this.ch[k];if(!c.stop)return;c.stop();c.stop=null;try{c.g.disconnect()}catch(e){}},
 set(k,on){this.ch[k].on=on;if(unlocked){on?this.start(k):this.halt(k);keepAlive()}},
 vol(k,v){const c=this.ch[k];c.v=v;if(c.g)c.g.gain.setTargetAtTime(v,ctx.currentTime,.06)},
 apply(m){for(const k in this.ch){const s=m[k]||{v:this.ch[k].v,on:false};this.vol(k,s.v);this.set(k,!!s.on&&s.v>0)}},
 resume(){unlocked=true;for(const k in this.ch)if(this.ch[k].on)this.start(k);keepAlive()},
 state(){const o={};for(const k in this.ch)o[k]={v:+this.ch[k].v.toFixed(2),on:this.ch[k].on};return o}};
rainP=Promise.all(Object.keys(SRC).filter(k=>SRC[k].f).map(k=>fetch(SRC[k].f).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>new Promise(res=>ensure().decodeAudioData(b,x=>{bufs[k]=x;res()},()=>res()))).catch(()=>{})));

/* ---------- INTERFAZ: dock + hoja de salas y mezcla (sliders grandes, sin arrastres) ---------- */
const roomDef=()=>ROOMS.concat([PHOTO]).find(r=>r.id===S.room)||ROOMS[0];
const dock=$("#dock"),sheet=$("#sheet"),tg={},mixEl={},rows={},thumbs={},imgs={};
const fillR=i=>i.style.setProperty("--p",(i.value-i.min)/(i.max-i.min)*100+"%");
const buzz=n=>{try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}};
// Control rápido de volumen: aparece al encender un sonido o al mantener pulsado su icono
const pop=$("#pop"),ps=pop.querySelector("input"),pnm=pop.querySelector("b"),pv=pop.querySelector("output");let popK=null,popT;
const hidePop=()=>{pop.classList.remove("show");popK=null};
const showPop=(k,b)=>{popK=k;pnm.textContent=SRC[k].l;const c=M.ch[k];ps.value=c.on?c.v:0;fillR(ps);pv.textContent=Math.round(ps.value*100)+"%";
 const r=b.getBoundingClientRect(),d=dock.getBoundingClientRect(),w=Math.min(300,innerWidth-24);pop.style.width=w+"px";pop.style.left=clamp(r.left+r.width/2-w/2,12,innerWidth-w-12)+"px";pop.style.bottom=(innerHeight-d.top+10)+"px";
 pop.classList.add("show");clearTimeout(popT);popT=setTimeout(hidePop,2800)};
ps.oninput=()=>{if(!popK)return;const v=+ps.value;M.vol(popK,v);M.set(popK,v>.02);pv.textContent=Math.round(v*100)+"%";syncUI(true);clearTimeout(popT);popT=setTimeout(hidePop,2800)};ps.onchange=save;
const tapSound=(k,b)=>{const c=M.ch[k],on=!c.on;if(on&&c.v<.05)M.vol(k,SRC[k].v);M.set(k,on);buzz(8);syncUI();save();if(on)showPop(k,b);else hidePop()};
const setTab=i=>{document.querySelectorAll(".pn").forEach((p,j)=>p.classList.toggle("on",i===j));document.querySelectorAll("#tabs button").forEach((b,j)=>b.setAttribute("aria-selected",i===j));$("#tind").style.transform=`translateX(${i*100}%)`;S.tab=i};
const buildTabs=()=>{document.querySelectorAll("#tabs button").forEach((b,i)=>b.onclick=()=>setTab(i));$("#brand").onclick=()=>{setTab(0);sheet.classList.add("open")};setTab(S.tab||0);
 const mv=$("#mv"),sv=()=>{$("#mvv").textContent=Math.round(mv.value*100)+"%";fillR(mv)};mv.value=S.vol==null?1:S.vol;sv();
 mv.oninput=()=>{S.vol=+mv.value;if(uv)uv.gain.setTargetAtTime(S.vol,ctx.currentTime,.05);sv()};mv.onchange=save;
 const PRESETS=[{n:"Suave",m:{rain:.4,wind:.12},i:.45},{n:"Tormenta",m:{rain:.85,thunder:.6,wind:.35},i:.95},{n:"Concentración",m:{rain:.45,traffic:.18},i:.5},{n:"Dormir",m:{rain:.35,fire:.2},i:.35}];
 PRESETS.forEach(p=>{const b=document.createElement("button");b.className="chip";b.textContent=p.n;b.onclick=()=>{buzz(8);for(const k in SRC){const v=p.m[k];M.vol(k,v||M.ch[k].v);M.set(k,!!v)}S.int=p.i;syncUI();save()};$("#pres").appendChild(b)})};
const buildUI=()=>{
 for(const k in SRC){const b=document.createElement("button");b.className="snd";b.setAttribute("aria-label",SRC[k].l);b.innerHTML=`<svg viewBox="0 0 24 24">${SRC[k].i}</svg>`;
  let lp=0,long=false;
  b.onpointerdown=()=>{long=false;clearTimeout(lp);lp=setTimeout(()=>{long=true;buzz(12);showPop(k,b)},420)};
  b.onpointerup=()=>{clearTimeout(lp);if(!long)tapSound(k,b)};
  b.onpointerleave=b.onpointercancel=()=>clearTimeout(lp);
  b.oncontextmenu=e=>e.preventDefault();
  b.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tapSound(k,b)}};
  dock.appendChild(b);tg[k]=b;
  const r=document.createElement("div");r.className="row";
  r.innerHTML=`<button class="ic" aria-label="Activar o silenciar ${SRC[k].l}"><svg viewBox="0 0 24 24">${SRC[k].i}</svg></button><div class="rc"><div class="rt"><span>${SRC[k].l}</span><output></output></div><input type="range" min="0" max="1" step=".01" aria-label="Volumen de ${SRC[k].l}"></div>`;
  const inp=r.querySelector("input");rows[k]=r;
  inp.oninput=()=>{const v=+inp.value;M.vol(k,v);M.set(k,v>.02);syncUI(true)};inp.onchange=save;
  r.querySelector(".ic").onclick=()=>{const c=M.ch[k],on=!c.on;if(on&&c.v<.05)M.vol(k,SRC[k].v);M.set(k,on);buzz(8);syncUI();save()};
  $("#mix").appendChild(r);mixEl[k]=inp}
 const m=document.createElement("button");m.className="snd";m.setAttribute("aria-label","Salas y mezcla");m.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>';
 m.onclick=()=>sheet.classList.add("open");dock.appendChild(m);$("#shClose").onclick=()=>sheet.classList.remove("open");
 document.addEventListener("input",e=>{if(e.target.type==="range")fillR(e.target)});
 const hd=$("#shHead");let sy=0,dy=0,t0=0,dg=false;
 hd.onpointerdown=e=>{if(e.target.closest(".x,#tabs button"))return;dg=true;sy=e.clientY;dy=0;t0=performance.now();hd.setPointerCapture(e.pointerId);sheet.style.transition="none"};
 hd.onpointermove=e=>{if(!dg)return;dy=Math.max(0,e.clientY-sy);sheet.style.transform=`translate(-50%,${dy}px)`};
 hd.onpointerup=hd.onpointercancel=()=>{if(!dg)return;dg=false;sheet.style.transition="";sheet.style.transform="";if(dy>90||dy/(performance.now()-t0)>.6)sheet.classList.remove("open")};};
const renderRooms=()=>{const box=$("#rooms");box.innerHTML="";
 for(const r of photo?ROOMS.concat([PHOTO]):ROOMS){const b=document.createElement("button");b.className="card"+(r.id===S.room?" on":"");
  let c=thumbs[r.id];if(!c){c=thumbs[r.id]=document.createElement("canvas");c.width=160;c.height=200;const x=c.getContext("2d");
   const im=r.id==="photo"?photo:imgs[r.id];if(im){const k=Math.max(160/im.width,200/im.height);x.drawImage(im,(160-im.width*k)/2,(200-im.height*k)/2,im.width*k,im.height*k)}else r.draw(x,160,200)}
  const cc=document.createElement("canvas");cc.width=160;cc.height=200;cc.getContext("2d").drawImage(c,0,0);
  const sp=document.createElement("span");sp.textContent=r.name;b.append(cc,sp);b.onclick=()=>{if(r.id!==S.room){buzz(10);selectRoom(r.id)}};box.appendChild(b)}
 const a=document.createElement("button");a.className="card add";a.setAttribute("aria-label","Usar tu propia foto");a.innerHTML="<i>+</i><span>Tu foto</span>";a.onclick=()=>$("#file").click();box.appendChild(a)};
const syncUI=light=>{for(const k in SRC){const c=M.ch[k],v=c.on?c.v:0;tg[k].classList.toggle("on",c.on);tg[k].style.setProperty("--v",v);rows[k].classList.toggle("off",!c.on);rows[k].querySelector("output").textContent=Math.round(v*100)+"%";
  if(light!==true||document.activeElement!==mixEl[k]){mixEl[k].value=v;fillR(mixEl[k])}}
 if(light!==true){$("#int").value=S.int;$("#intv").textContent=S.int<.05?"Sin lluvia":Math.round(S.int*100)+"%";$("#rn").textContent=roomDef().name;renderRooms();syncW();fillR($("#int"))}};
const selectRoom=(id,first)=>{const go=()=>{S.room=id;const d=roomDef(),m=S.mix[id];curFx=d.fx||{};msMeta();S.int=m?m.int:d.int;M.apply(m?m.snd:d.mix);vid=vids[id]||null;for(const k in vids)if(vids[k]!==vid)vids[k].pause();if(vid)vid.play().catch(()=>{});buildScene();sizeDrops();loadW(m&&m.w?m.w:d.w||{});syncUI();save()};
 if(first)return go();$("#veil").classList.add("on");setTimeout(()=>{go();$("#veil").classList.remove("on")},380)};

/* ---------- ESCENA DE FONDO ---------- */
// Escena procedural: ciudad de noche con luces desenfocadas. Se dibuja nítida;
// el shader la empaña y las gotas dejan ver la versión nítida refractada.


/* ---------- WEBGL ---------- */
const cv=$("#gl"),gl=cv.getContext("webgl",{antialias:false,alpha:false})||cv.getContext("experimental-webgl");
if(!gl){$("#msg").textContent="Este navegador no admite WebGL";return}
const VS="attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}";
// uS = escena nítida, uB = escena desenfocada, uD = mapa de gotas (R,G = normal, B = cristal limpio)
const FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;uniform sampler2D uS,uB,uD;uniform vec2 uP;uniform float uF,uL,uT,uK,uM;uniform vec2 uR;uniform vec4 uG;uniform vec3 uGc;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),f.x),f.y);}
void main(){
 vec2 bg=(v-.5)*.84+.5+uP*.06;
 vec4 d=texture2D(uD,v);
 vec2 n=(d.rg-.5)*2.;float nl=min(length(n),1.);
 float clr=smoothstep(.2,.6,d.b);
 float hz=fract(sin(dot(floor(v*uR*.5),vec2(12.9898,78.233)))*43758.5453);vec3 fog=mix(texture2D(uS,bg).rgb,texture2D(uB,bg+(hz-.5)*.003).rgb,uF)*mix(.9,.88+.1*hz,uF)+.015;
 vec2 o=n*.065;vec3 sh=vec3(texture2D(uS,clamp(bg-o*1.05,0.,1.)).r,texture2D(uS,clamp(bg-o,0.,1.)).g,texture2D(uS,clamp(bg-o*.95,0.,1.)).b);
 vec3 c=mix(fog,sh,clr);
 vec2 L=normalize(vec2(-.5,-.7));float lit=dot(n,L),rim=smoothstep(.5,1.,nl);
 c+=vec3(.85,.92,1.)*pow(max(lit,0.),3.)*rim*.4;
 c-=pow(max(-lit,0.),2.)*rim*.3*clr;
 c+=(1.-smoothstep(0.,.22,distance(n,L*.55)))*.9*clr;
 c+=vec3(.6,.7,.8)*(1.-smoothstep(0.,.5,distance(n,-L*.5)))*.12*clr*step(.05,nl);
 float ms=vn(bg*vec2(3.,2.)+vec2(uK*.03,uK*.012))*.6+vn(bg*vec2(7.,4.)-vec2(uK*.05,0.))*.4;c+=vec3(.55,.65,.78)*ms*ms*uM*(.25+.75*(1.-clr));vec2 gp=bg-uG.xy;gp.x*=uR.x/uR.y;float fl=.72+.28*vn(vec2(uK*5.,3.))+.1*sin(uK*17.);c+=uGc*uG.w*fl*exp(-dot(gp,gp)/(uG.z*uG.z));vec2 q=v-.5;c*=1.-.45*dot(q,q);
 vec3 bl=texture2D(uB,bg).rgb;c+=pow(max(bl-.3,0.),vec3(1.4))*.55*(.85+.15*sin(uK*1.2+vn(bg*6.)*6.28));c+=c*uL*1.4+bl*uL*.35;float gr=fract(sin(dot(v*997.+uT,vec2(12.9898,78.233)))*43758.5453);c+=(gr-.5)*.035;gl_FragColor=vec4(c,1.);}`;
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const ap=gl.getAttribLocation(pr,"p");gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,2,gl.FLOAT,false,0,0);
const mk=u=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,t);
 [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]].forEach(q=>gl.texParameteri(gl.TEXTURE_2D,q[0],q[1]));return t};
const upl=(u,t,src)=>{gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src)};
const tS=mk(0),tB=mk(1),tD=mk(2);
["uS","uB","uD"].forEach((n,i)=>gl.uniform1i(gl.getUniformLocation(pr,n),i));
const uP=gl.getUniformLocation(pr,"uP"),uF=gl.getUniformLocation(pr,"uF"),uL=gl.getUniformLocation(pr,"uL"),uT=gl.getUniformLocation(pr,"uT"),uR=gl.getUniformLocation(pr,"uR"),uK=gl.getUniformLocation(pr,"uK"),uM=gl.getUniformLocation(pr,"uM"),uG=gl.getUniformLocation(pr,"uG"),uGc=gl.getUniformLocation(pr,"uGc");

let W,H,photo=null,vid=null,vf=false;const vids={};const useVid=()=>{vid=vids[S.room]||null;for(const k in vids)if(vids[k]!==vid)vids[k].pause();if(vid)vid.play().catch(()=>{});buildScene()};
const sc=document.createElement("canvas"),bc=document.createElement("canvas");
const buildScene=()=>{const L=vid?960:1536,sw=W>=H?L:Math.round(L*W/H),sh2=W>=H?Math.round(L*H/W):L;sc.width=sw;sc.height=sh2;const c=sc.getContext("2d");
 const im=S.room==="photo"?photo:imgs[S.room];if(im){const k=Math.max(sw/im.width,sh2/im.height),pw=im.width*k,ph=im.height*k;c.drawImage(im,(sw-pw)/2,(sh2-ph)/2,pw,ph)}else roomDef().draw(c,sw,sh2);
 bc.width=Math.max(8,Math.round(sw/14));bc.height=Math.max(8,Math.round(sh2/14));const b=bc.getContext("2d");b.imageSmoothingQuality="high";b.drawImage(sc,0,0,bc.width,bc.height);
 if(vid)vidFrame();else{upl(0,tS,sc);upl(1,tB,bc)}};

const vidFrame=()=>{if(!vid||vid.readyState<2)return;const c=sc.getContext("2d"),sw=sc.width,sh=sc.height,k=Math.max(sw/vid.videoWidth,sh/vid.videoHeight),pw=vid.videoWidth*k,ph=vid.videoHeight*k;
 c.drawImage(vid,(sw-pw)/2,(sh-ph)/2,pw,ph);bc.getContext("2d").drawImage(sc,0,0,bc.width,bc.height);upl(0,tS,sc);upl(1,tB,bc)};
/* ---------- GOTAS (simulación en CPU → mapa de normales) ---------- */
const spr=document.createElement("canvas");spr.width=spr.height=64;
{const x=spr.getContext("2d"),id=x.createImageData(64,64);
 for(let j=0;j<64;j++)for(let i=0;i<64;i++){const dx=(i-31.5)/32,dy=(j-31.5)/32,d=Math.hypot(dx,dy),o=(j*64+i)*4;
  if(d<1){const k=Math.pow(d,.2);id.data[o]=128+127*dx*k;id.data[o+1]=128+127*dy*k;id.data[o+2]=255;const t=clamp((1-d)/.18,0,1);id.data[o+3]=255*t*t*(3-2*t)}}
 x.putImageData(id,0,0)}
const wet=document.createElement("canvas"),dcv=document.createElement("canvas"),wc=wet.getContext("2d"),dc=dcv.getContext("2d");
let B=[],ds=1,fadeT=0,frameN=0;
const spawn=(x,y,r)=>B.push({x,y,r,v:0,a:rand(.85,1.2),lim:rand(3.4,5.6),dead:false});
const sizeDrops=()=>{ds=clamp(960/Math.max(W,H),.5,1)*[1,.85,.7][qual];wet.width=dcv.width=Math.round(W*ds);wet.height=dcv.height=Math.round(H*ds);
 wc.fillStyle="rgb(128,128,0)";wc.fillRect(0,0,wet.width,wet.height);B=[];
 for(let i=0;i<110;i++)spawn(rand(0,wet.width),rand(0,wet.height),.9+Math.pow(Math.random(),2.4)*5)};
let acc=0;
const sim=dt=>{const I=S.int,cap=I<.05?0:lerp(90,340,I)*[1,.6,.35][qual],w=wet.width,h=wet.height;
 acc+=I<.05?0:dt*lerp(3,60,I);while(acc>1){acc--;spawn(rand(0,w),rand(0,h),.9+Math.pow(Math.random(),2.4)*5)}
 for(const b of B){if(b.v===0){if(b.r>b.lim||Math.random()<dt*.012*I*b.r)b.v=.4}
  else{const y0=b.y;b.v=clamp(b.v+((.6+b.r*.45)-b.v)*dt*3+(Math.random()-.5)*.3,.1,4.5);if(Math.random()<dt*.7)b.v*=.25;
   b.y+=b.v*dt*60;b.x+=Math.sin(b.y*.07)*.15;b.r-=dt*.12;
   wc.lineCap="round";wc.strokeStyle="rgba(128,128,255,.4)";wc.lineWidth=b.r*2;wc.beginPath();wc.moveTo(b.x,y0);wc.lineTo(b.x,b.y);wc.stroke();
   wc.strokeStyle="rgb(128,128,255)";wc.lineWidth=b.r*1.2;wc.stroke();
   if(Math.random()<dt*2.5&&B.length<cap+40)spawn(b.x+rand(-b.r,b.r)*.5,b.y-rand(2,10),rand(.6,1.1));
   if(b.r<1.5)b.v=0}
  if(b.y>h+10)b.dead=true}
 // fusión: una gota que resbala absorbe las que toca; las quietas se funden cada pocos fotogramas
 frameN++;
 for(let i=0;i<B.length;i++){const a=B[i];if(a.dead||(a.v===0&&frameN%6))continue;
  for(let j=0;j<B.length;j++){const o=B[j];if(i===j||o.dead||(a.v===0&&o.v>0))continue;
   const dx=a.x-o.x,dy=a.y-o.y,m=(a.r+o.r)*.8;if(dx*dx+dy*dy<m*m&&(a.r>=o.r)){a.r=Math.min(9,Math.hypot(a.r,o.r*.9));o.dead=true}}}
 B=B.filter(b=>!b.dead);if(B.length>cap)B.splice(0,B.length-cap);
 fadeT+=dt;if(fadeT>.4){fadeT=0;wc.fillStyle="rgba(128,128,0,.05)";wc.fillRect(0,0,w,h)}};
const compose=()=>{dc.drawImage(wet,0,0);for(const b of B){const s=b.v>0?Math.min(1,b.v/2):0,w=2*b.r*(1-.15*s),h=2*b.r*(1+.55*s);const ww=w*b.a;dc.drawImage(spr,b.x-ww/2,b.y-h/2,ww,h)}};

/* ---------- WIDGETS: una instancia por tipo y sala, arrastrables, posición guardada en proporción ---------- */
const wl=$("#wl"),wi={},wchip={};
const chime=()=>{const c=ensure(),t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=660;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.25,t+.02);g.gain.exponentialRampToValueAtTime(1e-4,t+1.6);o.connect(g).connect(master);o.start(t);o.stop(t+1.7)};
/* ---------- MODO NOCHE ----------
   iOS silencia el audio web con el interruptor de silencio y lo suspende al bloquear la pantalla, salvo que la página
   se comporte como reproductor: sesión de audio "playback" + <audio> silencioso en bucle + controles de pantalla de bloqueo. */
let sleepEnd=0,sleepTm,wlk=null,paused=[];
const wavBlob=(n,sr)=>{const d=new DataView(new ArrayBuffer(44+n*2)),s=(o,t)=>[...t].forEach((c,i)=>d.setUint8(o+i,c.charCodeAt(0)));
 s(0,"RIFF");d.setUint32(4,36+n*2,true);s(8,"WAVEfmt ");d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,sr,true);d.setUint32(28,sr*2,true);d.setUint16(32,2,true);d.setUint16(34,16,true);s(36,"data");d.setUint32(40,n*2,true);
 for(let i=0;i<n;i++)d.setInt16(44+i*2,i%2?1:-1,true);return new Blob([d],{type:"audio/wav"})};
const ka=new Audio();ka.loop=true;ka.setAttribute("playsinline","");ka.src=URL.createObjectURL(wavBlob(8000,8000));
try{if(navigator.audioSession)navigator.audioSession.type="playback"}catch(e){}
const hasMS="mediaSession"in navigator;
const anyOn=()=>Object.keys(M.ch).some(k=>M.ch[k].on);
const keepAlive=()=>{if(anyOn()){const p=ka.play();if(p&&p.catch)p.catch(()=>{});if(hasMS)navigator.mediaSession.playbackState="playing"}else{ka.pause();if(hasMS)navigator.mediaSession.playbackState="paused"}};
const msMeta=()=>{if(hasMS&&typeof MediaMetadata!=="undefined")navigator.mediaSession.metadata=new MediaMetadata({title:"RainRoom",artist:roomDef().name,album:"Tu sala"})};
if(hasMS){try{navigator.mediaSession.setActionHandler("pause",()=>{paused=Object.keys(M.ch).filter(k=>M.ch[k].on);paused.forEach(k=>M.set(k,false));syncUI()});
 navigator.mediaSession.setActionHandler("play",()=>{ka.play().catch(()=>{});(paused.length?paused:["rain"]).forEach(k=>{if(M.ch[k].v<.05)M.vol(k,SRC[k].v);M.set(k,true)});paused=[];syncUI()})}catch(e){}}
const revive=()=>{if(ctx&&unlocked&&anyOn()&&ctx.state!=="running")ctx.resume().catch(()=>{});if(sleepEnd&&Date.now()>=sleepEnd)sleepDone()};
document.addEventListener("visibilitychange",revive);addEventListener("pageshow",revive);setInterval(revive,3000);
// Temporizador de sueño: el fundido se programa en el reloj de audio, así se apaga aunque iOS frene los temporizadores de la página
const sleepDone=()=>{sleepEnd=0;fadeOut(25)};
const sleepArm=m=>{const c=ensure();sleepEnd=Date.now()+m*60000;clearTimeout(sleepTm);sleepTm=setTimeout(sleepDone,m*60000);master.gain.cancelScheduledValues(c.currentTime);master.gain.setValueAtTime(.9,c.currentTime+m*60);master.gain.linearRampToValueAtTime(0,c.currentTime+m*60+25)};
const sleepCancel=()=>{sleepEnd=0;clearTimeout(sleepTm);if(ctx){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(.9,ctx.currentTime,.1)}};
const fadeOut=s=>{const c=ensure();master.gain.cancelScheduledValues(c.currentTime);master.gain.setTargetAtTime(0,c.currentTime,s/4);$("#veil").classList.add("sl");setTimeout(()=>{for(const k in M.ch)M.set(k,false);master.gain.cancelScheduledValues(ctx.currentTime);master.gain.value=.9;syncUI();save()},s*1000)};
// Pantalla encendida (Wake Lock) y modo noche (atenuado + 30 fps para gastar menos batería)
const setWake=async on=>{try{if(on&&navigator.wakeLock&&!wlk){wlk=await navigator.wakeLock.request("screen");wlk.onrelease=()=>{wlk=null}}else if(!on&&wlk){await wlk.release();wlk=null}}catch(e){}};
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&S.wake&&!wlk)setWake(true)});
const nchip={};
const applyNight=()=>{$("#veil").classList.toggle("night",!!S.night);nchip.n.classList.toggle("on",!!S.night);nchip.w.classList.toggle("on",!!S.wake)};
const buildN=()=>{[["n","Modo noche"],["w","Pantalla encendida"]].forEach(([k,t])=>{const b=document.createElement("button");b.className="chip";b.textContent=t;
 b.onclick=()=>{if(k==="n")S.night=!S.night;else{S.wake=!S.wake;setWake(S.wake)}applyNight();save()};$("#nsel").appendChild(b);nchip[k]=b});applyNight()};
const placeW=o=>{o.el.style.left=o.x*Math.max(0,W-o.el.offsetWidth)+"px";o.el.style.top=o.y*Math.max(0,H-o.el.offsetHeight-96)+"px"};
const addW=(t,st)=>{if(wi[t]||!WIDGETS[t])return;const d=WIDGETS[t],o=wi[t]={x:st&&st.x!=null?st.x:.08,y:st&&st.y!=null?st.y:.14,cfg:Object.assign(d.cfg(),st&&st.cfg)};
 const e=o.el=document.createElement("section");e.className="wd";e.setAttribute("aria-label",d.name);wl.appendChild(e);o.un=d.mount(e,o.cfg,{save,chime,fadeOut,sleepArm,sleepCancel,sleepEnd:()=>sleepEnd})||(()=>{});placeW(o);
 const x=document.createElement("button");x.className="wx";x.textContent="×";x.setAttribute("aria-label","Quitar "+d.name);x.onclick=()=>{buzz(8);closeW(t)};e.appendChild(x);
 e.onpointerdown=ev=>{if(ev.target.closest("button,textarea,input"))return;const r=e.getBoundingClientRect(),dx=ev.clientX-r.left,dy=ev.clientY-r.top;e.setPointerCapture(ev.pointerId);e.classList.add("d");
  e.onpointermove=m=>{o.x=clamp((m.clientX-dx-wl.getBoundingClientRect().left)/Math.max(1,W-e.offsetWidth),0,1);o.y=clamp((m.clientY-dy-wl.getBoundingClientRect().top)/Math.max(1,H-e.offsetHeight-96),0,1);placeW(o)};
  e.onpointerup=e.onpointercancel=()=>{e.onpointermove=null;e.classList.remove("d");save()}}};
const delW=t=>{const o=wi[t];if(!o)return;o.un();o.el.remove();delete wi[t]};
const closeW=t=>{const o=wi[t];if(!o)return;delete wi[t];o.un();o.el.classList.add("out");setTimeout(()=>o.el.remove(),240);syncW();save()};
const loadW=w=>{Object.keys(wi).forEach(delW);for(const t in w)addW(t,w[t])};
const stateW=()=>{const o={};for(const t in wi)o[t]={x:+wi[t].x.toFixed(3),y:+wi[t].y.toFixed(3),cfg:wi[t].cfg};return o};
const syncW=()=>{for(const t in wchip)wchip[t].classList.toggle("on",!!wi[t])};
const buildW=()=>{for(const t in WIDGETS){const b=document.createElement("button");b.className="chip";b.textContent=WIDGETS[t].name;b.onclick=()=>{buzz(8);if(wi[t])closeW(t);else{addW(t);syncW();save()}};$("#wsel").appendChild(b);wchip[t]=b}};

/* ---------- PARALAJE ---------- */
const par={tx:0,ty:0,x:0,y:0};
window.addEventListener("pointermove",e=>{par.tx=e.clientX/W*2-1;par.ty=e.clientY/H*2-1});
const gyro=async()=>{try{if(typeof DeviceOrientationEvent!=="undefined"&&DeviceOrientationEvent.requestPermission&&await DeviceOrientationEvent.requestPermission()!=="granted")return;
 window.addEventListener("deviceorientation",e=>{if(e.gamma==null)return;par.tx=clamp(e.gamma/30,-1,1);par.ty=clamp((e.beta-45)/30,-1,1)})}catch(e){}};

/* ---------- BUCLE ---------- */
let last=0,nextFl=4,strike=-99,fogV=.8,curFx={};const lf=s=>s<0?0:Math.max(Math.exp(-s*10),s>.17?.8*Math.exp(-(s-.17)*6):0);
let fc=0,qual=0,fa=.016,qT=0;
const frame=t=>{if(S.night&&(fc++&1)){requestAnimationFrame(frame);return}if(vid&&(vf=!vf))vidFrame();const dt=Math.min(.05,last?(t-last)/1000:.016);last=t;
 fa=fa*.97+dt*.03;if(t-qT>4000&&fa>(S.night?.06:.032)&&qual<2){qual++;qT=t;fa=.016;resize();requestAnimationFrame(frame);return}
 par.x=lerp(par.x,par.tx+Math.sin(t/7000)*.3,.06);par.y=lerp(par.y,par.ty+Math.cos(t/9000)*.2,.06);wl.style.transform=`translate3d(${(-par.x*7).toFixed(1)}px,${(-par.y*5).toFixed(1)}px,0)`;
 nextFl-=dt;if(nextFl<=0){const on=M.ch.thunder.on&&boomFn;nextFl=on?rand(7,18):2;if(on){strike=t/1e3;boomFn(rand(.8,3))}}
 sim(dt);compose();upl(2,tD,dcv);
 gl.uniform2f(uP,par.x,par.y);fogV=lerp(fogV,S.int<.05?0:.7+.2*S.int,.04);gl.uniform1f(uF,fogV);gl.uniform1f(uL,lf(t/1e3-strike));gl.uniform1f(uT,(t%1e4)/1e3);gl.uniform1f(uK,t/1e3);gl.uniform1f(uM,curFx.mist||0);const gg=curFx.glow||{x:0,y:0,r:1,s:0,c:[0,0,0]};gl.uniform4f(uG,gg.x,gg.y,gg.r,gg.s);gl.uniform3f(uGc,gg.c[0],gg.c[1],gg.c[2]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(frame)};

/* ---------- FOTO PROPIA (se guarda en el dispositivo si el navegador lo permite) ---------- */
const idb=(m,v)=>new Promise(r=>{try{const q=indexedDB.open("rainroom",1);q.onupgradeneeded=()=>q.result.createObjectStore("k");q.onerror=()=>r(null);
 q.onsuccess=()=>{const s=q.result.transaction("k",m==="get"?"readonly":"readwrite").objectStore("k"),x=m==="get"?s.get("photo"):m==="put"?s.put(v,"photo"):s.delete("photo");x.onsuccess=()=>r(x.result);x.onerror=()=>r(null)}}catch(e){r(null)}});
const setPhoto=(blob,sel)=>new Promise(res=>{const im=new Image();im.onload=()=>{photo=im;delete thumbs.photo;$("#fabX").style.display="flex";sel?selectRoom("photo"):(buildScene(),renderRooms());res(true)};im.onerror=()=>res(false);im.src=URL.createObjectURL(blob)});
$("#fabP").onclick=()=>$("#file").click();
$("#file").onchange=async e=>{const f=e.target.files[0];if(f&&await setPhoto(f,true))idb("put",f)};
$("#fabX").onclick=()=>{photo=null;delete thumbs.photo;$("#fabX").style.display="none";if(S.room==="photo")selectRoom("city");else renderRooms();idb("del")};

/* ---------- ARRANQUE ---------- */
const resize=()=>{const d=Math.min(devicePixelRatio||1,[2,1.5,1][qual]);W=innerWidth;H=innerHeight;cv.width=Math.round(W*d);cv.height=Math.round(H*d);gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(uR,cv.width,cv.height);buildScene();sizeDrops()};
addEventListener("resize",()=>{resize();for(const t in wi)placeW(wi[t])});
M.init();buildUI();buildW();buildN();buildTabs();const rg=$("#int");rg.oninput=()=>{S.int=+rg.value;$("#intv").textContent=S.int<.05?"Sin lluvia":Math.round(S.int*100)+"%"};rg.onchange=save;
let idle;const wake=()=>{$("#ui").classList.remove("h");$("#veil").classList.remove("sl");clearTimeout(idle);idle=setTimeout(()=>{if(!sheet.classList.contains("open"))$("#ui").classList.add("h")},5000)};
addEventListener("pointerdown",wake);addEventListener("pointermove",wake);wake();
const unlock=()=>{removeEventListener("pointerdown",unlock);ensure();ka.play().catch(()=>{});if(S.tip)$("#msg").style.opacity=0;else{$("#msg").textContent="Toca un sonido para activarlo · mantén pulsado para ajustar su volumen";S.tip=1;save();setTimeout(()=>{$("#msg").style.opacity=0},4500)}gyro();if(S.wake)setWake(true);rainP.then(()=>{M.resume();syncUI();msMeta()})};
addEventListener("pointerdown",unlock);
addEventListener("pagehide",save);if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});document.addEventListener("pointerdown",e=>{if(popK&&!pop.contains(e.target)&&!e.target.closest("#dock"))hidePop();if(sheet.classList.contains("open")&&!sheet.contains(e.target)&&!e.target.closest("#dock"))sheet.classList.remove("open")});
{let sx=0,sy=0,st=0;cv.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY;st=performance.now()});
 cv.addEventListener("pointerup",e=>{const dx=e.clientX-sx;if(Math.abs(dx)>80&&Math.abs(e.clientY-sy)<70&&performance.now()-st<700){const L=photo?ROOMS.concat([PHOTO]):ROOMS,i=L.findIndex(r=>r.id===S.room);buzz(10);selectRoom(L[(i+(dx<0?1:-1)+L.length)%L.length].id)}})}
resize();selectRoom(S.room,true);ROOMS.forEach(r=>{if(r.src){const im=new Image();im.onload=()=>{imgs[r.id]=im;delete thumbs[r.id];if(S.room===r.id)buildScene();renderRooms()};im.src=r.src}
 if(r.video){const v=document.createElement("video");v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute("playsinline","");v.preload="auto";v.onloadeddata=()=>{vids[r.id]=v;if(S.room===r.id)useVid()};v.src=r.video}});idb("get").then(b=>{if(b)setPhoto(b)});requestAnimationFrame(frame);
})();
