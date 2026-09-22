const CACHE="ddv-shell-v4";
const SHELL=["./","./index.html","./manifest.json","./assets/favicon-heart.svg"];

self.addEventListener("install", event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate", event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", event=>{
  const u=new URL(event.request.url);
  if(u.origin!==self.location.origin || event.request.method!=="GET") return;

  // Sempre tenta buscar a página atual primeiro. Isso evita que uma versão
  // antiga do index.html fique presa no celular depois de uma atualização.
  if(event.request.mode==="navigate"){
    event.respondWith(
      fetch(event.request)
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put("./index.html",copy));
          return res;
        })
        .catch(()=>caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>{
      const network=fetch(event.request).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(event.request,copy));
        return res;
      }).catch(()=>cached);
      return cached || network;
    })
  );
});
