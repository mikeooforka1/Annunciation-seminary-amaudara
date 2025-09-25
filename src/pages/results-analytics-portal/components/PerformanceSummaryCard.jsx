import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceSummaryCard = ({ title, value, subtitle, icon, trend, trendValue, color = 'primary' }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return 'TrendingUp';
    if (trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-error';
    return 'text-muted-foreground';
  };

  const getColorClasses = () => {
    const colors = {
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      secondary: 'bg-secondary text-secondary-foreground'
    };
    return colors?.[color] || colors?.primary;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorClasses()}`}>
              <Icon name={icon} size={16} />
            </div>
            <h3 className="font-body text-sm text-muted-foreground">{title}</h3>
          </div>
          
          <div className="space-y-1">
            <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="font-caption text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {trend && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            <Icon name={getTrendIcon()} size={14} />
            <span className="font-mono text-xs font-medium">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceSummaryCard;