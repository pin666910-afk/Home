// 藍家記帳：讓「加到主畫面」可安裝，並在沒網路時仍能開啟頁面外殼。
// 記帳資料由 Firestore 自己的離線快取處理，這裡只快取網站檔案。
const C = "lanjia-shell-v1";
const ASSETS = ["./", "./index.html", "./icon-192.png", "./icon-512.png", "./favicon.svg", "./manifest.webmanifest"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;   // Firebase / 字型等跨網域請求不處理
  e.respondWith(
    fetch(r).then(res => {                                                         // 有網路：永遠拿最新版
      if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match("./index.html")))
  );
});
