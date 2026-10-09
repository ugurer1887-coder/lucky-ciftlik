package com.luckytr.ciftlik;

import androidx.browser.trusted.TrustedWebActivityDisplayMode;

/**
 * Lucky Çiftlik başlatıcısı: oyunu tam ekran açar.
 * - Durum ve gezinme çubukları gizli; kaydırınca kısa süre görünüp kendiliğinden kaybolur (sticky).
 * - Kamera çentiğinin olduğu kenar da kullanılır, ekranın kenarında siyah şerit kalmaz.
 */
public class LauncherActivity extends com.google.androidbrowserhelper.trusted.LauncherActivity {
    // WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES (API 28)
    private static final int CUTOUT_SHORT_EDGES = 1;

    @Override
    protected TrustedWebActivityDisplayMode getDisplayMode() {
        return new TrustedWebActivityDisplayMode.ImmersiveMode(true, CUTOUT_SHORT_EDGES);
    }
}
