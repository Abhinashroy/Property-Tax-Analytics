import React from 'react';
import { MapPin, Globe } from 'lucide-react';

interface TenantFilterProps {
  selectedTenant: string;
  setSelectedTenant: (tenant: string) => void;
}

export const TenantFilter: React.FC<TenantFilterProps> = ({
  selectedTenant,
  setSelectedTenant,
}) => {
  const tenants = [
    'All Cities',
    'Delhi',
    'Mumbai',
    'Pune',
    'Bengaluru',
    'Chennai',
    'Hyderabad',
    'Ahmedabad',
    'Kolkata',
    'Jaipur',
    'Lucknow',
  ];

  return (
    <div className="tenant-filter-wrapper glass-panel animate-fade-in">
      <div className="filter-info">
        {selectedTenant === 'All Cities' ? (
          <Globe className="filter-info-icon globe-icon-glow" size={18} />
        ) : (
          <MapPin className="filter-info-icon pin-icon-glow" size={18} />
        )}
        <div className="filter-text">
          <span className="filter-label">Active Tenant</span>
          <span className="filter-current">{selectedTenant}</span>
        </div>
      </div>

      <div className="select-container">
        <select
          value={selectedTenant}
          onChange={(e) => setSelectedTenant(e.target.value)}
          className="tenant-select"
        >
          {tenants.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <style>{`
        .tenant-filter-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          margin-bottom: 24px;
          width: 100%;
          border-left: 4px solid var(--accent-primary);
        }

        .filter-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .filter-info-icon {
          color: var(--accent-primary);
          transition: transform var(--transition-normal);
        }

        .tenant-filter-wrapper:hover .filter-info-icon {
          transform: scale(1.1);
        }

        .globe-icon-glow {
          filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
        }

        .pin-icon-glow {
          color: #a855f7;
          filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.4));
        }

        .filter-text {
          display: flex;
          flex-direction: column;
        }

        .filter-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .filter-current {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          font-family: var(--font-heading);
        }

        .select-container {
          position: relative;
        }

        .tenant-select {
          background: rgba(8, 12, 20, 0.5);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 10px 16px;
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          min-width: 180px;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }

        .tenant-select:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }

        .tenant-select option {
          background-color: #0f172a;
          color: white;
          padding: 12px;
        }

        @media (max-width: 576px) {
          .tenant-filter-wrapper {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 16px;
          }
          
          .tenant-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
