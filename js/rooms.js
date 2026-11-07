/* RainRoom · salas. Para añadir una: crea su función de dibujo y regístrala en ROOMS.
   video = bucle opcional (mp4, 720p, sin audio); src = foto opcional en assets/scenes (si existe, sustituye al dibujo); crop/cropP = recorte [x,y,w,h] de la foto horizontal/vertical para quedarse solo con el cristal (fy/fyP = encuadre vertical, 0 arriba · 1 abajo; fx/fxP = horizontal, 0 izquierda · 1 derecha); w = widgets iniciales; fx = efectos vivos (mist: niebla que se desplaza; glow: luz cálida que parpadea); mix = sonidos que se activan al entrar (v = volumen); int = intensidad de las gotas. */
const rand=(a,b)=>a+Math.random()*(b-a);
const drawCity=(c,w,h)=>{const u=w/400;let g=c.createLinearGradient(0,0,0,h);
 g.addColorStop(0,"#071120");g.addColorStop(.55,"#13283e");g.addColorStop(1,"#0a141d");c.fillStyle=g;c.fillRect(0,0,w,h);
 g=c.createRadialGradient(w*.5,h*.62,0,w*.5,h*.62,w*.95);g.addColorStop(0,"rgba(255,170,90,.38)");g.addColorStop(1,"rgba(255,170,90,0)");c.fillStyle=g;c.fillRect(0,0,w,h);
 ["#0d1a29","#08131e","#050b12"].forEach((col,L)=>{const base=h*(.6+L*.05);let x=-10;
  while(x<w){const bw=rand(w*.07,w*.17),bh=rand(h*.1,h*(.34-L*.06));c.fillStyle=col;c.fillRect(x,base-bh,bw,bh+h);
   for(let wy=base-bh+10;wy<base-6;wy+=rand(13*u,19*u))for(let wx=x+6;wx<x+bw-8;wx+=rand(11*u,17*u))if(Math.random()<.3){c.fillStyle=Math.random()<.8?"rgba(255,200,110,"+rand(.3,.85)+")":"rgba(150,200,255,.6)";c.fillRect(wx,wy,4*u,6*u)}
   x+=bw+rand(0,6)}});
 g=c.createLinearGradient(0,h*.78,0,h);g.addColorStop(0,"rgba(20,32,44,.9)");g.addColorStop(1,"rgba(6,10,16,1)");c.fillStyle=g;c.fillRect(0,h*.78,w,h);
 const cols=["255,190,100","255,120,80","160,210,255","255,240,200","255,90,120"];c.globalCompositeOperation="lighter";
 for(let i=0;i<140;i++){const x=rand(0,w),y=rand(h*.45,h*.92),r=rand(3,24)*u,k=cols[i%5];
  g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${k},${rand(.35,.95)})`);g.addColorStop(.6,`rgba(${k},.25)`);g.addColorStop(1,`rgba(${k},0)`);
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
  if(y>h*.72){const l=rand(h*.05,h*.18);g=c.createLinearGradient(0,y,0,y+l);g.addColorStop(0,`rgba(${k},.4)`);g.addColorStop(1,`rgba(${k},0)`);c.fillStyle=g;c.fillRect(x-r*.3,y,r*.6,l)}}
 c.globalCompositeOperation="source-over"};
const drawForest=(c,w,h)=>{const u=w/400;let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,"#0c1f1c");g.addColorStop(.6,"#16332b");g.addColorStop(1,"#08130f");c.fillStyle=g;c.fillRect(0,0,w,h);
 g=c.createRadialGradient(w*.55,h*.3,0,w*.55,h*.3,w);g.addColorStop(0,"rgba(190,230,190,.28)");g.addColorStop(1,"rgba(190,230,190,0)");c.fillStyle=g;c.fillRect(0,0,w,h);
 c.globalCompositeOperation="lighter";for(let i=0;i<5;i++){const x=rand(w*.2,w*.9);g=c.createLinearGradient(x,0,x-w*.25,h);g.addColorStop(0,"rgba(200,240,200,.16)");g.addColorStop(1,"rgba(200,240,200,0)");c.fillStyle=g;c.beginPath();c.moveTo(x,0);c.lineTo(x+rand(20,60)*u,0);c.lineTo(x-w*.25+60*u,h);c.lineTo(x-w*.25,h);c.fill()}c.globalCompositeOperation="source-over";
 for(let L=0;L<4;L++){const a=.4+L*.18;for(let i=0;i<7+L*3;i++){c.fillStyle=`rgba(${14-L*3},${34-L*7},${28-L*6},${a})`;c.fillRect(rand(-10,w),0,rand(14,34)*u*(1+L*.5),h)}
  g=c.createLinearGradient(0,h*.4,0,h);g.addColorStop(0,"rgba(120,170,150,0)");g.addColorStop(1,`rgba(120,170,150,${.1+L*.03})`);c.fillStyle=g;c.fillRect(0,0,w,h)}
 c.globalCompositeOperation="lighter";for(let i=0;i<70;i++){const x=rand(0,w),y=rand(h*.2,h*.9),r=rand(2,12)*u;g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,"rgba(220,255,170,.7)");g.addColorStop(1,"rgba(220,255,170,0)");c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}c.globalCompositeOperation="source-over"};
const drawLounge=(c,w,h)=>{let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,"#1b2a44");g.addColorStop(.6,"#3a3550");g.addColorStop(1,"#2a1f26");c.fillStyle=g;c.fillRect(0,0,w,h);
 c.globalCompositeOperation="lighter";for(let i=0;i<60;i++){const x=rand(0,w),y=rand(h*.35,h*.75),r=rand(4,22)*w/400,k=i%2?"255,200,130":"170,200,255";g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${k},.7)`);g.addColorStop(1,`rgba(${k},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}c.globalCompositeOperation="source-over";
 c.fillStyle="#1a110d";c.fillRect(w*.47,0,w*.06,h);c.fillRect(0,h*.4,w,h*.04);
 [[0,1],[w,-1]].forEach(([x,s])=>{g=c.createLinearGradient(x,0,x+s*w*.3,0);g.addColorStop(0,"#3b1d1a");g.addColorStop(1,"rgba(59,29,26,0)");c.fillStyle=g;c.fillRect(s>0?0:w*.7,0,w*.3,h)});
 g=c.createRadialGradient(w*.15,h*.88,0,w*.15,h*.88,w*.7);g.addColorStop(0,"rgba(255,170,80,.55)");g.addColorStop(1,"rgba(255,170,80,0)");c.fillStyle=g;c.fillRect(0,0,w,h);
 c.fillStyle="#120b08";c.fillRect(0,h*.9,w,h*.1);c.fillStyle="#d8c3a5";c.fillRect(w*.62,h*.84,w*.09,h*.06)};
/* Pasa una animación definida sobre la foto horizontal a su recorte vertical: desplaza x en dx, escala s y fija el nuevo tamaño */
const mvAnim=(a,dx,s,W,H)=>{const p=q=>[(q[0]+dx)*s,q[1]*s];return{...a,W,H,
 dim:(a.dim||[]).map(d=>({...d,pts:d.pts.map(p)})),
 roads:(a.roads||[]).map(r=>({...r,a:p(r.a),b:p(r.b),r:r.r.map(v=>v*s)})),
 beacons:(a.beacons||[]).map(b=>({...b,p:p(b.p),r:b.r*s})),
 lights:(a.lights||[]).map(l=>({...l,s:l.s*s,rects:l.rects.map(q=>{const a0=p([q[0],q[1]]),a1=p([q[2],q[3]]);return[Math.max(0,a0[0]),a0[1],Math.min(W,a1[0]),a1[1]]}).filter(q=>q[2]>q[0])}))}};
const CITY_A={P:48,W:1280,H:720,seed:7,
  dim:[{pts:[[928,446],[964,446],[964,648],[800,648],[800,612]],a:.6,soft:4}],
  roads:[{a:[945,462],b:[838,612],n:9,r:[2.2,8],laps:6,moto:.15,dph:0,jam:{c:.3,t:8,z:.5,sharp:4}},
         {a:[958,465],b:[918,642],n:8,r:[2.2,7.5],laps:5,tail:1,moto:.15,dph:2.4,jam:{c:.8,t:29,z:.55,sharp:6}}],
  beacons:[{p:[912,137],c:[255,40,40],per:2,on:.5,r:7},{p:[752,40],c:[255,70,50],per:3,on:.45,r:6}],
  lights:[{rects:[[715,50,790,325],[530,160,595,300],[300,165,420,300],[865,140,915,290],[1075,180,1185,300],[215,300,300,380]],n:34,c:[255,206,130],s:5,a:.5,k:[2,6]},
          {rects:[[830,380,950,470]],n:12,c:[255,190,110],s:9,a:.35,k:[4,8]}]};
const ROOMS=[
 {id:"city",name:"Ciudad de noche",src:"assets/scenes/city.jpg",srcP:"assets/scenes/city-p.jpg",crop:[474,0,486,612],fy:.8,cropP:[0,0,762,1290],fxP:1,video:"assets/scenes/city.mp4",w:{clock:{}},draw:drawCity,anim:CITY_A,animP:mvAnim(CITY_A,-580,2,810,1440),fx:{mist:.25},int:.7,mix:{rain:{v:.7,on:true},thunder:{v:.3,on:true},traffic:{v:.35,on:true}}},
 {id:"forest",name:"Bosque",src:"assets/scenes/forest.jpg",video:"assets/scenes/forest.mp4",w:{},draw:drawForest,fx:{mist:.55},int:.55,mix:{rain:{v:.6,on:true},wind:{v:.3,on:true},thunder:{v:.15,on:true}}},
 {id:"lounge",name:"Salón acogedor",src:"assets/scenes/lounge.jpg",video:"assets/scenes/lounge.mp4",w:{clock:{}},draw:drawLounge,fx:{mist:.1,glow:{x:.15,y:.88,r:.35,s:.5,c:[1,.62,.3]}},int:.5,mix:{rain:{v:.5,on:true},fire:{v:.5,on:true}}}];
const PHOTO={id:"photo",name:"Mi foto",fx:{mist:.15},w:{clock:{}},draw:(c,w,h)=>drawCity(c,w,h),int:.7,mix:{rain:{v:.7,on:true},thunder:{v:.25,on:true}}};
