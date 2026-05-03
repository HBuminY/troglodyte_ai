"use server";

import { getLatestCurrency } from '@/lib/evds';

export async function CurrencyPage() {
  let currency = await getLatestCurrency();
  console.log("tcmb currency:", currency);
  
  if (!currency) {
    currency = { 
      tarih: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }), 
      deger: 45.14, 
      seri: 'TP.DK.USD.A' 
    };
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Güncel Kur Bilgisi</h1>
      <p>Tarih: {currency.tarih}</p>
      <p className="text-2xl text-green-600 font-mono">
        1 USD = {currency.buying} TL
      </p>
      <p className="text-xs text-gray-400 mt-4 italic">
        Not: Bugün Paskalya olduğu için veriler en son iş gününe ait olabilir.
      </p>
    </div>
  );
}