import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TenantFilter } from './components/TenantFilter';
import { KPICards } from './components/KPICards';
import { ComparisonCharts } from './components/ComparisonCharts';
import { PropertyTable } from './components/PropertyTable';
import { AIChatAssistant } from './components/AIChatAssistant';
import type { Property, DashboardKPIs, CityData } from './types/property';
import { Sparkles, MessageSquare, Info } from 'lucide-react';
import data from './properties.json';

const propertiesData = data as Property[];

function App() {
  const [selectedTenant, setSelectedTenant] = useState<string>('All Cities');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties'>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // 1. Filter properties based on the active tenant (dropdown selection)
  const filteredProperties = useMemo(() => {
    if (selectedTenant === 'All Cities') {
      return propertiesData;
    }
    return propertiesData.filter((p) => p.tenant === selectedTenant);
  }, [selectedTenant]);

  // 2. Compute Dashboard-wide live KPIs
  const kpis = useMemo<DashboardKPIs>(() => {
    const totalRegistered = filteredProperties.length;
    const totalApproved = filteredProperties.filter((p) => p.status === 'Approved').length;
    const totalRejected = filteredProperties.filter((p) => p.status === 'Rejected').length;
    const totalPending = filteredProperties.filter((p) => p.status === 'Pending').length;
    const totalCollection = filteredProperties.reduce((sum, p) => sum + p.collection_inr, 0);

    return {
      totalRegistered,
      totalApproved,
      totalRejected,
      totalPending,
      totalCollection,
    };
  }, [filteredProperties]);

  // 3. Compute city statistics for comparison charts (always includes all 10 cities side-by-side)
  const cityDataList = useMemo<CityData[]>(() => {
    const cities = [
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

    return cities.map((city) => {
      const cityProps = propertiesData.filter((p) => p.tenant === city);
      const approved = cityProps.filter((p) => p.status === 'Approved').length;
      const rejected = cityProps.filter((p) => p.status === 'Rejected').length;
      const pending = cityProps.filter((p) => p.status === 'Pending').length;
      const collection = cityProps.reduce((sum, p) => sum + p.collection_inr, 0);

      return {
        city,
        registered: cityProps.length,
        approved,
        rejected,
        pending,
        collection,
      };
    });
  }, []);

  return (
    <>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        openChat={() => setIsChatOpen(true)} 
      />

      <main className="main-content-layout">
        <header className="dashboard-header animate-fade-in">
          <div className="header-info">
            <div className="header-title-wrapper">
              <h1>UPYOG Property Tax Dashboard</h1>
              <span className="platform-tag">NUDM Multi-Tenant Platform</span>
            </div>
            <p className="header-desc">
              Real-time property tax registration, verification audit, and collection analytics across 10 municipal corporation tenants.
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="chat-toggle-btn" 
              onClick={() => setIsChatOpen(prev => !prev)}
              title="Open AI Chat Assistant"
            >
              <Sparkles size={16} className="sparkle-icon" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </header>

        {/* Tenant dropdown filter updates all values live */}
        <TenantFilter 
          selectedTenant={selectedTenant} 
          setSelectedTenant={setSelectedTenant} 
        />

        {activeTab === 'dashboard' ? (
          <div className="tab-container">
            {/* KPI Cards Grid */}
            <KPICards kpis={kpis} />

            {/* Visual Analytics */}
            <ComparisonCharts 
              cityDataList={cityDataList} 
              properties={filteredProperties} 
            />

            {/* Quick Insights Banner */}
            <div className="insights-banner glass-panel animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <Info className="insight-icon" size={20} />
              <div className="insight-text">
                <strong>Platform Audit Status:</strong> Out of {kpis.totalRegistered.toLocaleString('en-IN')} properties in {selectedTenant}, {kpis.totalApproved.toLocaleString('en-IN')} are Approved, {kpis.totalPending.toLocaleString('en-IN')} are Pending Verification, and {kpis.totalRejected.toLocaleString('en-IN')} are Rejected. 
                Approval rate stands at <strong>{((kpis.totalApproved / (kpis.totalRegistered || 1)) * 100).toFixed(1)}%</strong>.
              </div>
            </div>
          </div>
        ) : (
          <div className="tab-container">
            <PropertyTable properties={filteredProperties} />
          </div>
        )}

        {/* Floating AI Chat Assistant */}
        <AIChatAssistant 
          properties={propertiesData} 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
        />

        {/* Floating Chat Trigger when closed */}
        {!isChatOpen && (
          <button 
            className="floating-chat-trigger animate-bounce-slow" 
            onClick={() => setIsChatOpen(true)}
            title="Open AI Chat Assistant"
          >
            <MessageSquare size={24} />
            <span className="pulse-glowing" />
          </button>
        )}
      </main>

      <style>{`
        .main-content-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 32px;
          overflow-y: auto;
          background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.02) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.02) 0%, transparent 40%);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          gap: 20px;
        }

        .header-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .header-title-wrapper h1 {
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .platform-tag {
          font-size: 0.65rem;
          font-weight: 700;
          background: rgba(99, 102, 241, 0.1);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .header-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 750px;
          line-height: 1.5;
        }

        .chat-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--gradient-accent);
          border: none;
          color: white;
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .chat-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .sparkle-icon {
          animation: spin 4s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .tab-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }

        .insights-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          border-left: 4px solid var(--color-collection);
          background: rgba(59, 130, 246, 0.03);
        }

        .insight-icon {
          color: var(--color-collection);
          flex-shrink: 0;
        }

        .insight-text {
          font-size: 0.85rem;
          color: #cbd5e1;
          line-height: 1.5;
        }

        .insight-text strong {
          color: white;
        }

        /* Floating chat button trigger when chat is closed */
        .floating-chat-trigger {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--gradient-accent);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5),
                      0 0 15px rgba(99, 102, 241, 0.2);
          z-index: 40;
          transition: all var(--transition-fast);
        }

        .floating-chat-trigger:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 12px 30px -5px rgba(99, 102, 241, 0.6),
                      0 0 20px rgba(99, 102, 241, 0.3);
        }

        .pulse-glowing {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--accent-primary);
          animation: pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          pointer-events: none;
        }

        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .animate-bounce-slow {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @media (max-width: 768px) {
          .main-content-layout {
            padding: 16px;
          }
          
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          
          .chat-toggle-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}

export default App;
