// components/LocationPicker.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';

// Fix for default marker icons in Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  locations?: Record<string, { lat: number; lng: number }>;
}

export default function LocationPicker({ 
  onLocationSelect, 
  locations = {} 
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([38.6244, 34.7144]); // Default coords

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });

    return position === null ? null : (
      <Marker position={position} draggable={true} eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
        }
      }} />
    );
  }

  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
      
      {Object.entries(locations).map(([name, coords]) => (
        <Marker key={name} position={[coords.lat, coords.lng]}>
          <Popup>{name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}