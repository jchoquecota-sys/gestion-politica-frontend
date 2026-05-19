'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPoint } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MapPin, Landmark, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix for default leaflet icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface BasesMapProps {
  points?: MapPoint[];
  isLoading: boolean;
}

export default function BasesMap({ points, isLoading }: BasesMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Centro en Tacna, Perú
  const center: [number, number] = [-18.0145, -70.2536]; 

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm h-[650px] animate-pulse bg-slate-50 dark:bg-slate-900"></Card>
    );
  }

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <Card className={`
      border-none shadow-sm overflow-hidden bg-white dark:bg-slate-950 flex flex-col 
      ${isFullscreen ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none' : 'h-full'}
      transition-all duration-300
    `}>
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Mapa Estratégico Tacna</CardTitle>
            <CardDescription>Distribución territorial de bases operativas</CardDescription>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleFullscreen}
          className="ml-auto"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="flex-1 w-full z-0 border-t border-slate-100 dark:border-slate-800">
          <MapContainer 
            center={center} 
            zoom={13} 
            scrollWheelZoom={true} 
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points?.map((point) => (
              <Marker key={point.id} position={[point.lat, point.lng]}>
                <Popup>
                  <div className="p-1">
                    <h4 className="font-bold text-primary m-0 flex items-center gap-1">
                      <Landmark className="h-3 w-3" /> {point.nombre}
                    </h4>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 mb-2 tracking-wider">
                      Sector: {point.sector}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">Responsable:</span> {point.responsable}
                      </p>
                      <p className="text-[10px] text-slate-500 italic">
                        {point.direccion}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
