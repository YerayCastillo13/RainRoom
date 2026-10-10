(()=>{"use strict";
const $=s=>document.querySelector(s),clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rand=(a,b)=>a+Math.random()*(b-a),lerp=(a,b,t)=>a+(b-a)*t;
const KEY="rainroom.v4";let S={int:.7,room:"city",mix:{}};
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)))}catch(e){}
const save=()=>{S.mix=S.mix||{};S.mix[S.room]={snd:M.state(),int:S.int};try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};

/* ---------- AUDIO ---------- */
let ctx,master,rainBuf=null,boomFn=null;
const ensure=()=>{if(!ctx){ctx=new(window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=.9;master.connect(ctx.destination)}if(ctx.state==="suspended")ctx.resume();return ctx};
const rainP=fetch("assets/audio/rain.mp3").then(r=>r.arrayBuffer()).then(b=>new Promise(res=>ensure().decodeAudioData(b,x=>{rainBuf=x;res()},()=>res()))).catch(()=>{});
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
 rain:{l:"Lluvia",v:.7,i:'<path d="M7 15a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 15"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2"/>',
  build(c,o){if(rainBuf)return loopSample(c,rainBuf,o);const n=noise(c),f=c.createBiquadFilter();f.type="lowpass";f.frequency.value=900;n.connect(f).connect(o);n.start();return()=>{try{n.stop()}catch(e){}}}},
 thunder:{l:"Trueno",v:.3,i:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  build(c,o){const n=noise(c),f=c.createBiquadFilter(),g=c.createGain();f.type="lowpass";f.frequency.value=130;g.gain.value=0;n.connect(f).connect(g).connect(o);n.start();const boom=d=>{const w=c.currentTime+d;g.gain.cancelScheduledValues(c.currentTime);g.gain.setValueAtTime(0,w);g.gain.linearRampToValueAtTime(rand(.5,1),w+.12);g.gain.exponentialRampToValueAtTime(1e-4,w+rand(2.5,5.5))};boomFn=boom;return()=>{boomFn=null;try{n.stop()}catch(e){}}}},
 wind:{l:"Viento",v:.2,i:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  build(c,o){const n=noise(c),f=c.createBiquadFilter(),g=c.createGain();f.type="bandpass";f.frequency.value=420;f.Q.value=.5;g.gain.value=.5;n.connect(f).connect(g).connect(o);
   const a=wander(c,f.frequency,420,200,1.6),b=wander(c,g.gain,.5,.35,2.2);n.start();return()=>{a();b();try{n.stop()}catch(e){}}}}};
Object.assign(SRC,{
 fire:{l:"Chimenea",v:.5,i:'<path d="M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 3-7 .5 1.5 1.5 2 2 1.5z"/>',
  build(c,o){const n=noise(c),f=c.createBiquadFilter(),g=c.createGain();f.type="lowpass";f.frequency.value=380;g.gain.value=.5;n.connect(f).connect(g).connect(o);n.start();let a=true,t;
   const pop=()=>{if(!a)return;const s=c.createBufferSource(),b=c.createBuffer(1,c.sampleRate*.04,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);s.buffer=b;const q=c.createBiquadFilter(),h=c.createGain();q.type="bandpass";q.frequency.value=rand(1200,4500);q.Q.value=1.5;h.gain.value=rand(.15,.9);s.connect(q).connect(h).connect(o);s.start();t=setTimeout(pop,rand(40,500)*(Math.random()<.2?.2:1))};pop();
   return()=>{a=false;clearTimeout(t);try{n.stop()}catch(e){}}}},
 traffic:{l:"Tráfico",v:.35,i:'<path d="M5 16l1.5-5h11L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5"/>',
  build(c,o){const n=noise(c),f=c.createBiquadFilter(),g=c.createGain();f.type="lowpass";f.frequency.value=260;g.gain.value=.6;n.connect(f).connect(g).connect(o);n.start();const wd=wander(c,g.gain,.6,.3,2.5);let a=true,t;
   const pass=()=>{if(!a)return;const s=noise(c),b=c.createBiquadFilter(),h=c.createGain(),w0=c.currentTime,d=rand(2,4);b.type="bandpass";b.Q.value=2;b.frequency.setValueAtTime(rand(300,500),w0);b.frequency.linearRampToValueAtTime(rand(700,1100),w0+d);h.gain.setValueAtTime(0,w0);h.gain.linearRampToValueAtTime(rand(.5,1),w0+d*.45);h.gain.linearRampToValueAtTime(0,w0+d);s.connect(b).connect(h).connect(o);s.start(w0);s.stop(w0+d+.1);t=setTimeout(pass,rand(3000,9000))};t=setTimeout(pass,1500);
   return()=>{a=false;wd();clearTimeout(t);try{n.stop()}catch(e){}}}}});
