import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const GradeTrendChart = ({ data, className = '' }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation">
          <p className="font-body text-sm font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="font-caption text-xs text-popover-foreground">
                {entry?.dataKey}: {entry?.value}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">Grade Trends</h3>
        <p className="font-body text-sm text-muted-foreground">Performance over the last 6 months</p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              fontFamily="var(--font-caption)"
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              fontFamily="var(--font-caption)"
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px', 
                fontFamily: 'var(--font-caption)',
                color: 'var(--color-foreground)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="myScore" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              name="My Score"
            />
            <Line 
              type="monotone" 
              dataKey="classAverage" 
              stroke="var(--color-secondary)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 3 }}
              name="Class Average"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GradeTrendChart;