'use client';


import dynamic from 'next/dynamic';
import { DataListDisplay } from "@/components/dashboard/data-list-display";
import { useState, useEffect, useCallback } from 'react';
import { getGreenhousesAction, getDatacentersAction, getOptimizedDCsToGHsMatrixAction } from "./actions";
import { Button } from '@/components/ui/button';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 flex items-center justify-center rounded">Loading Map...</div>
});

export default function DashboardPage() {
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const [greenhouses, setGreenhouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedLocations, setDisplayedLocations] = useState<Record<string, { lat: number; lng: number; color?: 'blue' | 'green' }>>({});
  const [isClient, setIsClient] = useState(false);

  // State for optimization logic
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set to true once component mounts on client

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

  /**
   * handlePairing is memoized with useCallback because it is passed to a button event.
   * This prevents unnecessary re-renders of the Button component.
   */
  const handlePairing = useCallback(async () => {
    setIsOptimizing(true);
    try {
      const result = await getOptimizedDCsToGHsMatrixAction();
      setOptimizationResult(result);
      console.log("Optimization Result:", result);
    } catch (error) {
      console.error("Failed to get optimized pairing:", error);
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  /**
   * useEffect Logic:
   * Appropriate for clearing stale optimization results if the 
   * base data (datacenters or greenhouses) is updated or refreshed.
   */
  useEffect(() => {
    if (optimizationResult) {
      setOptimizationResult(null);
    }
  }, [datacenters, greenhouses]);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard data...</div>;
  }

  return (
    <main>
      <div className='w-full pt-20'>
        {isClient && ( // Conditionally render LocationPicker only on the client
          <LocationPicker
            onLocationSelect={(lat, lng) => { return false }}
            locations={displayedLocations}
          />
        )}
      </div>

      <div>
        <div>
          {optimizationResult && (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded mt-4">
              <h3 className="text-lg font-semibold mb-2">Optimized Pairing Results:</h3>
              <ul className="list-disc list-inside">
                {optimizationResult.results.map((pair: any, index: number) => (
                  <li key={index}>
                    DC: <strong>{pair.datacenter.name}</strong> → GH: <strong>{pair.greenhouse.name}</strong> (Distance: {pair.distance.toFixed(2)} meters)
                  </li>
                ))}
              </ul>
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
            <DataListDisplay title="Data Centers" data={datacenters} />
          </div>
          <div className="min-w-[600px] flex-1 h-full overflow-auto">
            <DataListDisplay title="Greenhouses" data={greenhouses} />
          </div>
        </section>
      </div>
    </main >
  );
}