let unlocked=false;
const M={ch:{},
 init(){for(const k in SRC)this.ch[k]={v:SRC[k].v,on:false,stop:null,g:null}},
 start(k){const c=this.ch[k];if(c.stop)return;const a=ensure();c.g=a.createGain();c.g.gain.value=c.v;c.g.connect(master);c.stop=SRC[k].build(a,c.g)},
 halt(k){const c=this.ch[k];if(!c.stop)return;c.stop();c.stop=null;try{c.g.disconnect()}catch(e){}},
 set(k,on){this.ch[k].on=on;if(unlocked)on?this.start(k):this.halt(k)},
 vol(k,v){const c=this.ch[k];c.v=v;if(c.g)c.g.gain.setTargetAtTime(v,ctx.currentTime,.06)},
 apply(m){for(const k in this.ch){const s=m[k]||{v:this.ch[k].v,on:false};this.vol(k,s.v);this.set(k,!!s.on&&s.v>0)}},
 resume(){unlocked=true;for(const k in this.ch)if(this.ch[k].on)this.start(k)},
 state(){const o={};for(const k in this.ch)o[k]={v:+this.ch[k].v.toFixed(2),on:this.ch[k].on};return o}};

/* ---------- INTERFAZ: dock + hoja de salas y mezcla (sliders grandes, sin arrastres) ---------- */
const roomDef=()=>ROOMS.concat([PHOTO]).find(r=>r.id===S.room)||ROOMS[0];
const dock=$("#dock"),sheet=$("#sheet"),tg={},mixEl={},thumbs={};
const buildUI=()=>{
 for(const k in SRC){const b=document.createElement("button");b.className="snd";b.setAttribute("aria-label",SRC[k].l);b.innerHTML=`<svg viewBox="0 0 24 24">${SRC[k].i}</svg>`;
  b.onclick=()=>{const c=M.ch[k],on=!c.on;if(on&&c.v<.05)M.vol(k,SRC[k].v);M.set(k,on);syncUI();save()};dock.appendChild(b);tg[k]=b;
  const r=document.createElement("label");r.className="row";r.innerHTML=`<svg viewBox="0 0 24 24">${SRC[k].i}</svg><span>${SRC[k].l}</span><input type="range" min="0" max="1" step=".01" aria-label="Volumen de ${SRC[k].l}">`;
  const inp=r.querySelector("input");inp.oninput=()=>{const v=+inp.value;M.vol(k,v);M.set(k,v>.02);tg[k].classList.toggle("on",v>.02)};inp.onchange=save;$("#mix").appendChild(r);mixEl[k]=inp}
 const m=document.createElement("button");m.className="snd";m.setAttribute("aria-label","Salas y mezcla");m.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>';
 m.onclick=()=>sheet.classList.add("open");dock.appendChild(m);$("#shClose").onclick=()=>sheet.classList.remove("open")};
const renderRooms=()=>{const box=$("#rooms");box.innerHTML="";
 for(const r of photo?ROOMS.concat([PHOTO]):ROOMS){const b=document.createElement("button");b.className="card"+(r.id===S.room?" on":"");
  let c=thumbs[r.id];if(!c){c=thumbs[r.id]=document.createElement("canvas");c.width=160;c.height=200;const x=c.getContext("2d");
   if(r.id==="photo"){const k=Math.max(160/photo.width,200/photo.height);x.drawImage(photo,(160-photo.width*k)/2,(200-photo.height*k)/2,photo.width*k,photo.height*k)}else r.draw(x,160,200)}
  const cc=document.createElement("canvas");cc.width=160;cc.height=200;cc.getContext("2d").drawImage(c,0,0);
  const sp=document.createElement("span");sp.textContent=r.name;b.append(cc,sp);b.onclick=()=>{if(r.id!==S.room)selectRoom(r.id)};box.appendChild(b)}};
