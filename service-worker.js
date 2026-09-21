const CACHE="ddv-shell-v1";
const SHELL=["./","./index.html","./manifest.json","./assets/favicon-heart.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
  const u=new URL(event.request.url);
  if(u.origin!==self.location.origin) return;
  if(event.request.method!=="GET") return;
  if(event.request.mode==="navigate") event.respondWith(caches.match("./index.html").then(r=>r||fetch(event.request)));
  else event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return res}).catch(()=>r)));
});
