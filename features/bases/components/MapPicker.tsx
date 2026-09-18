'use client';

import { useEffect, useState } from 'react';
import { LatLngTuple } from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Coordenadas por defecto (Alto de la Alianza, Tacna, Perú)
const DEFAULT_CENTER: LatLngTuple = [-18.005, -70.248];

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
  disabled?: boolean;
  height?: number;
}

// Componente para re-centrar el mapa cuando cambian las coordenadas externamente
function ChangeView({ center }: { center: LatLngTuple }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Componente interno para manejar eventos del mapa
function LocationMarker({ lat, lng, onChange, disabled }: MapPickerProps) {
  const [position, setPosition] = useState<LatLngTuple>([lat || DEFAULT_CENTER[0], lng || DEFAULT_CENTER[1]]);

  // Sincronizar posición si cambian los props (ej: al cargar datos de edición)
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  useMapEvents({
    click(e) {
      if (disabled) return;
      const { lat: newLat, lng: newLng } = e.latlng;
      setPosition([newLat, newLng]);
      onChange(newLat, newLng);
    },
  });

  return (
    <>
      <ChangeView center={position} />
      <Marker position={position} />
    </>
  );
}

export default function MapPicker(props: MapPickerProps) {
  const [isClient, setIsClient] = useState(false);
  const mapHeight = props.height ?? 300;

  useEffect(() => {
    setIsClient(true);
    
    // Arreglar iconos de Leaflet
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  if (!isClient) {
    return (
      <div
        className="w-full bg-slate-100 animate-pulse rounded-md flex items-center justify-center text-slate-400"
        style={{ height: mapHeight }}
      >
        Cargando mapa...
      </div>
    );
  }

  const center: LatLngTuple = props.lat && props.lng ? [props.lat, props.lng] : DEFAULT_CENTER;

  return (
    <div className="w-full rounded-md overflow-hidden border relative z-0" style={{ height: mapHeight }}>
      <MapContainer 
        center={center} 
        zoom={15} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker {...props} />
      </MapContainer>
    </div>
  );
}
