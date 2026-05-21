import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { CityData, Property } from '../types/property';

interface ComparisonChartsProps {
  cityDataList: CityData[];
  properties: Property[];
}

export const ComparisonCharts: React.FC<ComparisonChartsProps> = ({ cityDataList, properties }) => {
  // Compute property type distribution
  const typeCounts = properties.reduce((acc, curr) => {
    acc[curr.property_type] = (acc[curr.property_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const propertyTypeData = Object.entries(typeCounts).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  // Style colors
  const STATUS_COLORS = {
    Approved: '#10b981',
    Rejected: '#ef4444',
    Pending: '#f59e0b',
  };

  const TYPE_COLORS = [
    '#6366f1', // Indigo
    '#a855f7', // Purple
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
  ];

  // Helper to format currency in Indian style (Lakhs / Thousands)
  const formatYAxisINR = (tick: number) => {
    if (tick >= 10000000) return `₹${(tick / 10000000).toFixed(1)}Cr`;
    if (tick >= 100000) return `₹${(tick / 100000).toFixed(1)}L`;
    if (tick >= 1000) return `₹${(tick / 1000).toFixed(0)}k`;
    return `₹${tick}`;
  };

  const formatTooltipINR = (value: any) => {
    return [
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
      }).format(Number(value)),
      'Total Collection'
    ];
  };

  return (
    <div className="charts-container">
      {/* 1. Grouped Bar Chart: Approved vs Rejected vs Pending per City (Bonus Task) */}
      <div className="chart-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="chart-header">
          <h3>Property Status Breakdown by City</h3>
          <p>Approved vs Rejected vs Pending properties across all 10 cities</p>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={cityDataList}
              margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="city" 
                stroke="#6b7280" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                }}
                labelStyle={{ fontWeight: 600, color: '#f3f4f6', marginBottom: 4 }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
              />
              <Bar dataKey="approved" name="Approved" fill={STATUS_COLORS.Approved} radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" fill={STATUS_COLORS.Rejected} radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill={STATUS_COLORS.Pending} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid-two">
        {/* 2. Bar Chart: Total Collection per City */}
        <div className="chart-card glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="chart-header">
            <h3>Revenue Collection by City</h3>
            <p>Total property tax collected (INR) for each tenant</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={cityDataList}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="collectionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="city" 
                  stroke="#6b7280" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxisINR}
                />
                <Tooltip
                  formatter={formatTooltipINR}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                  labelStyle={{ fontWeight: 600, color: '#f3f4f6', marginBottom: 4 }}
                />
                <Bar 
                  dataKey="collection" 
                  fill="url(#collectionGradient)" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Donut Chart: Property Type Share */}
        <div className="chart-card glass-panel animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="chart-header">
            <h3>Property Distribution</h3>
            <p>Breakdown by usage type across selected scope</p>
          </div>
          <div className="chart-wrapper pie-chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {propertyTypeData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {propertyTypeData.map((entry, index) => (
                <div key={entry.name} className="legend-item">
                  <span 
                    className="legend-dot" 
                    style={{ backgroundColor: TYPE_COLORS[index % TYPE_COLORS.length] }} 
                  />
                  <span className="legend-label">{entry.name}</span>
                  <span className="legend-value">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .charts-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
          width: 100%;
        }

        .charts-grid-two {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 20px;
        }

        .chart-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-header h3 {
          font-size: 1.1rem;
          color: white;
          margin-bottom: 4px;
        }

        .chart-header p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .chart-wrapper {
          width: 100%;
          min-height: 200px;
        }

        .pie-chart-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .pie-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .legend-label {
          color: var(--text-secondary);
          flex: 1;
        }

        .legend-value {
          font-weight: 600;
          color: white;
          margin-left: 8px;
        }

        @media (max-width: 1024px) {
          .charts-grid-two {
            grid-template-columns: 1fr;
          }
          
          .pie-chart-container {
            flex-direction: column;
            gap: 12px;
          }

          .pie-legend {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
        }

        @media (max-width: 576px) {
          .pie-legend {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
