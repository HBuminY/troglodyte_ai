'use client';

import dynamic from 'next/dynamic';
import { useState, useActionState } from 'react';
import { createDatacenterAction } from './actions';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 flex items-center justify-center rounded">Loading Map...</div>
});

export default function Page() {
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [state, formAction, isPending] = useActionState(createDatacenterAction, null);

  return (
    <div className="max-w-2xl mx-auto p-8 shadow-md rounded-lg bg-white my-10 border border-gray-100">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800 text-center">Add New Datacenter</h1>
      
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Datacenter Name</label>
          <input name="name" type="text" required placeholder="e.g. Northern Lights Data Center" className="w-full border-gray-300 border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Location (Click on the map to set coordinates)</label>
          <div className="rounded-md overflow-hidden border border-gray-300">
            <LocationPicker onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
          </div>
          <div className="flex gap-4 text-xs text-gray-500 mt-1 font-mono">
            <span>Lat: {coords.lat.toFixed(6)}</span>
            <span>Lng: {coords.lng.toFixed(6)}</span>
          </div>
        </div>

        {/* Hidden inputs to pass coordinates to the server action */}
        <input type="hidden" name="latitude" value={coords.lat} />
        <input type="hidden" name="longitude" value={coords.lng} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Avg Consumption (kW)</label>
            <input name="avgElectricConsumptionKw" type="number" step="0.01" required className="w-full border-gray-300 border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">PUE</label>
            <input name="pue" type="number" step="0.01" required placeholder="e.g. 1.2" className="w-full border-gray-300 border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Cooling Type</label>
          <input name="coolingType" type="text" required placeholder="e.g. WATER, AIR" className="w-full border-gray-300 border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Cooling Energy (kW)</label>
            <input name="avgCoolingEnergyKw" type="number" step="0.01" required className="w-full border-gray-300 border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Network Usage (Tbps)</label>
            <input name="avgNetworkUsageTbps" type="number" step="0.01" required className="w-full border-gray-300 border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Renewable Energy (%)</label>
            <input name="renewableEnergyPercentage" type="number" step="0.01" min="0" max="100" required className="w-full border-gray-300 border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Carbon Footprint (Mt)</label>
            <input name="carbonFootprintMt" type="number" step="0.01" required className="w-full border-gray-300 border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-4 rounded-md font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg mt-4 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating...' : 'Create Datacenter'}
        </button>
      </form>
    </div>
  );
}