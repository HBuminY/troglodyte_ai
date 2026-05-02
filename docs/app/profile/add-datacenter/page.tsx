// app/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { 
  ssr: false,
  loading: () => <p>Loading Map...</p>
});

export default function Page() {
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });

  const handleSubmit = async () => {
    // Send coords to your Next.js API route or external backend
    const res = await fetch('/api/save-location', {
      method: 'POST',
      body: JSON.stringify(coords),
    });
  };

  return (
    <div>
      <h1>Pick a Location</h1>
      <LocationPicker onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
      <button onClick={handleSubmit}>Submit Coordinates</button>
    </div>
  );
}