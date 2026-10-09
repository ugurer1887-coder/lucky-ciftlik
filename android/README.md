# Lucky Çiftlik – Android uygulaması

Google Play paketi (`com.luckytr.ciftlik`). Oyunu https://luckyciftlik.netlify.app adresinden Trusted Web Activity ile açar.

- Açılışta simge gösterilmez; ekran yükleme ekranının gök mavisiyle (#BFE6F7) açılır.
- `android/` klasöründe her değişiklikte GitHub Actions ("Android paketi") imzalı `.aab` derler; dosya çalıştırmanın "Artifacts" bölümünden indirilir.
- Yeni pakette `app/build.gradle` içindeki `versionCode` bir artırılmalı.
- İmza: depo gizli değerleri `KEYSTORE_BASE64` ve `KEYSTORE_PASSWORD` (anahtar adı `my-key-alias`). Anahtar dosyası ve şifresi depoya konmaz.
