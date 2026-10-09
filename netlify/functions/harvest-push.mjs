// Lucky Farm: "hasadın hazır" bildirimleri.
// Her 5 dakikada bir çalışır. Firebase'deki push/{uid} kayıtlarından zamanı gelmiş olanları bulur
// (due <= şimdi ve henüz gönderilmemiş) ve oyuncunun telefonuna Web Push bildirimi yollar.
// Bağımlılık yok: VAPID imzası Node'un kendi crypto modülüyle yapılır, bildirim içeriksiz gönderilir
// (yazıyı telefondaki service worker, sw.js, gösterir).
//
// Netlify ortam değişkenleri (Site configuration > Environment variables):
//   FIREBASE_DB_SECRET  Firebase > Proje ayarları > Hizmet hesapları > Veritabanı gizli anahtarları
//   VAPID_PUBLIC        oyundaki VAPID_PUBLIC ile aynı değer
//   VAPID_PRIVATE_D     VAPID özel anahtarının "d" değeri (depoya yazılmaz)
import crypto from "node:crypto";

const DB = "https://luckytr-ciftlik-default-rtdb.europe-west1.firebasedatabase.app";
const SITE = "https://luckyciftlik.netlify.app";

const env = k => (globalThis.Netlify && Netlify.env.get(k)) || process.env[k] || "";
const b64u = buf => Buffer.from(buf).toString("base64url");

function vapidKey() {
  const pub = Buffer.from(env("VAPID_PUBLIC"), "base64url");
  if (pub.length !== 65) throw new Error("VAPID_PUBLIC eksik ya da hatalı");
  const jwk = { kty: "EC", crv: "P-256", x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)), d: env("VAPID_PRIVATE_D") };
  if (!jwk.d) throw new Error("VAPID_PRIVATE_D eksik");
  return { key: crypto.createPrivateKey({ key: jwk, format: "jwk" }), pub: b64u(pub) };
}
function vapidAuth(endpoint, v) {
  const head = b64u(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const body = b64u(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: SITE }));
  const sig = crypto.sign("sha256", Buffer.from(head + "." + body), { key: v.key, dsaEncoding: "ieee-p1363" });
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${v.pub}`;
}
async function db(path, method = "GET", data) {
  const url = `${DB}/${path}.json?auth=${encodeURIComponent(env("FIREBASE_DB_SECRET"))}`;
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: data === undefined ? undefined : JSON.stringify(data) });
  if (!r.ok) throw new Error(`Firebase ${method} ${path}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

export default async () => {
  if (!env("FIREBASE_DB_SECRET")) return new Response("FIREBASE_DB_SECRET eksik", { status: 500 });
  const v = vapidKey(), now = Date.now();
  const q = `push.json?orderBy=${encodeURIComponent('"due"')}&startAt=1&endAt=${now}&auth=${encodeURIComponent(env("FIREBASE_DB_SECRET"))}`;
  const r = await fetch(`${DB}/${q}`);
  if (!r.ok) return new Response("Firebase okunamadı: " + r.status + " " + (await r.text()).slice(0, 200), { status: 500 });
  const rows = (await r.json()) || {};
  let sent = 0, gone = 0, failed = 0;
  for (const [uid, p] of Object.entries(rows)) {
    if (!p || !p.sub || !p.sub.endpoint || !(+p.due > 0) || +p.sent === +p.due || p.on === false) continue;
    try {
      const res = await fetch(p.sub.endpoint, { method: "POST", headers: { TTL: "21600", Urgency: "normal", Topic: "harvest", Authorization: vapidAuth(p.sub.endpoint, v), "Content-Length": "0" } });
      if (res.status === 404 || res.status === 410) { await db(`push/${uid}`, "PATCH", { sub: null, sent: +p.due }); gone++; continue; }
      if (!res.ok) { failed++; continue; }
      await db(`push/${uid}`, "PATCH", { sent: +p.due }); sent++;
    } catch (e) { failed++; }
  }
  return new Response(JSON.stringify({ checked: Object.keys(rows).length, sent, gone, failed }), { headers: { "Content-Type": "application/json" } });
};

export const config = { schedule: "*/5 * * * *" };
