import React, { useState } from 'react';
import { LayoutDashboard, FileSpreadsheet, MessageSquare, Settings, Key, X, ExternalLink, Globe } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'properties';
  setActiveTab: (tab: 'dashboard' | 'properties') => void;
  openChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, openChat }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-container">
            <Globe className="logo-icon animate-pulse-slow" />
          </div>
          <div className="brand-text">
            <h2>UPYOG</h2>
            <span className="brand-subtitle">Property Analytics</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>KPI Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`nav-item ${activeTab === 'properties' ? 'active' : ''}`}
          >
            <FileSpreadsheet size={20} />
            <span>Property Records</span>
          </button>

          <button
            onClick={openChat}
            className="nav-item chat-trigger"
          >
            <MessageSquare size={20} />
            <span>AI Assistant</span>
            <span className="chat-badge">AI</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={() => setShowSettings(true)}
            className="settings-btn"
            title="Configure Gemini API"
          >
            <Settings size={20} />
            <span>Gemini Settings</span>
          </button>
          <div className="version-info">
            <span>UPYOG v2.1.0</span>
            <span>NUDM Assessment</span>
          </div>
        </div>
      </aside>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Key className="title-icon" />
                <h3>Gemini API Configuration</h3>
              </div>
              <button className="close-btn" onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="modal-body">
              <p className="modal-description">
                The Property Tax AI Assistant queries the Gemini API to answer questions about the properties dataset in real-time.
              </p>
              
              <div className="form-group">
                <label htmlFor="api-key-input">Gemini API Key</label>
                <input
                  id="api-key-input"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="form-input"
                />
                <span className="helper-text">
                  Your key is saved locally in your browser's localStorage and is only sent directly to Google's Gemini API endpoints.
                </span>
              </div>

              <div className="info-box">
                <p>
                  <strong>No API Key?</strong> You can get a free API key from{' '}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-link"
                  >
                    Google AI Studio <ExternalLink size={12} style={{ display: 'inline', marginLeft: 2 }} />
                  </a>.
                  If you don't enter an API Key, the assistant will fall back to a local intelligent mock engine that covers standard assessment questions.
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowSettings(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {saveStatus === 'saved' ? 'Saved Successfully!' : 'Save Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .sidebar {
          width: 260px;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 24px;
        }

        .logo-container {
          background: var(--gradient-accent);
          padding: 8px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
        }

        .logo-icon {
          color: white;
          width: 22px;
          height: 22px;
        }

        .brand-text h2 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-subtitle {
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: block;
          margin-top: -2px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          position: relative;
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(4px);
        }

        .nav-item.active {
          color: white;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.2);
          box-shadow: inset 0 0 12px rgba(99, 102, 241, 0.05);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 25%;
          height: 50%;
          width: 4px;
          background: var(--accent-primary);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 8px var(--accent-primary);
        }

        .chat-trigger {
          margin-top: 12px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .chat-trigger:hover {
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(99, 102, 241, 0.05);
        }

        .chat-badge {
          background: var(--gradient-accent);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
          position: absolute;
          right: 16px;
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color);
        }

        .settings-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: 0.9rem;
        }

        .settings-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .version-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 7, 12, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          background: #0f172a;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title-icon {
          color: var(--accent-primary);
        }

        .modal-title h3 {
          font-size: 1.15rem;
          margin: 0;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color var(--transition-fast);
          padding: 4px;
        }

        .close-btn:hover {
          color: white;
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .modal-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-input {
          background: rgba(8, 12, 20, 0.5);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 12px;
          color: white;
          font-size: 0.95rem;
          transition: border-color var(--transition-fast);
          width: 100%;
        }

        .form-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }

        .helper-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .info-box {
          background: rgba(99, 102, 241, 0.05);
          border-left: 4px solid var(--accent-primary);
          padding: 14px 16px;
          border-radius: 4px 10px 10px 4px;
          font-size: 0.85rem;
          line-height: 1.5;
          color: #cbd5e1;
        }

        .inline-link {
          color: var(--accent-primary);
          font-weight: 500;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.03);
          color: white;
        }

        .btn-primary {
          background: var(--gradient-accent);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
          transition: all var(--transition-fast);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .7; }
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            padding: 16px;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }
          .sidebar-brand {
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
          }
          .nav-item {
            padding: 8px 12px;
            font-size: 0.85rem;
            white-space: nowrap;
          }
          .sidebar-footer {
            display: none;
          }
        }
      `}</style>
    </>
  );
};
