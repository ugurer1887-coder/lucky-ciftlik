# Lucky Çiftlik – geliştirme notları (devir özeti)

Bu dosya, oyunu yeni bir sohbette geliştirmeye devam edecek kişi (veya Claude) için hazırlandı.

## Genel
- **Oyun:** Lucky Çiftlik – çevrim içi, çok oyunculu 3D çiftlik oyunu. Türkçe.
- **Canlı adres:** https://luckyciftlik.netlify.app
- **Kaynak:** bu depo (`ugurer1887-coder/lucky-ciftlik`). Oyunun tamamı tek dosya: `index.html`.
- **Yayın:** `main` dalına yapılan her push'u Netlify otomatik yayına alır (Netlify Personal plan, ayda 1.000 kredi, her yayın 15 kredi). Değişiklikleri toplu push edin.
- **Sunucu:** Firebase (proje: `luckytr-ciftlik`), Realtime Database + Google girişi. Admin hesabı: `ugur_er_1@hotmail.com`.
- **Google Play:** paket adı `com.luckytr.ciftlik`, TWA. Artık PWABuilder değil, depodaki `android/` projesi kullanılıyor (bkz. `android/README.md`). Dahili test kanalında son yüklenen: sürüm kodu 6 (1.0.5). Hazır bekleyen: sürüm kodu 7 (1.0.6, bildirim izni ve DelegationService). Bir sonraki paket 8 olmalı.
  - Paketi GitHub Actions ("Android paketi") derleyip imzalar; `android/` değişince çalışır, `.aab` çalıştırmanın Artifacts bölümünden indirilir.
  - İmza: depo gizli değerleri `KEYSTORE_BASE64` ve `KEYSTORE_PASSWORD` (alias `my-key-alias`). Şifre depoya yazılmaz.
  - minSdk 24, targetSdk 36 (Play şartı). Açılışta simge yok (sistem açılış ekranı yükleme ekranının mavisi #BFE6F7), sticky-immersive tam ekran, çentikli kenar da kullanılır (`android/app/src/main/java/com/luckytr/ciftlik/LauncherActivity.java`).
  - İmza anahtarı (`signing.keystore`, alias `my-key-alias`) sahibinde saklı. Yeni paket yaparken **mutlaka aynı anahtar** kullanılmalı ve version code bir artırılmalı.
  - `assetlinks.json` (kök ve `.well-known/`) iki SHA-256 içerir: yükleme anahtarı ve Google Play imzalama anahtarı. Silinmemeli.

## Depodaki dosyalar
- `index.html` – oyunun tamamı (HTML + CSS + JS). Başlıkta manifest/ikon bağlantıları ve en altta service worker kaydı var.
- `sw.js` – service worker. Sayfayı her zaman ağdan alır; three.js / Firebase / font gibi sürümlü kütüphaneleri telefonda saklar. Her yayında `CACHE` adını artırın (`lucky-vNN`).
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png` – uygulama bilgileri ve simgeler.
- `assetlinks.json`, `.well-known/assetlinks.json`, `_redirects`, `_headers` – Play uygulaması bağlantısı.

## Oyun içinde önemli sabitler / yapılar (index.html)
- `VERSION` – her güncellemede artırın (şu an 85). Ayarlar ve sol üst kutuda görünür.
- `UPDATES` dizisi – oyundaki **Güncellemeler** penceresi. Her yeni sürümde başa bir kart ekleyin (v, d, e, t, c, b, items).
- Harita: `COLS=56, ROWS=30`, `MAPV=5`. 15 harita genişletmesi (`EXPAND_STEPS`, 80. seviyeye kadar). Toprak sınırı 500 (`PLOT_CAP`), seviyeye göre `landMax`.
- Seviye: 100 seviye, `xpNeed` formülü; XP: buğday 2, patates 3, elma 3, sulama 2, ekmek 3.
- Su kuyusu: 5 seviye (`WELL_COST`, `WELL_BUCKET` = 3/10/20/35/50 kova); 3. seviyeden 2'şer, 5. seviyede 4'er sulama.
- Fıskiye: 5 seviye (`SPR_CAPS` 50/75/100/150/200, `SPR_NS` 4/6/8/10/12, `SPR_UP` 400/800/1500/2500).
- Görevler (öğretici): `QUESTS` dizisi (8 görev, ödüller 3–12 altın). İlerleme `S.tut = { i: alınan ödül sayısı, c: { görevId: sayaç }, o: pencere bir kez açıldı }`. Sayaçlar `questEv(id, n)` ile artar (ekim, sulama, hasat, satış, ekmek, dilek, iş ilanı); fırın görevi `S.oven` durumuna bakar. Ödüller üstteki Görevler düğmesinden alınır, sol üstte görev kartı ve sağdaki ilgili düğmede işaret parmağı gösterilir. Yeni oyuncu `START_GOLD = 18` ile başlar (6 buğday tohumu).
- Dilek çarkı: `WISH_LEVEL = 5` (5. seviyeden önce açılmaz), kazanınca `winShow()` kutlaması. Meydandaki 3D çeşme `buildFountain()` + `stepFountain()` ile canlandırılıyor (altınlar, balıklar, nilüferler, su damlaları, halkalar).
- Dilek çarkı: `WISH_ODDS` (%1 100x, %20 2x, %34 tekrar/geri, %45 boş), `WISH_MAX = 20000` (Firebase kuralı tek yazımda en fazla 2.000.000 altın değişimine izin veriyor), günde 3 hak.
- Araçlar: tırpan, elektrikli tırpan (x2), traktör (x4, 30. seviye), ekim aleti (x2).
- LuckyTr: her oyuncuda arkadaş olarak görünen bot (`BOT_UID`), canlı güncellenen vitrin çiftliği.
- Admin paneli (sarı kalkan): "Bütün oyuncuları sıfırla" düğmesi her oyuncuya `admin/{id}/reset = {ts}` yazar; oyuncu bağlanınca `resetMe()` çiftliğini sıfırlar (ad, karakter, arkadaşlar, alınmış mektup ödülleri kalır; `S.resetAt`).
- Admin paneli (sarı kalkan): ban/kick (süreli), altın verme/alma, toplu mektup/ödül, istatistik.
- Diğer: mektup kutusu, sıralama (haftalık/aylık/genel), iş ilanları (20 dk), küfür filtresi, benzersiz isimler, dekor marketi, fırın.

## Hasat bildirimleri (Web Push)
- Oyun `push/{uid} = { sub, due, sent, on }` yazar; `due` sıradaki ekin/ağaç/ekmek hazır olma zamanı (`nextReadyAt`, `pushDue`). Ayarlar'da aç/kapa, oyuna ilk girişte cihaz başına bir kez sorulur (`notifAsk`, `lucky-notif-asked`).
- `netlify/functions/harvest-push.mjs` 5 dakikada bir çalışır (bağımlılıksız, VAPID imzası Node crypto ile), içeriksiz push yollar; yazıyı `sw.js` gösterir. Oyun açık ve odaktaysa bildirim gösterilmez.
- Netlify ortam değişkenleri (9 Ekim 2026'da eklendi): `FIREBASE_DB_SECRET` ve `VAPID_PRIVATE_D` gizli, `VAPID_PUBLIC` (oyundaki `VAPID_PUBLIC` ile aynı). Değerler depoda YOK. Fonksiyon Netlify > Logs > Functions > harvest-push altında izlenir, oradan "Run now" ile elle de çalıştırılabilir.
- Firebase kuralı: `"push": { ".indexOn": ["due"], "$uid": { ".read": "auth != null && auth.uid === $uid", ".write": "auth != null && auth.uid === $uid" } }`.

## Performans kararları
- Gerçek zamanlı gölgeler **kapalı**; nesnelerin altında yumuşak "blob" gölge var.
- Malzemelerin çoğu `MeshLambertMaterial` (LAM) – telefonlarda çok daha hızlı.
- Yüksek kalitede iç çözünürlük en fazla 1.75x; FPS düşerse otomatik çözünürlük düşürme var.
- Kamera en uzak zoom `ZOOM_MAX = 1.55`.
- Ekran boyutu değişimleri (bildirim çubuğu vb.) 0,5 sn sabit kalmadan yeniden yerleşim yapılmaz.
- Admin hesabında sol üst kutuda FPS görünür.

## Bilinen konular / sonraki adımlar
- Play uygulamasında Chrome'un "Chrome'da çalışıyor" bilgisi ilk açılışta çıkabilir (TWA kuralı). Kaldırmak için Capacitor gibi yerel WebView uygulamasına geçip yerel Google girişi eklemek gerekir.
- Uygulama içinde (`IN_APP`) oyun tarayıcıdan tam ekran istemez; aksi halde Chrome "Tam ekrandan çıkmak için..." uyarısı gösterir.
- Sis/bulut: `fogImage()` yalnızca bir sonraki genişletme halkasını (`OWN[size+1]`) bulutla kaplar, ötesi hafif gölgeli. Fiyat etiketi bulutun üstünde (`expandSpots`, `expandLabel`); eski ahşap `buildForSale` tabelası kullanılmıyor.
- Sulanmamış ekinlerde 3D'de zıplayan su damlası sprite'ı (`fx.ddrops`). Admin için dilek hakkı sınırsız. Görev penceresi kendiliğinden açılmaz, listede sadece biten ve sıradaki görev görünür.
- Sağdaki menü düğmeleri ahşap tabela görünümünde, simgeler `ICON` içinde renkli SVG çizimler (`fico`).
- Uzun pencereler (`.modal`) üstten başlar ve kayar; ortalama yüzünden üst kısmın ekran dışında kalması düzeltildi.
- Google yazı tipleri engellemeden yüklenir (`media="print" onload`), sayfa ilk anda çizilir.
- Herkese açık yayın için Play Console'da kapalı test, gizlilik politikası, veri güvenliği formu ve mağaza görselleri (1024x500 kapak, ekran görüntüleri) gerekiyor.
- Firebase ücretsiz planı aynı anda ~100 bağlantı sınırı – oyuncu artarsa Blaze plana geçilmeli.
