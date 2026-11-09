const V="rr-v19",A=["./","index.html","css/style.css","js/app.js","js/rooms.js","js/anim.js","js/widgets.js","js/ads.js","js/pages.js","guias/guias.css","assets/audio/rain.mp3","assets/audio/thunder.mp3","assets/audio/thunder.json","assets/audio/wind.mp3","assets/audio/fire.mp3","assets/audio/traffic.mp3","manifest.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Red primero (siempre la última versión) y, sin conexión, lo guardado
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request)))});
