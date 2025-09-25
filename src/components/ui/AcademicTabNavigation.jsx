import React, { useState } from 'react';
import Icon from '../AppIcon';


const AcademicTabNavigation = ({ 
  userRole = 'student',
  activeTab = 'dashboard',
  isCollapsed = false,
  className = '',
  pendingExamsCount = 0
}) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const getTabItems = () => {
    const dashboardPath = userRole === 'teacher' ? '/teacher-portal' : '/student-dashboard';
    const resultsPath = userRole === 'teacher'
      ? '/exam-creation-management/result-portal'
      : '/results-analytics-portal';

    const baseItems = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        path: dashboardPath, 
        icon: 'LayoutDashboard', 
        roles: ['student', 'teacher'],
        badge: null
      },
      { 
        id: 'exams', 
        label: 'Take Exam', 
        path: '/computer-based-testing-cbt-platform', 
        icon: 'FileText', 
        roles: ['student'],
        badge: pendingExamsCount
      },
      { 
        id: 'create-exam', 
        label: 'Create Exam', 
        path: '/exam-creation-management', 
        icon: 'Plus', 
        roles: ['teacher'],
        badge: null
      },
      { 
        id: 'results', 
        label: 'Results', 
        path: resultsPath, 
        icon: 'BarChart3', 
        roles: ['student', 'teacher'],
        badge: null
      }
    ];

    return baseItems.filter(item => item.roles.includes(userRole));
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const tabItems = getTabItems();

  // Mobile Bottom Navigation
  const MobileTabNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-1000 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            <div className="relative">
              <Icon name={item.icon} size={20} />
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center font-caption">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-caption mt-1">{item.label}</span>
          </button>
        ))}
        {tabItems.length > 4 && (
          <button
            className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => toggleSection('more')}
          >
            <Icon name="MoreHorizontal" size={20} />
            <span className="text-xs font-caption mt-1">More</span>
          </button>
        )}
      </div>
    </div>
  );

  // Desktop Sidebar Navigation
  const DesktopSidebarNavigation = () => (
    <div className={`hidden lg:flex lg:fixed lg:left-0 lg:top-16 lg:bottom-0 bg-card border-r border-border z-1000 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${className}`}>
      <div className="flex flex-col w-full">
        {/* Main Navigation */}
        <div className="flex-1 px-3 py-4 space-y-2">
          <div className={`${isCollapsed ? 'hidden' : 'block'} mb-4`}>
            <h3 className="text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider px-3">
              Navigation
            </h3>
          </div>
          
          {tabItems.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
              onClick={() => handleNavigation(item.path)}
              title={isCollapsed ? item.label : ''}
            >
              <div className="relative">
                <Icon name={item.icon} size={20} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center font-caption">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <span className="ml-3 text-sm font-body">{item.label}</span>
              )}
            </button>
          ))}
        </div>

        {/* Reasonable Sidebar Text */}
        {!isCollapsed && (
          <div className="px-3 py-4 border-t border-border">
            <div className="text-muted-foreground text-sm font-body text-center">
              Use the navigation above to access your dashboard, exams, and results. 
              All features are tailored to your role for a seamless academic experience.
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <MobileTabNavigation />
      <DesktopSidebarNavigation />
    </>
  );
};

export default AcademicTabNavigation;