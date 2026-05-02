'use client';

import dynamic from 'next/dynamic';
import { useState, useActionState, useEffect } from 'react';
import { createGreenhouseAction, getGreenhousesAction } from './actions';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 flex items-center justify-center rounded">Loading Map...</div>
});

export default function Page() {
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [existingLocations, setExistingLocations] = useState<Record<string, { lat: number; lng: number; color?: 'blue' | 'green' }>>({});
  const [isClient, setIsClient] = useState(false);
  const [state, formAction, isPending] = useActionState(createGreenhouseAction, null);

  useEffect(() => {
    setIsClient(true);
    getGreenhousesAction().then((greenhouses) => {
      const locations = greenhouses.reduce((acc, gh) => {
        acc[gh.name] = { 
          lat: gh.latitude, 
          lng: gh.longitude,
          color: 'green'
        };
        return acc;
      }, {} as Record<string, { lat: number; lng: number; color?: 'blue' | 'green' }>);
      setExistingLocations(locations);
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-8 shadow-md rounded-lg bg-background my-10 border border-border">
      <h1 className="text-3xl font-extrabold mb-8 text-foreground text-center">Add New Greenhouse</h1>
      
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80">Greenhouse Name</label>
          <input name="name" type="text" required placeholder="e.g. Northern Lights Data Center" className="w-full bg-background border-input border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80 block">Location (Click on the map to set coordinates)</label>
          <div className="rounded-md overflow-hidden border border-input">
            {isClient && (
              <LocationPicker 
                onLocationSelect={(lat, lng) => setCoords({ lat, lng })} 
                locations={existingLocations}
              />
            )}
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground mt-1 font-mono">
            <span>Lat: {coords.lat.toFixed(6)}</span>
            <span>Lng: {coords.lng.toFixed(6)}</span>
          </div>
        </div>

        {/* Hidden inputs to pass coordinates to the server action */}
        <input type="hidden" name="latitude" value={coords.lat} />
        <input type="hidden" name="longitude" value={coords.lng} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Ideal Temperature (°C)</label>
            <input name="idealTemperatureC" type="number" step="0.01" required className="w-full bg-background border-input border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Current Temperature (°C)</label>
            <input name="currentTemperatureC" type="number" step="0.01" required className="w-full bg-background border-input border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80">Heat Support from Datacenter (Joules)</label>
          <input name="heatSupportFromDatacenterJoules" type="number" step="0.01" required className="w-full bg-background border-input border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80">Heating Energy Source</label>
          <select name="heatingEnergySource" required defaultValue="" className="w-full bg-background border-input border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer text-foreground">
            <option value="" disabled>Select Heating Energy Source</option>
            <option value="ELECTRIC">Electric</option>
            <option value="GAS">Gas</option>
            <option value="WASTE_HEAT">Waste Heat</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Avg Consumption (kW)</label>
            <input name="avgElectricConsumptionKw" type="number" step="0.01" required className="w-full bg-background border-input border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Water Usage (Liters/Day)</label>
            <input name="waterUsageLitersPerDay" type="number" step="0.01" required className="w-full bg-background border-input border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">CO2 Enrichment Target (PPM)</label>
            <input name="co2EnrichmentTargetPpm" type="number" step="0.01" required className="w-full bg-background border-input border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Carbon Footprint (Mt)</label>
            <input name="carbonFootprintMt" type="number" step="0.01" required className="w-full bg-background border-input border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-foreground" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-4 rounded-md font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg mt-4 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating...' : 'Create Greenhouse'}
        </button>
      </form>
    </div>
  );
}