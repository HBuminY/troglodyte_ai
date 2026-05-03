import { Suspense } from 'react';
import DashboardClient from './DashboardClient';
import { CurrencyPage } from './currencyPage';
import { getLatestCurrency } from '@/lib/evds';
// Bu bir Server Component'tir ('use client' içermez)
export default function DashboardPage() {
  const currency = getLatestCurrency(); // Server Component'te currency verisi alınabilir, ancak burada null geçiyoruz
  return (
    <DashboardClient currency={currency}>
      <Suspense fallback={<div className="p-6 text-center">Loading currency data...</div>}>
        <CurrencyPage />
      </Suspense>
    </DashboardClient>
  );
}