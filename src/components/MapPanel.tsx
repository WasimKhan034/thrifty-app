import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { EnrichedSpot, UserLocation } from "../types/domain";

// Fix Leaflet default icon paths in Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPanelProps {
  spots: EnrichedSpot[];
  selectedSpot: EnrichedSpot | null;
  userLocation: UserLocation | null;
  mapView: UserLocation & { zoom: number };
  onSelectSpot: (spotId: string) => void;
}

export function MapPanel({ spots, selectedSpot, userLocation, mapView, onSelectSpot }: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [mapView.lat, mapView.lng],
      zoom: mapView.zoom,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
        userMarkerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync map view when it changes
  useEffect(() => {
    mapRef.current?.setView([mapView.lat, mapView.lng], mapView.zoom, { animate: true });
  }, [mapView]);

  // Sync spot markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const existing = markersRef.current;

    // Remove stale markers
    const spotIds = new Set(spots.map((s) => s.id));
    for (const [id, marker] of existing) {
      if (!spotIds.has(id)) {
        map.removeLayer(marker);
        existing.delete(id);
      }
    }

    // Add new markers
    for (const spot of spots) {
      if (existing.has(spot.id)) continue;
      const marker = L.marker([spot.lat, spot.lng])
        .addTo(map)
        .bindPopup(`<strong>${spot.name}</strong><br/>${spot.city} · ${spot.type}`);
      marker.on("click", () => onSelectSpot(spot.id));
      existing.set(spot.id, marker);
    }
  }, [spots, onSelectSpot]);

  // Highlight selected spot
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSpot) return;
    const marker = markersRef.current.get(selectedSpot.id);
    if (marker) {
      marker.openPopup();
      map.panTo([selectedSpot.lat, selectedSpot.lng]);
    }
  }, [selectedSpot]);

  // User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const icon = L.divIcon({
        className: "",
        html: '<div style="width:14px;height:14px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon })
        .addTo(map)
        .bindPopup("You are here");
    }
  }, [userLocation]);

  return <div ref={containerRef} className="map-panel" />;
}
