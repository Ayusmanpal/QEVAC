import { Navigation, Clock, Package, AlertOctagon, Building, Zap } from 'lucide-react';

export default function EvacuationPlan({ plan }) {
  if (!plan) return null;

  return (
    <div className="plan-section">
      <div className="plan-card glass-panel urgent">
        <h3><AlertOctagon size={18} /> Urgent Briefing</h3>
        <div className="survival-tip">
          {plan.survival_tip}
        </div>
      </div>

      <div className="plan-card glass-panel">
        <h3><Navigation size={18} /> Primary Route</h3>
        <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>
          {plan.primary_route}
        </p>
        
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Alternate Routes
        </h4>
        <ul className="plan-list">
          {plan.alternate_routes?.map((route, i) => (
            <li key={i}>{route}</li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="plan-card glass-panel" style={{ padding: '1rem' }}>
          <h3><Clock size={16} /> Est. Time</h3>
          <div className="eta-display">
            {plan.estimated_time_minutes} <span>mins</span>
          </div>
        </div>
        
        <div className="plan-card glass-panel" style={{ padding: '1rem' }}>
          <h3><Building size={16} /> Shelters</h3>
          <ul className="plan-list" style={{ fontSize: '0.85rem' }}>
            {plan.nearest_shelters?.map((shelter, i) => (
              <li key={i}>{shelter}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="plan-card glass-panel">
        <h3><Zap size={18} /> Action Plan</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              What to Avoid
            </h4>
            <ul className="plan-list avoid">
              {plan.avoid?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              What to Bring
            </h4>
            <ul className="plan-list bring">
              {plan.bring?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
