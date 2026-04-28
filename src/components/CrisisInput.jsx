import { useState } from 'react';
import { MapPin, AlertTriangle, Activity } from 'lucide-react';

export default function CrisisInput({ onGenerate, loading }) {
  const [location, setLocation] = useState('');
  const [crisisType, setCrisisType] = useState('fire');
  const [severity, setSeverity] = useState('major');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location) return;
    onGenerate({ location, crisisType, severity });
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
      });
    }
  };

  return (
    <div className="form-section">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} /> Location
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="City, neighborhood, or GPS" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="glass-input" 
              style={{ width: 'auto', cursor: 'pointer' }}
              onClick={handleUseMyLocation}
              title="Use current location"
            >
              <MapPin size={18} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} /> Crisis Type
          </label>
          <select 
            className="glass-input" 
            value={crisisType}
            onChange={(e) => setCrisisType(e.target.value)}
          >
            <option value="fire">Wildfire / Urban Fire</option>
            <option value="flood">Flash Flood / Rising Water</option>
            <option value="earthquake">Earthquake</option>
            <option value="chemical">Chemical Spill / Hazmat</option>
            <option value="unrest">Civil Unrest</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} /> Severity Level
          </label>
          <select 
            className="glass-input" 
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="minor">Minor / Advisory</option>
            <option value="major">Major / Warning</option>
            <option value="catastrophic">Catastrophic / Evacuate Now</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !location}>
          {loading ? 'Analyzing...' : 'Generate Evacuation Route'}
        </button>
      </form>
    </div>
  );
}
