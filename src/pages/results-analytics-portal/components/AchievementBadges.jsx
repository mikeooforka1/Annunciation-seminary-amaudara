import React from 'react';
import Icon from '../../../components/AppIcon';

const AchievementBadges = ({ achievements, className = '' }) => {
  const getBadgeColor = (type) => {
    const colors = {
      gold: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
      silver: 'bg-gradient-to-br from-gray-300 to-gray-500 text-white',
      bronze: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
      improvement: 'bg-gradient-to-br from-green-400 to-green-600 text-white',
      consistency: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
      excellence: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
    };
    return colors?.[type] || colors?.bronze;
  };

  const getBadgeIcon = (type) => {
    const icons = {
      gold: 'Trophy',
      silver: 'Award',
      bronze: 'Medal',
      improvement: 'TrendingUp',
      consistency: 'Target',
      excellence: 'Star'
    };
    return icons?.[type] || 'Award';
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">Achievement Badges</h3>
        <p className="font-body text-sm text-muted-foreground">Your academic milestones and accomplishments</p>
      </div>
      {achievements?.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Award" size={24} className="text-muted-foreground" />
          </div>
          <p className="font-body text-sm text-muted-foreground">No achievements yet</p>
          <p className="font-caption text-xs text-muted-foreground mt-1">
            Keep studying to earn your first badge!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements?.map((achievement) => (
            <div
              key={achievement?.id}
              className="group relative bg-muted rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
              title={achievement?.description}
            >
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${getBadgeColor(achievement?.type)}`}>
                  <Icon name={getBadgeIcon(achievement?.type)} size={20} />
                </div>
                
                <h4 className="font-body text-sm font-medium text-foreground mb-1">
                  {achievement?.title}
                </h4>
                
                <p className="font-caption text-xs text-muted-foreground mb-2">
                  {achievement?.subject}
                </p>
                
                <p className="font-mono text-xs text-muted-foreground">
                  {new Date(achievement.earnedDate)?.toLocaleDateString('en-GB')}
                </p>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-elevation opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <p className="font-caption text-xs text-popover-foreground whitespace-nowrap">
                  {achievement?.description}
                </p>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Progress towards next achievement */}
      {achievements?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-sm text-foreground">Next Achievement Progress</span>
            <span className="font-mono text-xs text-muted-foreground">75%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
          </div>
          <p className="font-caption text-xs text-muted-foreground mt-2">
            Score 85% or higher in 3 more exams to earn "Consistent Performer" badge
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;