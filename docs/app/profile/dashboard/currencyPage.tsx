"use server";

import { getLatestCurrency } from '@/lib/evds';

export async function CurrencyPage() {
  let currency = await getLatestCurrency();
  
  if (!currency) {
    currency = { 
      tarih: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }), 
      buying: 45.14, 
      selling: 45.30,
      seri: 'TP.DK.USD.A' 
    };
  }

  const buyingNum = parseFloat(currency.buying) || 45.14;
  const sellingNum = parseFloat(currency.selling) || 45.30;
  const spread = (sellingNum - buyingNum).toFixed(4);

  return (
    <div className="neon-card p-4 flex flex-wrap items-center gap-6 animate-float-up" 
      style={{ animationDelay: '50ms', borderColor: 'rgba(255,153,0,0.3)', boxShadow: '0 0 20px rgba(255,153,0,0.06)' }}>
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold"
          style={{ background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.3)', color: '#ff9900', boxShadow: '0 0 8px rgba(255,153,0,0.2)' }}>
          $
        </div>
        <div>
          <p className="text-[9px] font-orbitron tracking-widest uppercase opacity-50">USD/TRY Live Rate</p>
          <p className="font-mono-tech text-lg font-bold" style={{ color: '#ff9900', textShadow: '0 0 10px rgba(255,153,0,0.5)' }}>
            {buyingNum.toFixed(4)} <span className="text-xs opacity-40">TRY</span>
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="text-center">
          <p className="text-[9px] font-orbitron tracking-widest uppercase" style={{ color: 'var(--neon-green)', opacity: 0.7 }}>BUY</p>
          <p className="font-mono-tech text-sm" style={{ color: 'var(--neon-green)' }}>{buyingNum.toFixed(4)}</p>
        </div>
        <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="text-center">
          <p className="text-[9px] font-orbitron tracking-widest uppercase" style={{ color: 'var(--neon-pink)', opacity: 0.7 }}>SELL</p>
          <p className="font-mono-tech text-sm" style={{ color: 'var(--neon-pink)' }}>{sellingNum.toFixed(4)}</p>
        </div>
        <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="text-center">
          <p className="text-[9px] font-orbitron tracking-widest uppercase opacity-50">SPREAD</p>
          <p className="font-mono-tech text-sm opacity-60">{spread}</p>
        </div>
      </div>

      <div className="ml-auto flex flex-col items-end gap-0.5">
        <span className="text-[9px] font-mono-tech opacity-30">TCMB · {currency.tarih}</span>
        <span className="text-[9px] font-mono-tech opacity-20">{currency.seri}</span>
      </div>
    </div>
  );
}