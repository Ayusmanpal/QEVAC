import { AlertOctagon, MousePointerClick } from 'lucide-react';

export default function BlockageReporter({ isReportingMode, onToggleMode }) {
  return (
    <button 
      onClick={onToggleMode}
      className={`glass-panel ${isReportingMode ? '' : 'btn-report'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        border: `1px solid ${isReportingMode ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
        background: isReportingMode ? 'rgba(245, 158, 11, 0.2)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.75), rgba(185, 28, 28, 0.9))',
        backdropFilter: 'blur(10px)',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        transition: 'all 0.3s ease',
        boxShadow: isReportingMode ? '0 0 15px rgba(245, 158, 11, 0.3)' : '0 4px 15px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
      }}
    >
      {isReportingMode ? <MousePointerClick size={18} /> : <AlertOctagon size={18} />}
      {isReportingMode ? 'Click map to place' : 'Flag Route Blocked'}
    </button>
  );
}
