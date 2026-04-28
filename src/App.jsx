import { useState, useEffect } from 'react';
import { ShieldAlert, Sun, Moon } from 'lucide-react';
import './App.css';
import CrisisInput from './components/CrisisInput';
import EvacuationPlan from './components/EvacuationPlan';
import LiveMap from './components/LiveMap';
import { generateEvacuationPlan } from './services/ai';

function App() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [crisisType, setCrisisType] = useState('fire');
  const [severity, setSeverity] = useState('major');
  const [theme, setTheme] = useState('dark');
  const [routeInfo, setRouteInfo] = useState({ coords: [], safeZone: null });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleGeneratePlan = async (formData) => {
    setLoading(true);
    setLocation(formData.location);
    setCrisisType(formData.crisisType);
    setSeverity(formData.severity);
    
    const dangerRadius = formData.severity === 'catastrophic' ? 5000 : formData.severity === 'major' ? 2500 : 800;
    
    try {
      let startLocation = null;
      if ('geolocation' in navigator) {
        startLocation = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
            () => resolve(null),
            { timeout: 5000 }
          );
        });
      }

      let crisisCenter = [37.7749, -122.4194]; // Default
      if (formData.location && formData.location.includes(',')) {
        const [latStr, lngStr] = formData.location.split(',');
        const lat = parseFloat(latStr.trim());
        const lng = parseFloat(lngStr.trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          crisisCenter = [lat, lng];
        }
      }

      let fetchedRouteCoords = [];
      let actualStreets = ["Main Route", "Alternative Route"];
      let eta = 15;
      let calculatedSafeZone = null;

      if (startLocation) {
        // Calculate safe zone outside the danger radius + 1500m buffer
        const metersPerDegree = 111320;
        const safeDistanceDegrees = (dangerRadius + 1500) / metersPerDegree;

        // Calculate direction vector from crisis to user
        let dx = startLocation[1] - crisisCenter[1];
        let dy = startLocation[0] - crisisCenter[0];
        let dist = Math.sqrt(dx*dx + dy*dy);

        let dirX, dirY;
        if (dist === 0) {
           // Default to North-East if exactly on center
           dirX = 0.707;
           dirY = 0.707;
        } else {
           dirX = dx / dist;
           dirY = dy / dist;
        }

        const safeLng = crisisCenter[1] + (dirX * safeDistanceDegrees);
        const safeLat = crisisCenter[0] + (dirY * safeDistanceDegrees);
        calculatedSafeZone = [safeLat, safeLng];

        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${startLocation[1]},${startLocation[0]};${safeLng},${safeLat}?overview=full&geometries=geojson&steps=true`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const routeData = data.routes[0];
            fetchedRouteCoords = routeData.geometry.coordinates.map(c => [c[1], c[0]]);
            eta = Math.max(1, Math.round(routeData.duration / 60));
            const streets = routeData.legs[0].steps.map(s => s.name).filter(n => n && n !== '');
            if (streets.length > 0) {
              actualStreets = [...new Set(streets)];
            }
          }
        } catch (err) {
          console.error("OSRM fetch error:", err);
        }
      }
      
      setRouteInfo({ coords: fetchedRouteCoords, safeZone: calculatedSafeZone });

      if (import.meta.env.VITE_GEMINI_API_KEY) {
        // Use Real API
        const planData = await generateEvacuationPlan({
          location: formData.location,
          crisisType: formData.crisisType,
          severity: formData.severity,
          blockedRoutes: [] // We will connect this to map state later
        });
        setPlan(planData);
      } else {
        // Dynamic Mock Data using real streets
        console.warn("No VITE_GEMINI_API_KEY found, using dynamic mock data.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const primaryStreet = actualStreets[0] || "the main road";
        const secondaryStreet = actualStreets.length > 1 ? actualStreets[1] : "a local detour";
        const tertiaryStreet = actualStreets.length > 2 ? actualStreets[2] : "safe residential streets";

        const mockPlan = {
          primary_route: `Take ${primaryStreet} towards the designated safe zone. Proceed with caution.`,
          alternate_routes: [
            `If ${primaryStreet} is blocked, detour via ${secondaryStreet}.`,
            `Follow ${tertiaryStreet} as a last resort.`
          ],
          avoid: [
            `Major intersections near ${primaryStreet}`,
            formData.crisisType === 'flood' ? "Low-lying areas and underpasses" : "Areas with dense structures or debris",
            "Reported community blockages"
          ],
          bring: ["Water", "Flashlight", "Important Documents", "Medications"],
          nearest_shelters: ["Community Center Safe Zone", "High Ground Assembly Point"],
          estimated_time_minutes: eta,
          survival_tip: formData.crisisType === 'fire' 
            ? "Stay low to avoid smoke inhalation. Cover your mouth with a damp cloth."
            : formData.crisisType === 'flood'
            ? "Move to high ground immediately. Do NOT attempt to walk or drive through moving water."
            : formData.crisisType === 'earthquake'
            ? "Drop, Cover, and Hold On. Expect aftershocks during evacuation."
            : formData.crisisType === 'chemical'
            ? "Seal your vehicle windows and turn off the A/C to prevent drawing in outside air."
            : "Follow emergency personnel instructions and stay alert."
        };
        setPlan(mockPlan);
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
      alert("Failed to generate plan. Please check the console or your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert size={28} color="var(--accent-red)" />
          <h1>Qevac</h1>
          <span className="badge">Live Crisis Network</span>
        </div>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle" 
          aria-label="Toggle theme"
          style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.3s' }}
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <CrisisInput onGenerate={handleGeneratePlan} loading={loading} />
          {plan && <EvacuationPlan plan={plan} />}
        </aside>

        <section className="map-container">
          <LiveMap 
            location={location} 
            crisisType={crisisType} 
            plan={plan} 
            theme={theme} 
            routeCoords={routeInfo.coords}
            safeZone={routeInfo.safeZone}
            dangerRadius={dangerRadius}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
