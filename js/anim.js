/* Dimrain · animación por código en bucle perfecto.
   Cada sala puede llevar `anim` en rooms.js. Todo se mide en píxeles de la imagen original (W×H)
   y se repite exactamente cada P segundos: las frecuencias son siempre múltiplos enteros de 1/P,
   así que no hay costura al volver al principio.
   roads   = un carril por entrada: línea a→b (a = lejos, b = cerca), n coches, laps = vueltas por periodo (más = más rápido).
             Faros blancos que vienen hacia ti; con tail:1, pilotos rojos que se alejan
   dim     = polígonos que oscurecen la foto (para tapar los coches estáticos que ya trae) antes de dibujar los móviles
   beacons = luces intermitentes (balizas de rascacielos)
   lights  = ventanas / luces lejanas que se encienden y apagan dentro de rectángulos */
const ANIM=(()=>{
const TAU=Math.PI*2,spr={};
const sprite=c=>{const k=c.join();if(spr[k])return spr[k];const e=document.createElement("canvas");e.width=e.height=64;const x=e.getContext("2d"),g=x.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,`rgba(${k},1)`);g.addColorStop(.25,`rgba(${k},.5)`);g.addColorStop(1,`rgba(${k},0)`);x.fillStyle=g;x.fillRect(0,0,64,64);return spr[k]=e};
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t;
const prep=cfg=>{const R=rng(cfg.seed||7);const p={cars:[],lights:[]};
 (cfg.roads||[]).forEach(r=>{for(let i=0;i<r.n;i++){const moto=R()<(r.moto==null?.2:r.moto);
  p.cars.push({r,tail:r.tail?1:0,moto,t0:(i+R()*.6)/r.n,laps:(r.laps||4)+(moto?1:0),g:.75+R()*.25,thr:R(),lat:R()*2-1,w:.01+R()*.03,wk:1+Math.floor(R()*4),wp:R(),warm:R()})}});
 (cfg.lights||[]).forEach(L=>{for(let i=0;i<L.n;i++){const q=L.rects[Math.floor(R()*L.rects.length)];
  p.lights.push({L,x:mix(q[0],q[2],R()),y:mix(q[1],q[3],R()),k:Math.round(mix(L.k[0],L.k[1],R())),ph:R(),sz:L.s*(.7+R()*.6)})}});
 return p};
const render=(c,m,t,cfg)=>{const p=cfg._p||(cfg._p=prep(cfg)),P=cfg.P,tt=t%P,u=m.w/cfg.W,X=x=>m.x+x*u,Y=y=>m.y+y*u;
 c.save();
 /* zonas a oscurecer: tapan las luces estáticas que trae la foto para que destaquen las que se mueven */
 for(const d of cfg.dim||[]){const n=d.soft||3,cx=d.pts.reduce((s,q)=>s+q[0],0)/d.pts.length,cy=d.pts.reduce((s,q)=>s+q[1],0)/d.pts.length;
  for(let k=0;k<n;k++){const e=1+.14*(n-1-k);c.beginPath();d.pts.forEach((q,i)=>{const x=X(cx+(q[0]-cx)*e),y=Y(cy+(q[1]-cy)*e);i?c.lineTo(x,y):c.moveTo(x,y)});c.closePath();c.fillStyle=`rgba(6,9,16,${d.a/n*1.6})`;c.fill()}}
 c.globalCompositeOperation="lighter";
 /* ventanas y luces lejanas */
 for(const l of p.lights){let a=.5+.5*Math.sin(TAU*(l.k*tt/P+l.ph));a=cl((a-.4)/.25,0,1);if(a<=0)continue;
  c.globalAlpha=l.L.a*a;const z=l.sz*u*2;c.drawImage(sprite(l.L.c),X(l.x)-z/2,Y(l.y)-z/2,z,z)}
 /* balizas */
 for(const b of cfg.beacons||[]){const q=(tt%b.per)/b.on;if(q>=1)continue;c.globalAlpha=Math.sin(q*Math.PI);const z=b.r*u*3;c.drawImage(sprite(b.c),X(b.p[0])-z/2,Y(b.p[1])-z/2,z,z)}
 /* tráfico */
 const lamp=(s,x,y,z,al)=>{c.globalAlpha=al*.85;c.drawImage(s,x-z*1.4,y-z*1.4,z*2.8,z*2.8);c.globalAlpha=al;c.drawImage(s,x-z*.7,y-z*.7,z*1.4,z*1.4);c.globalAlpha=al*.2;c.drawImage(s,x-z*.8,y+z*.5,z*1.6,z*4.5)};
 const dn={};
 for(const o of p.cars){const r=o.r,jm=r.jam;
  /* densidad: cuántos vehículos hay en la calle en cada momento (suma de ondas periódicas) */
  const d=dn[r.dph]??(dn[r.dph]=cl(.52+.22*Math.sin(TAU*tt/P+(r.dph||0)+1)+.12*Math.sin(TAU*3*tt/P+(r.dph||0)+2)+.06*Math.sin(TAU*7*tt/P+(r.dph||0)),.12,.95));
  const pres=cl((d-o.thr)/.1,0,1);if(pres<=0)continue;
  /* avance con pequeñas aceleraciones y frenadas propias */
  let th=o.t0+o.laps*tt/P+o.w*Math.sin(TAU*(o.wk*tt/P+o.wp));th=(th%1+1)%1;let s=th;
  /* atasco: el tramo cerca de jam.z se comprime (coches más juntos y lentos) y luego se suelta */
  if(jm){const k=jm.c*Math.pow(.5+.5*Math.cos(TAU*(tt-jm.t)/P),jm.sharp||6);s=th-k/TAU*(Math.sin(TAU*(th-jm.z))+Math.sin(TAU*jm.z))}
  const q=o.tail?1-s:s,f=Math.pow(q,1.5),sz=mix(r.r[0],r.r[1],f)*u*(o.moto?.8:1),
   x=X(mix(r.a[0],r.b[0],f)+o.lat*(r.lat==null?7:r.lat)*(.3+f)),y=Y(mix(r.a[1],r.b[1],f));
  const al=Math.min(1,q*7,(1-q)*5)*o.g*pres,col=o.tail?[255,50,38]:o.warm<.25?[255,214,150]:[255,240,210],sp=sprite(col);
  if(o.moto)lamp(sp,x,y,sz*.9,al);else{const gap=sz*.95;lamp(sp,x-gap,y,sz*.85,al);lamp(sp,x+gap,y,sz*.85,al)}}
 c.restore()};
return{render}})();
