# Lucky Çiftlik – geliştirme notları (devir özeti)

Bu dosya, oyunu yeni bir sohbette geliştirmeye devam edecek kişi (veya Claude) için hazırlandı.

## Genel
- **Oyun:** Lucky Çiftlik – çevrim içi, çok oyunculu 3D çiftlik oyunu. Türkçe.
- **Canlı adres:** https://luckyciftlik.netlify.app
- **Kaynak:** bu depo (`ugurer1887-coder/lucky-ciftlik`). Oyunun tamamı tek dosya: `index.html`.
- **Yayın:** `main` dalına yapılan her push'u Netlify otomatik yayına alır (Netlify Personal plan, ayda 1.000 kredi, her yayın 15 kredi). Değişiklikleri toplu push edin.
- **Sunucu:** Firebase (proje: `luckytr-ciftlik`), Realtime Database + Google girişi. Admin hesabı: `ugur_er_1@hotmail.com`.
- **Google Play:** paket adı `com.luckytr.ciftlik`, PWABuilder ile yapılmış TWA. Şu an Dahili test kanalında, son paket sürüm kodu 3 (1.0.2, Display mode: Standalone).
  - İmza anahtarı (`signing.keystore`, alias `my-key-alias`) sahibinde saklı. Yeni paket yaparken **mutlaka aynı anahtar** kullanılmalı ve version code bir artırılmalı.
  - `assetlinks.json` (kök ve `.well-known/`) iki SHA-256 içerir: yükleme anahtarı ve Google Play imzalama anahtarı. Silinmemeli.

## Depodaki dosyalar
- `index.html` – oyunun tamamı (HTML + CSS + JS). Başlıkta manifest/ikon bağlantıları ve en altta service worker kaydı var.
- `sw.js` – service worker. Sayfayı her zaman ağdan alır; three.js / Firebase / font gibi sürümlü kütüphaneleri telefonda saklar. Her yayında `CACHE` adını artırın (`lucky-vNN`).
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png` – uygulama bilgileri ve simgeler.
- `assetlinks.json`, `.well-known/assetlinks.json`, `_redirects`, `_headers` – Play uygulaması bağlantısı.

## Oyun içinde önemli sabitler / yapılar (index.html)
- `VERSION` – her güncellemede artırın (şu an 78). Ayarlar ve sol üst kutuda görünür.
- `UPDATES` dizisi – oyundaki **Güncellemeler** penceresi. Her yeni sürümde başa bir kart ekleyin (v, d, e, t, c, b, items).
- Harita: `COLS=56, ROWS=30`, `MAPV=5`. 15 harita genişletmesi (`EXPAND_STEPS`, 80. seviyeye kadar). Toprak sınırı 500 (`PLOT_CAP`), seviyeye göre `landMax`.
- Seviye: 100 seviye, `xpNeed` formülü; XP: buğday 2, patates 3, elma 3, sulama 2, ekmek 3.
- Su kuyusu: 5 seviye (`WELL_COST`, `WELL_BUCKET` = 3/10/20/35/50 kova); 3. seviyeden 2'şer, 5. seviyede 4'er sulama.
- Fıskiye: 5 seviye (`SPR_CAPS` 50/75/100/150/200, `SPR_NS` 4/6/8/10/12, `SPR_UP` 400/800/1500/2500).
- Dilek çarkı: `WISH_ODDS` (%1 100x, %25 2x, %34 geri, %40 boş), `WISH_MAX = 20000` (Firebase kuralı tek yazımda en fazla 2.000.000 altın değişimine izin veriyor), günde 3 hak.
- Araçlar: tırpan, elektrikli tırpan (x2), traktör (x4, 30. seviye), ekim aleti (x2).
- LuckyTr: her oyuncuda arkadaş olarak görünen bot (`BOT_UID`), canlı güncellenen vitrin çiftliği.
- Admin paneli (sarı kalkan): ban/kick (süreli), altın verme/alma, toplu mektup/ödül, istatistik.
- Diğer: mektup kutusu, sıralama (haftalık/aylık/genel), iş ilanları (20 dk), küfür filtresi, benzersiz isimler, dekor marketi, fırın.

## Performans kararları
- Gerçek zamanlı gölgeler **kapalı**; nesnelerin altında yumuşak "blob" gölge var.
- Malzemelerin çoğu `MeshLambertMaterial` (LAM) – telefonlarda çok daha hızlı.
- Yüksek kalitede iç çözünürlük en fazla 1.75x; FPS düşerse otomatik çözünürlük düşürme var.
- Kamera en uzak zoom `ZOOM_MAX = 1.55`.
- Ekran boyutu değişimleri (bildirim çubuğu vb.) 0,5 sn sabit kalmadan yeniden yerleşim yapılmaz.
- Admin hesabında sol üst kutuda FPS görünür.

## Bilinen konular / sonraki adımlar
- Play uygulamasında Chrome'un "Chrome'da çalışıyor" bilgisi ilk açılışta çıkar (TWA kuralı). Kaldırmak için Capacitor gibi yerel WebView uygulamasına geçip yerel Google girişi eklemek gerekir.
- Herkese açık yayın için Play Console'da kapalı test, gizlilik politikası, veri güvenliği formu ve mağaza görselleri (1024x500 kapak, ekran görüntüleri) gerekiyor.
- Firebase ücretsiz planı aynı anda ~100 bağlantı sınırı – oyuncu artarsa Blaze plana geçilmeli.
