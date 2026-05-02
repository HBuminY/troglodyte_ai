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

const getColorIcon = (color?: 'blue' | 'green') => {
  if (color === 'blue' || color === 'green') {
    return L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }
  return new L.Icon.Default();
};

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  locations?: Record<string, { lat: number; lng: number; color?: "blue" | "green" }>;
}

function LocationMarker({
  position,
  setPosition,
  onLocationSelect,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
        },
      }}
    />
  );
}

export default function LocationPicker({
  onLocationSelect,
  locations = {},
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    38.6244, 34.7144,
  ]); // Default coords

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker
        position={position}
        setPosition={setPosition}
        onLocationSelect={onLocationSelect}
      />
      
      {Object.entries(locations).map(([name, coords]) => (
        <Marker 
          key={name} 
          position={[coords.lat, coords.lng]}
          icon={getColorIcon(coords.color)}
        >
          <Popup>{name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}