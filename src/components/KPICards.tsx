import React from 'react';
import { Home, CheckCircle2, XCircle, Landmark, ArrowUpRight } from 'lucide-react';
import type { DashboardKPIs } from '../types/property';

interface KPICardsProps {
  kpis: DashboardKPIs;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  // Helper to format currency in Indian style (Lakhs / Crores / Thousands)
  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const cards = [
    {
      title: 'Total Properties Registered',
      value: kpis.totalRegistered.toLocaleString('en-IN'),
      subtitle: 'Across selected tenants',
      icon: <Home className="kpi-icon-inner" />,
      colorClass: 'kpi-registered',
      glowColor: 'rgba(99, 102, 241, 0.15)',
      percentage: '100%',
    },
    {
      title: 'Total Properties Approved',
      value: kpis.totalApproved.toLocaleString('en-IN'),
      subtitle: `${((kpis.totalApproved / (kpis.totalRegistered || 1)) * 100).toFixed(1)}% of total registered`,
      icon: <CheckCircle2 className="kpi-icon-inner" />,
      colorClass: 'kpi-approved',
      glowColor: 'rgba(16, 185, 129, 0.15)',
      percentage: `${((kpis.totalApproved / (kpis.totalRegistered || 1)) * 100).toFixed(0)}%`,
    },
    {
      title: 'Total Properties Rejected',
      value: kpis.totalRejected.toLocaleString('en-IN'),
      subtitle: `${((kpis.totalRejected / (kpis.totalRegistered || 1)) * 100).toFixed(1)}% of total registered`,
      icon: <XCircle className="kpi-icon-inner" />,
      colorClass: 'kpi-rejected',
      glowColor: 'rgba(239, 68, 68, 0.15)',
      percentage: `${((kpis.totalRejected / (kpis.totalRegistered || 1)) * 100).toFixed(0)}%`,
    },
    {
      title: 'Total Collection (Rs.)',
      value: formatINR(kpis.totalCollection),
      subtitle: `Out of approved properties`,
      icon: <Landmark className="kpi-icon-inner" />,
      colorClass: 'kpi-collection',
      glowColor: 'rgba(59, 130, 246, 0.15)',
      percentage: 'Active',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className={`kpi-card glass-panel animate-fade-in ${card.colorClass}`}
          style={{ 
            animationDelay: `${idx * 0.1}s`,
            '--glow-color': card.glowColor 
          } as React.CSSProperties}
        >
          <div className="kpi-header">
            <span className="kpi-title">{card.title}</span>
            <div className="kpi-icon-wrapper">
              {card.icon}
            </div>
          </div>
          
          <div className="kpi-content">
            <h3 className="kpi-value">{card.value}</h3>
            <div className="kpi-footer">
              <span className="kpi-subtitle">{card.subtitle}</span>
              <span className="kpi-trend">
                <ArrowUpRight size={14} /> {card.percentage}
              </span>
            </div>
          </div>
          <div className="card-ambient-glow" />
        </div>
      ))}

      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
          width: 100%;
        }

        .kpi-card {
          position: relative;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 160px;
          overflow: hidden;
        }

        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px -5px var(--glow-color, rgba(255, 255, 255, 0.05)), 
                      0 0 15px 1px var(--glow-color, rgba(255, 255, 255, 0.02));
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
        }

        .kpi-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: 1.3;
          max-width: 75%;
        }

        .kpi-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          transition: transform var(--transition-normal);
        }

        .kpi-card:hover .kpi-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .kpi-icon-inner {
          width: 20px;
          height: 20px;
        }

        /* Color classes config */
        .kpi-registered .kpi-icon-wrapper {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: var(--accent-primary);
        }

        .kpi-approved .kpi-icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--color-approved);
        }

        .kpi-rejected .kpi-icon-wrapper {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--color-rejected);
        }

        .kpi-collection .kpi-icon-wrapper {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: var(--color-collection);
        }

        .kpi-content {
          margin-top: auto;
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          font-family: var(--font-heading);
          color: white;
          line-height: 1;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        .kpi-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .kpi-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 70%;
        }

        .kpi-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .kpi-registered .kpi-trend { color: var(--accent-primary); }
        .kpi-approved .kpi-trend { color: var(--color-approved); }
        .kpi-rejected .kpi-trend { color: var(--color-rejected); }
        .kpi-collection .kpi-trend { color: var(--color-collection); }

        .card-ambient-glow {
          position: absolute;
          bottom: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--glow-color) 0%, rgba(0,0,0,0) 70%);
          z-index: -1;
          opacity: 0.5;
          pointer-events: none;
          transition: transform var(--transition-normal), opacity var(--transition-normal);
        }

        .kpi-card:hover .card-ambient-glow {
          transform: scale(1.3);
          opacity: 0.8;
        }

        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
          .kpi-card {
            height: 140px;
          }
        }
      `}</style>
    </div>
  );
};
