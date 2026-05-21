import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Trash2, ArrowUpRight } from 'lucide-react';
import type { Property, ChatMessage } from '../types/property';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIChatAssistantProps {
  properties: Property[];
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ properties, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check if API key is configured
  useEffect(() => {
    const checkKey = () => {
      const apiKey = localStorage.getItem('gemini_api_key');
      setUsingMock(!apiKey);
    };
    checkKey();
    
    // Listen to changes to local storage
    window.addEventListener('storage', checkKey);
    return () => window.removeEventListener('storage', checkKey);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `👋 **Welcome to the UPYOG AI Assistant!**\n\nI can answer any questions about the property data of 10 Indian cities. Try clicking one of the sample questions below or ask your own.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages]);

  // Sample questions
  const sampleQuestions = [
    'Which city has the highest total collection?',
    'How many properties are rejected in Mumbai?',
    'What percentage of Delhi properties are approved?',
    'Which city has the most pending properties?',
    'Compare total registrations between Pune and Jaipur.',
  ];

  // Helper to compile the statistics summary of the properties dataset
  const getStatsSummary = () => {
    // Basic sums
    const totalCount = properties.length;
    
    const cityMap: Record<string, { registered: number; approved: number; rejected: number; pending: number; collection: number; tax: number }> = {};
    const typeMap: Record<string, number> = {};
    let totalCollection = 0;
    let totalTax = 0;

    properties.forEach((p) => {
      // City stats
      if (!cityMap[p.tenant]) {
        cityMap[p.tenant] = { registered: 0, approved: 0, rejected: 0, pending: 0, collection: 0, tax: 0 };
      }
      cityMap[p.tenant].registered += 1;
      cityMap[p.tenant].collection += p.collection_inr;
      cityMap[p.tenant].tax += p.annual_tax_inr;
      
      if (p.status === 'Approved') cityMap[p.tenant].approved += 1;
      else if (p.status === 'Rejected') cityMap[p.tenant].rejected += 1;
      else if (p.status === 'Pending') cityMap[p.tenant].pending += 1;

      // Type stats
      typeMap[p.property_type] = (typeMap[p.property_type] || 0) + 1;
      
      totalCollection += p.collection_inr;
      totalTax += p.annual_tax_inr;
    });

    const cityStatsList = Object.entries(cityMap).map(([city, data]) => ({
      city,
      ...data,
      approvalRate: `${((data.approved / data.registered) * 100).toFixed(1)}%`,
    }));

    // Find extremes
    const topCollectionCity = [...cityStatsList].sort((a, b) => b.collection - a.collection)[0]?.city;
    const topRegisteredCity = [...cityStatsList].sort((a, b) => b.registered - a.registered)[0]?.city;
    const topPendingCity = [...cityStatsList].sort((a, b) => b.pending - a.pending)[0]?.city;

    return {
      general: {
        totalProperties: totalCount,
        totalCollection,
        totalTax,
        overallApprovalRate: `${((properties.filter(p => p.status === 'Approved').length / totalCount) * 100).toFixed(1)}%`,
      },
      propertyTypes: typeMap,
      cities: cityStatsList,
      insights: {
        highestCollectionCity: topCollectionCity,
        mostRegisteredCity: topRegisteredCity,
        mostPendingPropertiesCity: topPendingCity,
      }
    };
  };

  // Rule-based offline answering engine for standard questions
  const queryMockAssistant = (q: string): string => {
    const summary = getStatsSummary();
    const lq = q.toLowerCase();

    // Helper to format rupees
    const formatRupees = (val: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(val);
    };

    // Q1: Which city has the highest total collection?
    if (lq.includes('highest') && (lq.includes('collection') || lq.includes('revenue') || lq.includes('money'))) {
      const sorted = [...summary.cities].sort((a, b) => b.collection - a.collection);
      const top = sorted[0];
      return `📊 **Revenue Insights**:\n\n**${top.city}** has the highest total collection with **${formatRupees(top.collection)}** collected out of ${top.registered} registered properties.\n\nHere are the top 3 cities by tax collection:\n1. **${sorted[0].city}**: ${formatRupees(sorted[0].collection)}\n2. **${sorted[1].city}**: ${formatRupees(sorted[1].collection)}\n3. **${sorted[2].city}**: ${formatRupees(sorted[2].collection)}`;
    }

    // Q2: How many properties are rejected in Mumbai?
    if (lq.includes('rejected') && lq.includes('mumbai')) {
      const mumbai = summary.cities.find(c => c.city.toLowerCase() === 'mumbai');
      if (mumbai) {
        return `❌ **Mumbai Property Status**:\n\nThere are exactly **${mumbai.rejected} properties** that have been rejected in Mumbai.\n\nQuick breakdown of Mumbai:\n- Registered: ${mumbai.registered}\n- Approved: ${mumbai.approved}\n- Pending: ${mumbai.pending}\n- Rejected: ${mumbai.rejected}`;
      }
    }

    // General "rejected in [City]"
    for (const city of summary.cities) {
      if (lq.includes('rejected') && lq.includes(city.city.toLowerCase())) {
        return `❌ **Status Check (${city.city})**:\n\nThere are **${city.rejected} rejected properties** in ${city.city} out of ${city.registered} total registrations.`;
      }
    }

    // Q3: What percentage of Delhi properties are approved?
    if (lq.includes('percentage') && lq.includes('approved') && lq.includes('delhi')) {
      const delhi = summary.cities.find(c => c.city.toLowerCase() === 'delhi');
      if (delhi) {
        const pct = ((delhi.approved / delhi.registered) * 100).toFixed(1);
        return `✅ **Delhi Approvals**:\n\nIn Delhi, **${pct}%** of registered properties have been approved.\n\nDetails:\n- Approved: **${delhi.approved}**\n- Total: **${delhi.registered}**`;
      }
    }

    // General "approved in [City]" or "percentage of [City] approved"
    for (const city of summary.cities) {
      if ((lq.includes('approved') || lq.includes('approval')) && lq.includes(city.city.toLowerCase())) {
        const pct = ((city.approved / city.registered) * 100).toFixed(1);
        return `✅ **Approval Status (${city.city})**:\n\n- Approved properties: **${city.approved}**\n- Approval Rate: **${pct}%** of the ${city.registered} registered properties.`;
      }
    }

    // Q4: Which city has the most pending properties?
    if (lq.includes('most') && lq.includes('pending')) {
      const sorted = [...summary.cities].sort((a, b) => b.pending - a.pending);
      const top = sorted[0];
      return `⏳ **Pending Audits**:\n\n**${top.city}** has the most pending properties with **${top.pending} properties** currently awaiting decision.\n\nCities with the highest pending properties count:\n1. **${sorted[0].city}**: ${sorted[0].pending} properties\n2. **${sorted[1].city}**: ${sorted[1].pending} properties\n3. **${sorted[2].city}**: ${sorted[2].pending} properties`;
    }

    // Q5: Compare total registrations between Pune and Jaipur.
    if (lq.includes('compare') && lq.includes('pune') && lq.includes('jaipur')) {
      const pune = summary.cities.find(c => c.city.toLowerCase() === 'pune');
      const jaipur = summary.cities.find(c => c.city.toLowerCase() === 'jaipur');
      if (pune && jaipur) {
        const diff = Math.abs(pune.registered - jaipur.registered);
        const greater = pune.registered > jaipur.registered ? 'Pune' : 'Jaipur';
        return `⚖️ **Comparison (Pune vs Jaipur)**:\n\n- **Pune** registrations: **${pune.registered} properties**\n- **Jaipur** registrations: **${jaipur.registered} properties**\n\n**${greater}** has more registered properties by a margin of **${diff}**.\n\nRevenue Collection Comparison:\n- Pune: ${formatRupees(pune.collection)}\n- Jaipur: ${formatRupees(jaipur.collection)}`;
      }
    }

    // Generic registration questions
    if (lq.includes('total') && (lq.includes('registered') || lq.includes('properties')) && !lq.includes('collection')) {
      return `🏠 **Total Properties Overview**:\n\nAcross all 10 cities, there are exactly **1,000 properties** registered in the UPYOG platform.\n\nTop cities by registrations:\n${summary.cities
        .slice(0, 3)
        .map((c, i) => `${i + 1}. **${c.city}**: ${c.registered} properties`)
        .join('\n')}`;
    }

    // Generic collection questions
    if (lq.includes('total') && (lq.includes('collection') || lq.includes('collected') || lq.includes('revenue'))) {
      return `💰 **Revenue Collection Overview**:\n\nAcross all tenants, the total tax collection is **${formatRupees(summary.general.totalCollection)}** out of a total assessed annual tax of **${formatRupees(summary.general.totalTax)}**.\n\nTop 3 collection tenants:\n1. **Mumbai**: ${formatRupees(summary.cities.find(c => c.city === 'Mumbai')?.collection || 0)}\n2. **Delhi**: ${formatRupees(summary.cities.find(c => c.city === 'Delhi')?.collection || 0)}\n3. **Bengaluru**: ${formatRupees(summary.cities.find(c => c.city === 'Bengaluru')?.collection || 0)}`;
    }

    // Generic property type distribution
    if (lq.includes('type') || lq.includes('residential') || lq.includes('commercial') || lq.includes('industrial')) {
      return `🏢 **Property Type Breakdown**:\n\nHere is the count of properties by usage type across the entire dataset:\n- **Residential**: ${summary.propertyTypes['Residential'] || 0} properties\n- **Commercial**: ${summary.propertyTypes['Commercial'] || 0} properties\n- **Agricultural**: ${summary.propertyTypes['Agricultural'] || 0} properties\n- **Industrial**: ${summary.propertyTypes['Industrial'] || 0} properties\n- **Mixed Use**: ${summary.propertyTypes['Mixed Use'] || 0} properties`;
    }

    // Default offline response
    return `🤖 **Local Intelligent Mock Engine**:\n\nI detected your question: *"${q}"*.\n\nSince no Google Gemini API Key is configured in settings, I am running in local fallback mode. I can answer questions like:\n- *"Which city has the highest total collection?"*\n- *"How many properties are rejected in Mumbai?"*\n- *"What percentage of Delhi properties are approved?"*\n- *"Which city has the most pending properties?"*\n- *"Compare total registrations between Pune and Jaipur."*\n\n*Click the **Gemini Settings** (Key icon) in the sidebar to configure a free Gemini API key to ask arbitrary custom questions!*`;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    const apiKey = localStorage.getItem('gemini_api_key');

    if (!apiKey) {
      // Offline fallback mode
      setTimeout(() => {
        const mockResponse = queryMockAssistant(textToSend);
        const botMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'assistant',
          text: mockResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
      }, 800);
    } else {
      // Gemini API query
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const summary = getStatsSummary();
        const prompt = `You are a helpful Property Tax AI Assistant for the UPYOG multi-tenant platform.
You have access to a dataset containing exactly 1,000 property records across 10 Indian cities: Delhi, Mumbai, Pune, Bengaluru, Chennai, Hyderabad, Ahmedabad, Kolkata, Jaipur, Lucknow.

Here is the aggregated statistics summary of this dataset:
${JSON.stringify(summary, null, 2)}

User question: "${textToSend}"

Please answer the user's question accurately based on the summary provided above. 
Instructions:
- Keep your answers clear, concise, and structured.
- Format numbers in Indian styling (e.g., thousands, Lakhs, Crores) and use Indian Rupees (INR / ₹) where appropriate.
- Use markdown for headers, bold text, lists, and tables to make your response highly readable.
- If the user asks for details about individual owners or properties that are not in the summary, state that you only have aggregate statistics but do your best to describe general trends.
- Never make up information that cannot be inferred from the summary.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        const botMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'assistant',
          text: responseText || 'No response returned from Gemini.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (err: any) {
        console.error(err);
        const botMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'assistant',
          text: `❌ **API Query Error**:\n\nFailed to fetch response from Gemini. Please check if your API Key is correct and active. \n\n*Error message: ${err?.message || 'Unknown network error'}*`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'assistant',
        text: `🧹 **Chat history cleared.**\n\nHow can I help you analyze the property data today?`,
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="chat-overlay">
      <div className="chat-window glass-panel">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-title">
            <MessageSquare className="chat-header-icon" />
            <div>
              <h3>UPYOG AI Chat Assistant</h3>
              <span className={`engine-badge ${usingMock ? 'badge-mock' : 'badge-gemini'}`}>
                {usingMock ? 'Local Engine (Offline)' : 'Gemini 1.5 Flash'}
              </span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="icon-action-btn" onClick={clearChat} title="Clear Chat History">
              <Trash2 size={16} />
            </button>
            <button className="icon-action-btn close-btn" onClick={onClose} title="Close Chat">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="chat-body">
          <div className="messages-list">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message-bubble-wrapper ${msg.sender === 'user' ? 'msg-user' : 'msg-bot'}`}
              >
                <div className="message-bubble">
                  {/* Basic custom renderer for markdown bold and list items */}
                  <div className="message-text">
                    {msg.text.split('\n').map((line, idx) => {
                      // Process bullet points
                      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                      const content = line.replace(/^[-*]\s+/, '');
                      
                      // Process bold text
                      const processBold = (txt: string) => {
                        const parts = txt.split('**');
                        return parts.map((part, pIdx) => 
                          pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part
                        );
                      };

                      if (isBullet) {
                        return (
                          <li key={idx} style={{ marginLeft: 16, marginBottom: 4 }}>
                            {processBold(content)}
                          </li>
                        );
                      }

                      return (
                        <p key={idx} style={{ marginBottom: line.trim() ? 8 : 12 }}>
                          {processBold(line)}
                        </p>
                      );
                    })}
                  </div>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-bubble-wrapper msg-bot">
                <div className="message-bubble typing-bubble">
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested / Sample Questions */}
        <div className="chat-suggestions">
          <span className="suggestions-label">Suggested Questions:</span>
          <div className="suggestions-scroll">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="suggestion-tag"
                disabled={isLoading}
              >
                <span>{q}</span>
                <ArrowUpRight size={12} className="tag-arrow" />
              </button>
            ))}
          </div>
        </div>

        {/* Input Footer */}
        <form onSubmit={handleFormSubmit} className="chat-footer">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a question about UPYOG properties..."
            disabled={isLoading}
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn" disabled={isLoading || !inputMessage.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>

      <style>{`
        .chat-overlay {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 440px;
          height: 600px;
          z-index: 50;
          display: flex;
          animation: chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes chatSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .chat-window {
          width: 100%;
          height: 100%;
          background: #0d1527;
          border-radius: 20px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7),
                      0 0 0 1px rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(13, 19, 33, 0.4);
        }

        .chat-header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-header-icon {
          color: var(--accent-primary);
        }

        .chat-header-title h3 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
          color: white;
        }

        .engine-badge {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 2px;
        }

        .badge-mock {
          background: rgba(107, 114, 128, 0.15);
          color: var(--text-secondary);
          border: 1px solid rgba(107, 114, 128, 0.3);
        }

        .badge-gemini {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .chat-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-action-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color var(--transition-fast);
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-action-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.04);
        }

        .chat-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.03) 0%, transparent 60%);
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message-bubble-wrapper {
          display: flex;
          width: 100%;
        }

        .msg-user {
          justify-content: flex-end;
        }

        .msg-bot {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 0.85rem;
          line-height: 1.5;
          position: relative;
        }

        .msg-user .message-bubble {
          background: var(--gradient-accent);
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 15px -3px rgba(99, 102, 241, 0.4);
        }

        .msg-bot .message-bubble {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: #e2e8f0;
          border-bottom-left-radius: 4px;
        }

        .message-text p {
          margin: 0;
        }

        .message-text strong {
          color: white;
          font-weight: 600;
        }

        .message-time {
          display: block;
          font-size: 0.65rem;
          color: var(--text-muted);
          text-align: right;
          margin-top: 6px;
        }

        /* Typing indicator */
        .typing-bubble {
          padding: 12px 20px !important;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 12px;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: var(--text-secondary);
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }

        /* Suggestions section */
        .chat-suggestions {
          padding: 12px 20px;
          border-top: 1px solid var(--border-color);
          background: rgba(13, 19, 33, 0.2);
        }

        .suggestions-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 6px;
        }

        .suggestions-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none; /* Firefox */
        }

        .suggestions-scroll::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        .suggestion-tag {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: #cbd5e1;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 0.75rem;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all var(--transition-fast);
        }

        .suggestion-tag:hover {
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.3);
          color: white;
          transform: translateY(-1px);
        }

        .tag-arrow {
          color: var(--text-muted);
          transition: transform var(--transition-fast), color var(--transition-fast);
        }

        .suggestion-tag:hover .tag-arrow {
          color: var(--accent-primary);
          transform: translate(1px, -1px);
        }

        /* Footer form */
        .chat-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
          background: rgba(13, 19, 33, 0.4);
        }

        .chat-input {
          flex: 1;
          background: rgba(8, 12, 20, 0.4);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 10px 16px;
          color: white;
          font-size: 0.85rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .chat-input:focus {
          border-color: var(--accent-primary);
        }

        .chat-send-btn {
          background: var(--gradient-accent);
          border: none;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .chat-send-btn:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 6px 15px rgba(99, 102, 241, 0.3);
        }

        .chat-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        @media (max-width: 576px) {
          .chat-overlay {
            bottom: 0;
            right: 0;
            width: 100%;
            height: 100%;
          }
          .chat-window {
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
};
