import React from 'react';
import Icon from '../AppIcon';

const ContextualBreadcrumbs = ({ 
  items = [],
  separator = 'ChevronRight',
  showHome = false, // Changed from true to false
  className = ''
}) => {
  const defaultItems = showHome ? [{ label: 'Dashboard', path: '/student-dashboard', icon: 'Home' }] : [];
  const breadcrumbItems = [...defaultItems, ...items];

  const handleNavigation = (path) => {
    if (path) {
      window.location.href = path;
    }
  };

  const getContextualIcon = (item, index) => {
    if (item?.icon) return item?.icon;
    
    // Auto-assign contextual icons based on common paths
    const pathIconMap = {
      '/student-dashboard': 'LayoutDashboard',
      '/computer-based-testing-cbt-platform': 'FileText',
      '/exam-creation-management': 'Plus',
      '/results-analytics-portal': 'BarChart3',
      '/student-registration-portal': 'UserPlus',
      '/login-authentication': 'LogIn',
    };

    return pathIconMap?.[item?.path] || (index === 0 ? 'Home' : 'ChevronRight');
  };

  if (breadcrumbItems?.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm font-body ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems?.map((item, index) => {
          const isLast = index === breadcrumbItems?.length - 1;
          const isClickable = item?.path && !isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <Icon 
                  name={separator} 
                  size={14} 
                  className="mx-2 text-muted-foreground" 
                />
              )}
              <div className="flex items-center">
                {item?.icon && (
                  <Icon 
                    name={getContextualIcon(item, index)} 
                    size={14} 
                    className={`mr-1 ${isLast ? 'text-foreground' : 'text-muted-foreground'}`}
                  />
                )}
                
                {isClickable ? (
                  <button
                    onClick={() => handleNavigation(item?.path)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1 py-0.5"
                    aria-label={`Navigate to ${item?.label}`}
                  >
                    {item?.label}
                  </button>
                ) : (
                  <span 
                    className={`${isLast ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item?.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ContextualBreadcrumbs;