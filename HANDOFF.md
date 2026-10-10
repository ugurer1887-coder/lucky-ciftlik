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
- `VERSION` – her güncellemede artırın (şu an 105). Ayarlar ve sol üst kutuda görünür.
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

- 3D buğday: `wheat3()` tarla başına 10 sap, `whead` (taneli/kılçıklı başak) ve `blade` (yaprak) havuzları; `windy()` ile rüzgârda sallanır (`WIND` uniform). Fırın: `buildOven()` tuğla kubbe, taş kemer, baca, odun; pişerken alev/kor/duman `stepOven()`.

## v87 ekonomi ve yapılar
- Ekinler `CROPS` (seed, sell, ms, lv, xp): buğday 1dk sv1, patates 4dk sv5, havuç 15dk sv7, salata 20dk sv9, mısır 30dk sv12, patlıcan 45dk sv15, kabak 60dk sv20. `STORE_KEYS` depo anahtarları; 3D `veg3()`, 2D `vegSvg()`, resim `PRODUCE`/`cropThumb`.
- Fırınlar `OVENS = ["oven","oven2"]` (2. fırın sv20, 40 altın). `S.ovenLv[id]` 1-3 (`OVEN_CAP` 7/15/20, Lv3 iki tepsi), `S.bakes[id] = [tepsi0, tepsi1]` her biri `{q,t0,r}`; `RECIPES` ekmek (2 buğday, 2.5dk) ve kızartma (2 patates, 5dk, 60 altın). Geliştirme `OVEN_UP` 1000/3000.
- Nesne menüsü: binaya dokununca `objMenuShow()` (Pişir/Geliştir/Taşı vb.), `objAct()` eski doğrudan işlem.
- Fiyatlar: ekim aleti 500 sv10, elektrikli tırpan 1000 sv15, fıskiye 400, fıskiye 6 seviye (`SPR_UP` 600/850/1500/2250/3500), başlangıç 50 altın, kuyu `at(4,9)`.
- Admin paneli: oyuncuya +1/+5/+10 seviye (`admin/{id}/ops/{op} = {lv}`; sunucu kuralı kayıt başına +5 seviyeye izin verdiği için 5'erli uygulanır).

## v88 hayvanlar ve ambar
- `OBJ.coop` 3x3 (sv10, 500), `OBJ.cowbarn` 4x4 (sv13, 750), `OBJ.mill` 2x2 Ambar (sv10, 300). Satın alma bayrakları `S.coop/S.cowbarn/S.mill`.
- `ANIMALS` tablosu: `S.chickens`/`S.cows` = `[{f: yem yediği zaman}]` (0 = aç). Yem yiyen tavuk 5 dk'da yumurta (10 altın), inek 8 dk'da süt (25 altın); toplayınca aç kalır. Kapasite 10 tavuk / 4 inek, tavuk 100 / inek 200 altın.
- `FEEDS`: tavuk yemi 2 buğday → 1 (2 dk), inek yemi 1 mısır + 1 buğday → 3 (3 dk). Ambar kuyruğu `S.millQ = {r,q,t0}`, en fazla 10 parti.
- Depo sekmeleri `DEPOT_TABS` (Ekinler/Yemler/Malzemeler); yemler satılmaz.
- Döndürme: `S.rot[anahtar]` (0-3), anahtar bina adı ya da `"c"+hücre`. Ev ve depo dönmez (kapı yönü). 3D'de `spin()` ile.
- Ekonomi notu: yumurta (10) 2 buğdaydan (10) yapılan yemle üretildiği için kârı XP; süt 25 olduğu için inek yemi tarifi 3 adet veriyor.

## v89 siparişler ve günlük görevler
- Yumurta 15, süt 40 altın (`EGG_PRICE`, `MILK_PRICE`).
- Günlük görevler (sv3+, `DAILY_LEVEL`): `DAILY` şablonları, `S.daily = {d, list:[{k,n,g,x}], c, got, b, bg}`; gün değişince `dailyEnsure()` tarih + uid tohumlu rastgele 3 görev seçer. Sayaçlar `dailyEv(anahtar, n)`: `plant`, `water`, `harv:<ekin|apple>`, `sellg` (altın), `bake:<bread|fries>`, `prod:<egg|milk>`, `feed`, `order`, `wish`. Ödül 15+5·sv altın, 8+2·sv XP; üçü bitince sandık 40+12·sv.
- Siparişler (sv3+, `ORDER_LEVEL`): `S.orders` 3 yuva; dolu yuva `{p: köylü, it:{ürün:adet}, g, x}`, boş yuva `{w: geleceği zaman}`. Ödül ürün değerinin 1.4 katı, XP değer/5+3. Teslimden sonra 5 dk, reddedince 15 dk bekleme. Sadece oyuncunun üretebildiği ürünler istenir (`orderItems`).
- Görevler penceresi sekmeli (`qtab`: tut/daily/orders, `#qtabs_v8`). Çiftlikteki tabela (`OBJ.sign`, "Sipariş tabelası") menüsünde Siparişler var; teslim edilebilir sipariş varsa 3D'de tabelanın üstünde 📋 rozeti.

## v90 pazar ve yeni bina görünümleri
- Pazar (sv5, `PAZAR_LEVEL`): `market/{id}` = `{seller, sn, item, q, price, ts, buyer?, bn?, bt?}`. Satıcı ürünü koyunca depodan düşer; alıcı `update({buyer,bn,bt})` ile bir kez alır; satıcının oyunu `pzCollect()` ile kaydı siler ve altını ekler (`S.pzGot` son 40 kimlik, çift ödeme olmasın). En fazla 4 tezgah, fiyat en fazla depo değerinin 3 katı. Meydandaki tezgahlara dokununca ya da dock'taki Pazar düğmesiyle açılır (`openPazar`).
- Firebase kuralı: `"market": {".read": "auth != null", ".indexOn": ["seller","ts"], "$id": {".write": "auth != null && ((!data.exists() && newData.child('seller').val() === auth.uid) || (data.exists() && data.child('seller').val() === auth.uid && !newData.exists()) || (data.exists() && !data.child('buyer').exists() && newData.child('buyer').val() === auth.uid && newData.child('seller').val() === data.child('seller').val() && newData.child('item').val() === data.child('item').val() && newData.child('q').val() === data.child('q').val() && newData.child('price').val() === data.child('price').val()))"}}`.
- 3D: yeni `buildCoop`, `buildCowbarn` (önü üçgen cepheli ahır, `gableZ`), `buildCow`, `buildHen`, `buildBarn` (kemerli çatılı depo), `buildMill` (yel değirmenli, silolu ambar). Fırın seviyeye göre: `buildOven(a, baking, lv)` → 1 taş, 2 `buildOven2` tuğla, 3 `buildOven3` modern. `fx.ovens` öğelerinde baca noktası `cx/cy/cz`, parlayan yüzeyler `inners`.
- Görev çubuğu dokununca küçülür (`qMini`, localStorage `lucky-qmin`); hazır görevde pencereyi açar.

## v91
- Ağıl zeminleri `penFloor()` (saman/çimen canvas dokusu, y .03 + polygonOffset; eskisi gölge ile aynı yükseklikte olduğu için titriyordu).
- Görev şeridi `stripInfo()`: başlangıç görevi → günlük görev → siparişler; dokununca `qMini` ile max-width animasyonlu küçülür; hazırsa ilgili sekmeyi açar.
- Meydan tezgahları 1.5 kat büyük (`buildDecor` stall alt grubu).

## v92
- Fırın 2: büyük tuğla kubbe (`brickDome`), odunluk, ekmek masası; fırın 3: çift kubbeli köy fırını (her tepsi için bir kubbe), ortada baca ve FIRIN tabelası, arkada kiremit sundurma.
- Tezgahlar `buildStall()` (her tezgah farklı tente rengi ve ürünler), meydan girişinde `buildPazarBanner()` (iki direk, PAZAR YERİ pankartı, bayrak dizileri).

## v93
- Tezgah tentesine tepeden okunan numara + PAZAR dokusu (`stallTop{n}`), altında renkli halı. Pankart üstünde "N tezgah / X ürün satışta" sprite'ı; meydan imzası (`staticSigOf`) satıştaki ürün sayısını içerir, sayı değişince meydan yeniden çizilir.

## v94
- Pazar etiketleri (`stallLbl{n}`, `pazarCount{n}`) `sizeAttenuation: false` sprite: ekranda hep aynı boyda (kamera fov 30°, ölçek ≈ ekran yüksekliği oranı × 0.54).

## v95
- Kullanıcı isteğiyle pazar yerindeki bütün yazılar kaldırıldı (tente numarası/PAZAR, sabit boyutlu etiketler, sayaç, pankart yazısı). Pankartta sadece ürün emojileri var. Pazarda yazı eklemeyin.

## v96 (Lucky Farm)
- Oyunun adı **Lucky Farm** (title, manifest, sw bildirim başlığı, yükleme ekranı "FARM", Android `app_name`; Android versionCode 8 / 1.0.7 – Play'e yeni paket yüklenmeli). Repo/site adı aynı.
- Tezgah üstünde yazısız sepet rozetleri (`stallBadge{n}`, sabit ekran boyutu).
- Çimen: `scenery()` öbek öbek, yumuşak renkli kısa tutamlar; `paintGrass` açık/koyu yamalar ve kır çiçeği benekleri; detay dokusu daha hafif.
- Dokunma parıltısı `R3.tapMark(x,z)` / `stepTap` (onCell'de çağrılır).
- Yeni `buildCow(v)` (benekli deri dokusu `cowHide`, eklemli bacaklar, kuyruk) ve `buildHen`; ortak `animWalk(m, moving, sec, dt)` hem ağıllarda (`stepPens`) hem avludaki tavuklarda (`syncHens`).
- Kelebekler `stepButterflies` (7 adet, çiftlikte sahip olunan alanda, meydanda meydan çevresinde).

## v97
- Görev ödülleri: günlük görev altını işin satış değerinin %10-20'si (`dailyValue`, `dailyGold`), XP = altın/3; sipariş = değerin 1.1-1.2 katı, XP değer/12. Eski günlük/siparişler girişte yeni ölçeğe çekilir (`D.v=2`). Görev penceresindeki açıklama yazıları kaldırıldı.
- Çimen tutamları: 7 sivri, kıvrık yaprak, köke doğru koyu (vertexColors) ve rüzgârda sallanan özel malzeme (`grasswind`).
- İnek yeniden (`buildCow`: uzun gövde, ince eklemli bacaklar, uzun burun, MS deri). Ağaç (`buildTree(x,z,ripe,seed,grow)`): pürüzsüz yaprak kümeleri (`lumpySmooth`, `leafTex`, `LEAFM`), elmalar büyüme dörtte birlerine göre büyür ve kızarır; imzada büyüme kademesi var.
- Traktör (`buildTractor`) 1.4x, camlı kabin; sürücü koltuğu `userData.seat`.
- Kuyu 1-5 seviyeye göre (`buildWell`), fıskiye 1-6 (`buildSprinkler(i, lv)`); `cleanFarm` artık `ovenLv` ve `sprLv` taşır (ziyarette doğru görünür).
- Çözünürlük: kalite seviyeleri dpr 1.3/1.7/2.25; otomatik modda önce 30 fps'e iner, sonra kaliteyi düşürür.
- LuckyTr çiftliği: kümes, ahır, ambar, iki 3. seviye fırın, 5. seviye kuyu, tüm ekin türleri.

## v98
- Yükleme ekranı yeniden: gün batımı gökyüzü, dönen güneş ışınları, bulanık bulutlar, kuşlar, ahır+silo+yel değirmeni silüeti, buğday tarlası şeritleri, sallanan başaklar (SVG içinde üretilmiş başak taneleri), ışık zerreleri, parlak "Lucky" logosu (parlama şeridi) + yeşil "FARM" rozeti, camsı ilerleme kartı. ID'ler aynı (`ldTip`, `ldText`, `ldFill`, `ldPct`).
- İnek: `sculpt()` ile yontulmuş tek parça gövde/baş/burun/kulak (`COWG`), `cowHide2` yumuşak kenarlı benek dokusu, MS malzemeler, eklemli bacaklar; otlarken baş aşağıda.

## v99
- Ekin seviyeleri: buğday 1, patates 5, havuç 6, salata 8, mısır 10, patlıcan 14, kabak 18.
- Sipariş ve günlük görev ürünleri oyuncunun kendi seviyesine göre (`lvl() >= CROPS[k].lv`; admin kilidi sayılmaz). Açılmamış ürün isteyen açık siparişler girişte yenilenir.

## v100
- Fırın ekranı (`renderOven`): çizilmiş SVG resimler (`wheatArt`, `breadArt`, `potatoArt`, `friesArt`, `RECIPE_ART`), tarif kartları, kaydırıcı (`data-orng`), 5/10/Hepsi (`data-oset`, `data-omax`), bitiş saati (`hhmm`), tepsi görünümü (`trayView`), "Hepsini depoya al" (`data-otakeall`).
- Elmalar yaprak kümelerinin dış yüzeyinde (üst/ön taraf), sap+yaprak+parlama; yere düşen elma yok.

## v101 depo kapasitesi ve tahta
- Depo kapasitesi: `DEPOT_CAP = [100, 200]` (seviye 1 = 100, seviye 2 = 200; 200 varsayımdır, değiştirilebilir). Depodaki **her ürün** (ekin, elma, ekmek, yem, yumurta, süt, tahta) 1 yer sayar. `depUsed/depFree/depCap/depLv`, oyuncuda `S.depLv`.
- Depo geliştirme: `DEPOT_UP = [{ g: 600, wood: 4 }]` (1 → 2). Depo penceresinin üstündeki kart (`depotHead`) ve `depotUpgrade()`.
- Depo doluyken: ekin/elma toplanmaz, hayvan ürünü, ambar yemi ve fırın ürünleri depoya kısmen alınır (yer kadar), pazardan alım engellenir (`depotFullHint`). Pazardan geri alınan ürünler (tezgahtan iptal) kapasiteyi aşabilir. İşçinin topladığı ekin işverenin deposuna kapasiteye bakılmadan girer.
- Tahta (`wood`, `STORE_KEYS` içinde): ekin toplarken her ekin için `woodChance(S)` şansla çıkar (`WOOD_CHANCE = 0.2`; seviye 15'ten büyükse `WOOD_CHANCE_LATE = 0.1`, eşik `WOOD_LATE_LEVEL = 15`), doğrudan depoya gider (yer varsa). Depoya satılmaz (`price: 0`), sadece Pazar'da satılır; Pazar'da tanesi en fazla `WOOD_MAX_PRICE = 400` altın (`pzMax`), önerilen fiyat `WOOD_REF = 100`. Fiyat sınırı sadece istemcide, Firebase kuralında yok. Köy muhtarı kontrolü (`checkBroke`) tahtayı saymaz.
- Çok yuvalı aletler (traktör, elektrikli tırpan, ekim aleti) ve çok sulama (kuyu 3+): `pickExtras` artık sadece **yan yana** (4 yön) komşu toprakları seçer (BFS); aradan boşluk olan toprak ayrıca ziyaret edilmelidir.
- Alet değiştirince (`selectTool` → `dropHarvestTasks`) sırada bekleyen/yürüyen toplama görevleri iptal olur.

## v102-v105
- v102: tahta şansı `woodChance(S)` = %20, seviye 15'ten büyükse %10 (`WOOD_CHANCE`, `WOOD_CHANCE_LATE`, `WOOD_LATE_LEVEL`).
- v103/v104 (performans): gerçek zamanlı gölge her seviyede kapalı (blob gölgeler), kenar yumuşatma açık, piksel oranı üst sınırı seviye 2'de 1.75 / seviye 1'de 1.5 / seviye 0'da 1.3. Otomatik grafik modu her açılışta seviye 2'den başlar (eskiden düşürülen seviye kaydedilip takılı kalıyordu).
- v105 giriş: oyun açılırken hesap yoksa `#gate_v8` ekranı çıkar (Google ile giriş / Misafir). `LUCKY_CONNECT` artık sessizce anonim hesap açmaz; seçimi `window.LUCKY_LOGIN_CHOICE` ister (ana betikte tanımlı). Misafir hesabı sonradan Ayarlar'dan Google'a bağlanır (`linkWithPopup`, eski akış). Çıkış yapınca giriş ekranına dönülür.
- v105 sohbet: "Genel sohbet" (`chat`) + bulunulan yerin sohbeti (`chatx/{oda}`): oda = `sceneKey()` (çiftlik: `farm:{sahip uid}`, meydan: `plaza`). Çiftliği ziyaret eden, sahibiyle aynı odada olur. Sekmeler `#chatTabs_v8`, odayı `watchRoom()` izler. Firebase'de `chatx` kuralı gerekir.
- v105 günlük ödül: takvim tarihe bağlı (`S.login = {streak,lastDay,totalClaims,base,claims[]}`). `base` döngü başlangıç günü, `claims` son 14 gün alınan günler. Girilmeyen günün ödülü verilmez (takvimde ❌), girilen günün ödülü verilir. Eski kayıtlar `loginEnsure()` içinde dönüştürülür.
- v105 mesaj kutuları: `dm_v8`, `gift_v8`, `ach_v8`, `weekly_v8` boşluğa dokununca kapanır (mektup kutusu zaten kapanıyordu).
- v105 dekor: 11 dekorun 2D çizimleri (`DECOR[...].svg`) yenilendi; 3D için `buildDecorNice`, `buildBenchNice`, `buildLampNice`, `buildFlowerBedNice` eklendi. Hata olursa eski sade `...Basic` sürümlere döner. 3D görünümü geliştirme ortamında görülemedi, telefonda kontrol edin.
- Firebase kuralları (Ekim 2026): üstteki genel `.read` kaldırıldı, her yola kendi okuma kuralı eklendi. `dm`, `dmbox`, `gifts`, `analytics`, `chatx` yolları eklendi. `dmbox` okuması `where("to","==",uid)` sorgusuna bağlıdır; sorguyu değiştirirseniz kuralı da değiştirin.

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

## v106
- Genel sohbet (tab "g") mesajları karakter başında baloncuk çıkarmaz; çiftlik/meydan çıkarır (`chatFresh`).
- Baloncuklar büyütüldü (2B `.bt` 23px, 3B sprite 4.6x.72, font 68px).
- Klavye açılınca oyun yeniden boyutlanmaz: `typing()` iken `fitScreen/refit` atlanır, `.sheet` `bottom:var(--kb)` ile klavyenin üstüne çıkar.

## v107
- Depo yükseltmesi depo penceresinden çıkarıldı; çiftlikteki depo menüsünde "⬆️ Yükselt" (`OBJ_ACTS.barn`, `depotUpgrade`). Eksikleri tek mesajda söyler.
- Fiyatlar: ekim aleti 1000, elektrikli tırpan 2500, traktör 20000 (`TOOLS`). Ambar market simgesi SVG.
- Öğretici görevler 13 adıma çıktı (5. seviyeye kadar). `S.tut = {i, d:[claimed ids], c, v:2}`; eski kayıtlar `tutInit` içinde geçirilir (seviye>=5 olanlar öğreticiyi bitmiş sayılır). `chk()` ile durum-tabanlı görevler `questPoll` (1.5 sn) ile izlenir; `ev` ile aynı olayı sayan görevler.

## v108
- Meydan kamerası yakınlaştı: `zEff()` (meydanda ZOOM*0.7), 2B ve 3B kamera ile gölge kutusu bunu kullanır.
- Nesne menüsü (`.objmenu`) ve 3B rozetler (kümes/ahır/ambar/fırın/sipariş) büyütüldü.
- 10 sanal çiftçi (`BOT_DEFS`, uid `luckybot-N`, sunucuya yazılmaz): meydanda gezerler (`botTick`, 12 dakikalık programa göre meydanda / kendi çiftliğinde / yok), `botFarmOf` ile seviyeye göre üretilen çiftlikleri ziyaret edilir, oyuncu aramada ve sıralamada görünürler (`botRankRow`), arkadaş isteği hemen kabul edilir, hediye ve mesaj yok. Seviyeleri günler geçtikçe artar (`botLevel`, `BOT_T0`).
- v109: botlar mesaj/baloncuk yazmaz; dilek çeşmesi ve pazar tezgâhı çevresinde (`botSpots`) durur, nadiren kısa yürür; yürüyüş `peers` döngüsünde `st.path` ile kesintisiz.

## v110
- Nesne menüsü eski boyuta döndü. 3B rozetler (`emojiBadge`) renkli dolgu + koyu/beyaz çerçeve, `fog:false, depthTest:false` ile her zaman net.

## v111
- Meydan kamerası çarpanı 0.55; 3B isim etiketleri büyük/kalın çerçeveli, sis etkisiz.

## v112
- Rozetler çizilmiş simgeler: yumurta (kümes), süt kovası (ahır), yem çuvalı (ambar). `emojiBadge` içinde canvas ile çizilir (anahtar emo3).

## v113
- İsim etiketi (`labelTex`): 1024x256, kalın sade sans yazı tipi (Roboto/Segoe/Arial), kalın koyu çerçeve.
