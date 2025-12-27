import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const SummaryCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    info: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('id-ID').format(val);
    }
    return val;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mb-2">
            {formatValue(value)}
          </p>

          {/* Trend */}
          {trend !== undefined && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-success-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === 'up' ? 'text-success-600' : 'text-red-600'
                }`}
              >
                {trendValue}
              </span>
              <span className="text-sm text-neutral-500">vs last period</span>
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
