import { Suspense } from 'react';
import DashboardClient from './DashboardClient';
import { CurrencyPage } from './currencyPage';

// Bu bir Server Component'tir ('use client' içermez)
export default function DashboardPage() {
  return (
    <DashboardClient>
      <Suspense fallback={<div className="p-6 text-center">Loading currency data...</div>}>
        <CurrencyPage />
      </Suspense>
    </DashboardClient>
  );
}