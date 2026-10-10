package com.luckytr.ciftlik;

import com.google.androidbrowserhelper.playbilling.digitalgoods.DigitalGoodsRequestHandler;
import com.google.androidbrowserhelper.trusted.DelegationService;

/** Bildirim yetkilendirmesine ek olarak, oyundaki Lucky parası satın almaları için Google Play Billing'e (Digital Goods API) köprü kurar. */
public class BillingDelegationService extends DelegationService {
    @Override
    public void onCreate() {
        super.onCreate();
        registerExtraCommandHandler(new DigitalGoodsRequestHandler(getApplicationContext()));
    }
}
