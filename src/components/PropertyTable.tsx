import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, Calendar, User, MapPin, Hash, Layers, DollarSign } from 'lucide-react';
import type { Property } from '../types/property';

interface PropertyTableProps {
  properties: Property[];
}

export const PropertyTable: React.FC<PropertyTableProps> = ({ properties }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract unique property types and wards for filters
  const propertyTypes = useMemo(() => {
    const types = new Set(properties.map(p => p.property_type));
    return ['All', ...Array.from(types)];
  }, [properties]);

  // Filter properties based on search and selected options
  const filteredProperties = useMemo(() => {
    setCurrentPage(1); // Reset page on filter
    return properties.filter((p) => {
      const matchesSearch = 
        p.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.property_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesType = typeFilter === 'All' || p.property_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, searchTerm, statusFilter, typeFilter]);

  // Paginated records
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, currentPage]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="table-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="table-controls glass-panel">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by owner name, property ID, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-field"
          />
        </div>

        <div className="filter-dropdowns">
          <div className="filter-select-wrapper">
            <label htmlFor="status-select">Status</label>
            <select
              id="status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="table-filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <label htmlFor="type-select">Type</label>
            <select
              id="type-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="table-filter-select"
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper-outer glass-panel">
        <div className="table-responsive">
          <table className="properties-table">
            <thead>
              <tr>
                <th>Property ID</th>
                <th>Owner Name</th>
                <th>City (Tenant)</th>
                <th>Type</th>
                <th>Ward</th>
                <th>Status</th>
                <th>Collection</th>
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProperties.length > 0 ? (
                paginatedProperties.map((p) => (
                  <tr key={p.property_id} className="table-row-hover">
                    <td className="font-mono text-glow">{p.property_id}</td>
                    <td>
                      <div className="owner-cell">
                        <span className="owner-name-text">{p.owner_name}</span>
                      </div>
                    </td>
                    <td><span className="city-cell-badge">{p.tenant}</span></td>
                    <td>{p.property_type}</td>
                    <td>{p.ward}</td>
                    <td>
                      <span className={`badge badge-${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="font-semibold text-white">
                      {formatCurrency(p.collection_inr)}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-icon-view" 
                        onClick={() => setSelectedProperty(p)}
                        title="View Details"
                      >
                        <Eye size={16} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="no-data-cell">
                    No property records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredProperties.length > 0 && (
          <div className="table-pagination">
            <span className="pagination-info">
              Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to{' '}
              <strong>
                {Math.min(currentPage * itemsPerPage, filteredProperties.length)}
              </strong>{' '}
              of <strong>{filteredProperties.length}</strong> properties
            </span>

            <div className="pagination-buttons">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn-pagination"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  // Ensure correct bounds
                  if (pageNum <= 0 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`btn-page-number ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-pagination"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="modal-overlay" onClick={() => setSelectedProperty(null)}>
          <div className="modal-content glass-panel property-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Hash className="title-icon" />
                <h3>Property Inspector - {selectedProperty.property_id}</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedProperty(null)}>
                <span>&times;</span>
              </button>
            </div>

            <div className="modal-body inspect-grid">
              <div className="inspect-header-block">
                <div className="inspect-badge-container">
                  <span className={`badge badge-${selectedProperty.status.toLowerCase()}`}>
                    {selectedProperty.status}
                  </span>
                  <span className="city-cell-badge">{selectedProperty.tenant}</span>
                </div>
                <h2>{selectedProperty.owner_name}</h2>
                <div className="inspect-address">
                  <MapPin size={16} className="text-secondary" />
                  <span>{selectedProperty.address}</span>
                </div>
              </div>

              <div className="inspect-details-grid">
                <div className="inspect-item">
                  <div className="inspect-item-label">
                    <User size={14} /> Owner Name
                  </div>
                  <div className="inspect-item-value">{selectedProperty.owner_name}</div>
                </div>

                <div className="inspect-item">
                  <div className="inspect-item-label">
                    <Layers size={14} /> Property Type
                  </div>
                  <div className="inspect-item-value">{selectedProperty.property_type}</div>
                </div>

                <div className="inspect-item">
                  <div className="inspect-item-label">
                    <Layers size={14} /> Ward
                  </div>
                  <div className="inspect-item-value">{selectedProperty.ward}</div>
                </div>

                <div className="inspect-item">
                  <div className="inspect-item-label">
                    <Layers size={14} /> Floor Count
                  </div>
                  <div className="inspect-item-value">{selectedProperty.floor_count} Floors</div>
                </div>

                <div className="inspect-item">
                  <div className="inspect-item-label">
                    <Layers size={14} /> Built-up Area
                  </div>
                  <div className="inspect-item-value">{selectedProperty.area_sqft.toLocaleString()} Sq. Ft.</div>
                </div>

                <div className="inspect-item">
                  <div className="inspect-item-label">
                    <Calendar size={14} /> Registration Date
                  </div>
                  <div className="inspect-item-value">{selectedProperty.registration_date}</div>
                </div>

                <div className="inspect-item highlight-tax">
                  <div className="inspect-item-label">
                    <DollarSign size={14} /> Annual Property Tax
                  </div>
                  <div className="inspect-item-value">{formatCurrency(selectedProperty.annual_tax_inr)}</div>
                </div>

                <div className="inspect-item highlight-collection">
                  <div className="inspect-item-label">
                    <DollarSign size={14} /> Tax Collected
                  </div>
                  <div className="inspect-item-value">{formatCurrency(selectedProperty.collection_inr)}</div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-primary" onClick={() => setSelectedProperty(null)}>
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .table-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .table-controls {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .search-bar-wrapper {
          display: flex;
          align-items: center;
          background: rgba(8, 12, 20, 0.4);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 8px 16px;
          flex: 1;
          max-width: 500px;
          transition: border-color var(--transition-fast);
        }

        .search-bar-wrapper:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.15);
        }

        .search-icon {
          color: var(--text-secondary);
          margin-right: 12px;
        }

        .search-input-field {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          font-size: 0.9rem;
          outline: none;
        }

        .filter-dropdowns {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .filter-select-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-select-wrapper label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .table-filter-select {
          background: rgba(8, 12, 20, 0.4);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 12px;
          color: white;
          font-size: 0.85rem;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .table-filter-select:focus {
          border-color: var(--accent-primary);
        }

        .table-wrapper-outer {
          padding: 0;
          overflow: hidden;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .properties-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }

        .properties-table th {
          background: rgba(13, 19, 33, 0.4);
          padding: 16px 20px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
        }

        .properties-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          color: #cbd5e1;
        }

        .table-row-hover:hover td {
          background: rgba(255, 255, 255, 0.015);
        }

        .font-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .text-glow {
          color: #818cf8;
          font-weight: 500;
        }

        .owner-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .owner-name-text {
          font-weight: 500;
          color: white;
        }

        .city-cell-badge {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
        }

        .font-semibold {
          font-weight: 600;
        }

        .text-white {
          color: white;
        }

        .actions-header {
          text-align: right;
        }

        .actions-cell {
          text-align: right;
        }

        .btn-icon-view {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #818cf8;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .btn-icon-view:hover {
          background: var(--gradient-accent);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .no-data-cell {
          text-align: center;
          padding: 48px !important;
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .table-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(13, 19, 33, 0.2);
          border-top: 1px solid var(--border-color);
        }

        .pagination-info {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-pagination {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: 0.8rem;
        }

        .btn-pagination:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .btn-pagination:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-numbers {
          display: flex;
          gap: 4px;
        }

        .btn-page-number {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .btn-page-number:hover {
          background: rgba(255, 255, 255, 0.03);
          color: white;
        }

        .btn-page-number.active {
          background: var(--accent-primary);
          color: white;
          font-weight: 600;
        }

        /* Property Inspector styling */
        .property-detail-modal {
          max-width: 600px !important;
        }

        .inspect-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .inspect-header-block {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .inspect-badge-container {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .inspect-header-block h2 {
          font-size: 1.5rem;
          color: white;
          margin-bottom: 8px;
        }

        .inspect-address {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .inspect-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .inspect-item {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-color);
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .inspect-item-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .inspect-item-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
        }

        .highlight-tax {
          border-left: 3px solid var(--accent-primary);
          background: rgba(99, 102, 241, 0.02);
        }

        .highlight-collection {
          border-left: 3px solid var(--color-approved);
          background: rgba(16, 185, 129, 0.02);
        }

        .highlight-collection .inspect-item-value {
          color: var(--color-approved);
        }

        @media (max-width: 768px) {
          .table-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-bar-wrapper {
            max-width: 100%;
          }

          .filter-dropdowns {
            justify-content: space-between;
          }

          .inspect-details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
