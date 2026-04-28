import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import BlockageReporter from './BlockageReporter';

// Fix for default marker icons in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blockedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deviceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const searchIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ isReportingMode, setIsReportingMode, setBlockedRoutes }) {
  useMapEvents({
    click(e) {
      if (isReportingMode) {
        const newBlockage = {
          id: Date.now(),
          position: [e.latlng.lat, e.latlng.lng],
          type: 'user-reported'
        };
        setBlockedRoutes(prev => [...prev, newBlockage]);
        setIsReportingMode(false); // Turn off after placing
      }
    }
  });
  return null;
}

export default function LiveMap({ location, crisisType, plan, theme, routeCoords = [], safeZone = null, dangerRadius = 800 }) {
  // Default to a central location (e.g., San Francisco for demo)
  const [center, setCenter] = useState([37.7749, -122.4194]);
  const [zoom, setZoom] = useState(13);
  const [blockedRoutes, setBlockedRoutes] = useState([]);
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [isReportingMode, setIsReportingMode] = useState(false);

  // Get real-time device location
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDeviceLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location: ", error);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Center on device location initially if no location searched
  useEffect(() => {
    if (deviceLocation && !location) {
      setCenter(deviceLocation);
      setZoom(15);
    }
  }, [deviceLocation, location]);

  // Mock geocoding and route updating based on inputs
  useEffect(() => {
    if (location) {
      // In a real app, use a Geocoding service here.
      // For demo, if coordinates are provided, parse them.
      if (location.includes(',')) {
        const [lat, lng] = location.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          setCenter([lat, lng]);
          setZoom(15);
        }
      }
    }
  }, [location]);



  const getDangerColor = () => {
    switch(crisisType) {
      case 'fire': return '#ef4444'; // Red
      case 'flood': return '#3b82f6'; // Blue
      case 'chemical': return '#8b5cf6'; // Purple
      default: return '#f59e0b'; // Amber
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 0, cursor: isReportingMode ? 'crosshair' : 'grab' }}
        zoomControl={false}
      >
        <MapUpdater center={center} zoom={zoom} />
        <MapClickHandler 
          isReportingMode={isReportingMode} 
          setIsReportingMode={setIsReportingMode} 
          setBlockedRoutes={setBlockedRoutes} 
        />
        
        {/* Dynamic map tiles based on theme */}
        <TileLayer
          key={theme} // Force re-render when theme changes to ensure tiles reload properly
          url={theme === 'light' 
            ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Danger Zone */}
        {plan && (
          <Circle 
            center={center} 
            radius={dangerRadius} 
            pathOptions={{ 
              color: getDangerColor(), 
              fillColor: getDangerColor(), 
              fillOpacity: 0.2,
              weight: 1
            }} 
          />
        )}

        {/* Device Location Marker */}
        {deviceLocation && (
          <Marker position={deviceLocation} icon={deviceIcon}>
            <Popup>Your Real-time Location</Popup>
          </Marker>
        )}

        {/* Searched Location */}
        {location && <Marker position={center} icon={searchIcon}><Popup>Searched Area</Popup></Marker>}

        {/* Evacuation Route */}
        {routeCoords.length > 0 && (
          <Polyline 
            positions={routeCoords} 
            pathOptions={{ color: '#10b981', weight: 6, opacity: 0.8 }} 
          />
        )}

        {/* Mock Shelters / Safe Zone */}
        {plan && safeZone && (
          <Marker position={safeZone} icon={shelterIcon}>
            <Popup>Safe Zone / Shelter</Popup>
          </Marker>
        )}

        {/* Blocked Routes */}
        {blockedRoutes.map(block => (
          <Marker key={block.id} position={block.position} icon={blockedIcon}>
            <Popup>
              <strong>Blocked Route</strong><br />
              Reported by community
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating UI Elements over Map */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <BlockageReporter 
          isReportingMode={isReportingMode} 
          onToggleMode={() => setIsReportingMode(!isReportingMode)} 
        />
      </div>
    </div>
  );
}