const syncUI=()=>{for(const k in SRC){tg[k].classList.toggle("on",M.ch[k].on);mixEl[k].value=M.ch[k].on?M.ch[k].v:0}$("#int").value=S.int;renderRooms()};
const selectRoom=(id,first)=>{const go=()=>{S.room=id;const d=roomDef(),m=S.mix[id];S.int=m?m.int:d.int;M.apply(m?m.snd:d.mix);buildScene();sizeDrops();syncUI();save()};
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
varying vec2 v;uniform sampler2D uS,uB,uD;uniform vec2 uP;uniform float uF,uL,uT;
void main(){
 vec2 bg=(v-.5)*.9+.5+uP*.04;
 vec4 d=texture2D(uD,v);
 vec2 n=(d.rg-.5)*2.;float nl=min(length(n),1.);
 float clr=smoothstep(.2,.6,d.b);
 vec3 fog=mix(texture2D(uS,bg).rgb,texture2D(uB,bg).rgb,uF)*.9+.015;
 vec2 o=n*.055;vec3 sh=vec3(texture2D(uS,clamp(bg-o*1.05,0.,1.)).r,texture2D(uS,clamp(bg-o,0.,1.)).g,texture2D(uS,clamp(bg-o*.95,0.,1.)).b);
 vec3 c=mix(fog,sh,clr);
 vec2 L=normalize(vec2(-.5,-.7));float lit=dot(n,L),rim=smoothstep(.5,1.,nl);
 c+=vec3(.85,.92,1.)*pow(max(lit,0.),3.)*rim*.4;
 c-=pow(max(-lit,0.),2.)*rim*.3*clr;
 c+=(1.-smoothstep(0.,.22,distance(n,L*.55)))*.9*clr;
 c+=vec3(.6,.7,.8)*(1.-smoothstep(0.,.5,distance(n,-L*.5)))*.12*clr*step(.05,nl);
 vec2 q=v-.5;c*=1.-.45*dot(q,q);
 vec3 bl=texture2D(uB,bg).rgb;c+=pow(max(bl-.3,0.),vec3(1.4))*.55;c+=c*uL*1.4+bl*uL*.35;float gr=fract(sin(dot(v*997.+uT,vec2(12.9898,78.233)))*43758.5453);c+=(gr-.5)*.035;gl_FragColor=vec4(c,1.);}`;
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const ap=gl.getAttribLocation(pr,"p");gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,2,gl.FLOAT,false,0,0);
const mk=u=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,t);
 [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]].forEach(q=>gl.texParameteri(gl.TEXTURE_2D,q[0],q[1]));return t};
const upl=(u,t,src)=>{gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src)};
const tS=mk(0),tB=mk(1),tD=mk(2);
["uS","uB","uD"].forEach((n,i)=>gl.uniform1i(gl.getUniformLocation(pr,n),i));
const uP=gl.getUniformLocation(pr,"uP"),uF=gl.getUniformLocation(pr,"uF"),uL=gl.getUniformLocation(pr,"uL"),uT=gl.getUniformLocation(pr,"uT");

let W,H,photo=null;
const sc=document.createElement("canvas"),bc=document.createElement("canvas");
const buildScene=()=>{const L=1024,sw=W>=H?L:Math.round(L*W/H),sh2=W>=H?Math.round(L*H/W):L;sc.width=sw;sc.height=sh2;const c=sc.getContext("2d");
 if(photo&&S.room==="photo"){const k=Math.max(sw/photo.width,sh2/photo.height),pw=photo.width*k,ph=photo.height*k;c.drawImage(photo,(sw-pw)/2,(sh2-ph)/2,pw,ph)}else roomDef().draw(c,sw,sh2);
 bc.width=Math.max(8,Math.round(sw/14));bc.height=Math.max(8,Math.round(sh2/14));const b=bc.getContext("2d");b.imageSmoothingQuality="high";b.drawImage(sc,0,0,bc.width,bc.height);
 upl(0,tS,sc);upl(1,tB,bc)};

/* ---------- GOTAS (simulación en CPU → mapa de normales) ---------- */
const spr=document.createElement("canvas");spr.width=spr.height=64;
{const x=spr.getContext("2d"),id=x.createImageData(64,64);
 for(let j=0;j<64;j++)for(let i=0;i<64;i++){const dx=(i-31.5)/32,dy=(j-31.5)/32,d=Math.hypot(dx,dy),o=(j*64+i)*4;
  if(d<1){const k=Math.pow(d,.2);id.data[o]=128+127*dx*k;id.data[o+1]=128+127*dy*k;id.data[o+2]=255;const t=clamp((1-d)/.18,0,1);id.data[o+3]=255*t*t*(3-2*t)}}
 x.putImageData(id,0,0)}
const wet=document.createElement("canvas"),dcv=document.createElement("canvas"),wc=wet.getContext("2d"),dc=dcv.getContext("2d");
let B=[],ds=1,fadeT=0,frameN=0;
const spawn=(x,y,r)=>B.push({x,y,r,v:0,lim:rand(3.4,5.6),dead:false});
const sizeDrops=()=>{ds=clamp(960/Math.max(W,H),.5,1);wet.width=dcv.width=Math.round(W*ds);wet.height=dcv.height=Math.round(H*ds);
 wc.fillStyle="rgb(128,128,0)";wc.fillRect(0,0,wet.width,wet.height);B=[];
 for(let i=0;i<110;i++)spawn(rand(0,wet.width),rand(0,wet.height),.9+Math.pow(Math.random(),2.4)*5)};
let acc=0;
const sim=dt=>{const I=S.int,cap=lerp(90,340,I),w=wet.width,h=wet.height;
 acc+=dt*lerp(3,60,I);while(acc>1){acc--;spawn(rand(0,w),rand(0,h),.9+Math.pow(Math.random(),2.4)*5)}
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
const compose=()=>{dc.drawImage(wet,0,0);for(const b of B){const s=b.v>0?Math.min(1,b.v/2):0,w=2*b.r*(1-.15*s),h=2*b.r*(1+.55*s);dc.drawImage(spr,b.x-w/2,b.y-h/2,w,h)}};

/* ---------- PARALAJE ---------- */
const par={tx:0,ty:0,x:0,y:0};
window.addEventListener("pointermove",e=>{par.tx=e.clientX/W*2-1;par.ty=e.clientY/H*2-1});
const gyro=async()=>{try{if(typeof DeviceOrientationEvent!=="undefined"&&DeviceOrientationEvent.requestPermission&&await DeviceOrientationEvent.requestPermission()!=="granted")return;
 window.addEventListener("deviceorientation",e=>{if(e.gamma==null)return;par.tx=clamp(e.gamma/30,-1,1);par.ty=clamp((e.beta-45)/30,-1,1)})}catch(e){}};

/* ---------- BUCLE ---------- */
let last=0,nextFl=4,strike=-99;const lf=s=>s<0?0:Math.max(Math.exp(-s*10),s>.17?.8*Math.exp(-(s-.17)*6):0);
const frame=t=>{const dt=Math.min(.05,last?(t-last)/1000:.016);last=t;
 par.x=lerp(par.x,par.tx,.06);par.y=lerp(par.y,par.ty,.06);
 nextFl-=dt;if(nextFl<=0){const on=M.ch.thunder.on&&boomFn;nextFl=on?rand(7,18):2;if(on){strike=t/1e3;boomFn(rand(.8,3))}}
 sim(dt);compose();upl(2,tD,dcv);
 gl.uniform2f(uP,par.x,par.y);gl.uniform1f(uF,.7+.2*S.int);gl.uniform1f(uL,lf(t/1e3-strike));gl.uniform1f(uT,(t%1e4)/1e3);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(frame)};

/* ---------- FOTO PROPIA (se guarda en el dispositivo si el navegador lo permite) ---------- */
const idb=(m,v)=>new Promise(r=>{try{const q=indexedDB.open("rainroom",1);q.onupgradeneeded=()=>q.result.createObjectStore("k");q.onerror=()=>r(null);
 q.onsuccess=()=>{const s=q.result.transaction("k",m==="get"?"readonly":"readwrite").objectStore("k"),x=m==="get"?s.get("photo"):m==="put"?s.put(v,"photo"):s.delete("photo");x.onsuccess=()=>r(x.result);x.onerror=()=>r(null)}}catch(e){r(null)}});
const setPhoto=(blob,sel)=>new Promise(res=>{const im=new Image();im.onload=()=>{photo=im;delete thumbs.photo;$("#fabX").style.display="flex";sel?selectRoom("photo"):(buildScene(),renderRooms());res(true)};im.onerror=()=>res(false);im.src=URL.createObjectURL(blob)});
$("#fabP").onclick=()=>$("#file").click();
$("#file").onchange=async e=>{const f=e.target.files[0];if(f&&await setPhoto(f,true))idb("put",f)};
$("#fabX").onclick=()=>{photo=null;delete thumbs.photo;$("#fabX").style.display="none";if(S.room==="photo")selectRoom("city");else renderRooms();idb("del")};

/* ---------- ARRANQUE ---------- */
const resize=()=>{const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=Math.round(W*d);cv.height=Math.round(H*d);gl.viewport(0,0,cv.width,cv.height);buildScene();sizeDrops()};
addEventListener("resize",resize);
M.init();buildUI();const rg=$("#int");rg.oninput=()=>{S.int=+rg.value};rg.onchange=save;
let idle;const wake=()=>{$("#ui").classList.remove("h");clearTimeout(idle);idle=setTimeout(()=>{if(!sheet.classList.contains("open"))$("#ui").classList.add("h")},5000)};
addEventListener("pointerdown",wake);addEventListener("pointermove",wake);wake();
const unlock=()=>{removeEventListener("pointerdown",unlock);$("#msg").style.opacity=0;gyro();rainP.then(()=>{M.resume();syncUI()})};
addEventListener("pointerdown",unlock);
addEventListener("pagehide",save);document.addEventListener("pointerdown",e=>{if(sheet.classList.contains("open")&&!sheet.contains(e.target)&&!e.target.closest("#dock"))sheet.classList.remove("open")});
resize();selectRoom(S.room,true);idb("get").then(b=>{if(b)setPhoto(b)});requestAnimationFrame(frame);
})();
