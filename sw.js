// 更新時は VERSION を上げる
const VERSION='perfcalc-v2.11';
const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-512-maskable.png'];
// install: always fetch fresh copies from the server (bypass HTTP cache)
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(FILES.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(!r.ok)throw new Error(u);return c.put(u,r)})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const isPage=req.mode==='navigate'||new URL(req.url).pathname.endsWith('/index.html');
  if(isPage){
    // network first for the app page: online = latest, offline = cached copy
    e.respondWith(fetch(new Request(req.url,{cache:'no-store'})).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSION).then(c=>c.put('./index.html',cp))}return res})
      .catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(req,cp));return res})));
});
