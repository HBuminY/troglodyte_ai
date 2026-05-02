'use client';


import dynamic from 'next/dynamic';
import { DataListDisplay } from "@/components/dashboard/data-list-display";
import { useState, useEffect } from 'react';
import { getGreenhousesAction, getDatacentersAction } from "./actions";

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
    </main>
  );
}
