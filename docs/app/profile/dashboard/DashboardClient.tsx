'use client';

import dynamic from 'next/dynamic';
import { DataListDisplay } from "@/components/dashboard/data-list-display";
import { useState, useEffect, useCallback } from 'react';
import {
  getGreenhousesAction,
  getDatacentersAction,
  getOptimizedDCsToGHsMatrixAction,
  callModelAction,
  calculateDCCarbonFootprintAction
} from "./actions";
import { Button } from '@/components/ui/button';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 flex items-center justify-center rounded">Loading Map...</div>
});

// Artık Server Component'i children olarak dışarıdan alacağız
export default function DashboardClient({ children }: { children: React.ReactNode }) {
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const [greenhouses, setGreenhouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedLocations, setDisplayedLocations] = useState<Record<string, { lat: number; lng: number; color?: 'blue' | 'green' }>>({});
  const [isClient, setIsClient] = useState(false);

  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [modelResult, setModelResult] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function fetchData() {
      try {
        const [dcData, ghData] = await Promise.all([
          getDatacentersAction(),
          getGreenhousesAction()
        ]);
        setDatacenters(dcData || []);
        setGreenhouses(ghData || []);

        const locations: Record<string, { lat: number; lng: number; color?: 'blue' | 'green' }> = {};
        dcData?.forEach((dc: any) => {
          locations[dc.name] = { lat: dc.latitude, lng: dc.longitude, color: 'blue' };
        });
        ghData?.forEach((gh: any) => {
          locations[gh.name] = { lat: gh.latitude, lng: gh.longitude, color: 'green' };
        });
        setDisplayedLocations(locations);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePairing = useCallback(async () => {
    setIsOptimizing(true);
    setModelResult(null);
    try {
      const result = await getOptimizedDCsToGHsMatrixAction();
      setDatacenters(result.datacenters);
      setGreenhouses(result.greenhouses);
      setOptimizationResult(result);

      const modelData = await callModelAction(result.greenhouses, result.datacenters);
      if (modelData) {
        setModelResult(modelData);
      }
    } catch (error) {
      console.error("Failed to get optimized pairing:", error);
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard data...</div>;
  }

  return (
    <main>
      <div className='w-full pt-20'>
        {isClient && (
          <LocationPicker
            onLocationSelect={(lat, lng) => { return false }}
            locations={displayedLocations}
          />
        )}
      </div>
      
      {/* Döviz componenti Server'dan buraya inject edilecek */}
      {children}

      <div>
        <div className="flex flex-row gap-4 items-start">
          {optimizationResult && (
            <div className="flex-1 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded mt-4">
              <h3 className="text-lg font-semibold mb-2">Optimized Pairing Results:</h3>
              <ul className="list-disc list-inside">
                {optimizationResult.results.map((pair: any, index: number) => (
                  <li key={index}>
                    DC: <strong>{pair.datacenter.name}</strong> → GH: <strong>{pair.greenhouse.name}</strong>
                    <span className="text-muted-foreground ml-2">
                      ({pair.distance.toFixed(2)}m) | {pair.carbonFootprint.toFixed(4)} - {pair.carbonOffset.toFixed(4)} = {(pair.carbonFootprint - pair.carbonOffset).toFixed(4)} Mt CO2e</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {modelResult && (
            <div className="flex-1 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded mt-4">
              <h3 className="text-lg font-semibold mb-2">Model Output:</h3>
              <pre className="text-xs overflow-auto max-h-60 p-2 bg-background/50 rounded">
                {JSON.stringify(modelResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={handlePairing}
          disabled={isOptimizing || datacenters.length === 0 || greenhouses.length === 0}
        >
          {isOptimizing ? "Calculating..." : "Get Optimized Route Pairing"}
        </Button>
      </div>

      <div className="flex-1 w-full p-8 h-[calc(100vh-80px)] overflow-hidden">
        <section className="flex flex-row gap-8 h-full overflow-auto pb-4">
          <div className="min-w-[600px] flex-1 h-full overflow-auto">
            <DataListDisplay title="Data Centers" data={datacenters} isDC={true} />
          </div>
          <div className="min-w-[600px] flex-1 h-full overflow-auto">
            <DataListDisplay title="Greenhouses" data={greenhouses} />
          </div>
        </section>
      </div>
    </main>
  );
}