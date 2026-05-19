'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { MapaBase } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom blue campaign marker
const campaignIcon = new L.DivIcon({
  html: `
    <div style="
      width: 28px; height: 28px;
      background: linear-gradient(135deg, #042f98, #1e3a8a);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(4,47,152,0.3);
    "></div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

interface PublicBasesMapProps {
  bases: MapaBase[];
  isLoading: boolean;
}

const DEFAULT_CENTER: [number, number] = [-16.4, -71.5]; // Arequipa, Peru

export default function PublicBasesMap({ bases, isLoading }: PublicBasesMapProps) {
  const validBases = bases.filter((b) => b.lat && b.lng);

  const center: [number, number] = validBases.length > 0
    ? [
        validBases.reduce((s, b) => s + b.lat, 0) / validBases.length,
        validBases.reduce((s, b) => s + b.lng, 0) / validBases.length,
      ]
    : DEFAULT_CENTER;

  if (isLoading) {
    return <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl" />;
  }

  if (validBases.length === 0) {
    return (
      <div className="h-full w-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
        No hay bases con coordenadas disponibles
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full rounded-2xl z-0"
      style={{ minHeight: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validBases.map((base) => (
        <Marker key={base.id} position={[base.lat, base.lng]} icon={campaignIcon}>
          <Popup className="rounded-xl">
            <div className="p-1 space-y-1 min-w-[160px]">
              <p className="font-bold text-slate-900 text-sm">{base.nombre}</p>
              {base.sector && (
                <p className="text-xs text-primary font-medium">Sector: {base.sector}</p>
              )}
              {base.direccion && (
                <p className="text-xs text-slate-500">{base.direccion}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
