import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionButtons = ({ className = '' }) => {
  const navigate = useNavigate();
  const assignmentBtnRef = useRef(null);

  const quickActions = [
    {
      id: 'take-exam',
      title: 'Take Exam',
      description: 'Start your scheduled assessments',
      icon: 'Play',
      color: 'bg-primary text-primary-foreground',
      path: '/computer-based-testing-cbt-platform',
      badge: null
    },
    {
      id: 'view results',
      title: 'View-Exam-Results',
      description: 'Check your grades and performance',
      icon: 'BarChart3',
      color: 'bg-success text-success-foreground',
      path: '/results-analytics-portal',
      badge: null
    },
    {
      id: 'check-cbt-result',
      title: 'Check CBT Result',
      description: 'See your CBT exam scores and feedback',
      icon: 'MonitorCheck',
      color: 'bg-blue-100 text-blue-700',
      path: '/results-analytics-portal/cbt-result',
      badge: null
    },
    {
      id: 'browse-resources',
      title: 'Browse Resources',
      description: 'Access study materials and library',
      icon: 'BookOpen',
      color: 'bg-secondary text-secondary-foreground',
      path: '#resources',
      badge: 5
    },
    {
      id: 'assignments',
      title: 'Assignments',
      description: 'View and submit your assignments',
      icon: 'ClipboardList',
      color: 'bg-warning text-warning-foreground',
      path: '/assignments',
      badge: null
    }
  ];

  const handleActionClick = (action) => {
    if (action?.path?.startsWith('#')) {
      const element = document.getElementById(action?.path?.substring(1));
      if (element) {
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action?.path) {
      navigate(action.path);
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className} relative`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
          <Icon name="Zap" size={20} color="white" />
        </div>
        <div>
          <h2 className="text-lg font-heading font-semibold text-foreground">Quick Actions</h2>
          <p className="text-sm font-body text-muted-foreground">Fast access to key features</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions?.map((action, idx) => (
          <div
            key={action?.id}
            className={`relative group cursor-pointer ${action.id === 'assignments' ? 'mt-10' : ''}`}
            onClick={() => handleActionClick(action)}
            ref={action.id === 'assignments' ? assignmentBtnRef : null}
          >
            <div className="border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/20 bg-background">
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action?.color} relative`}>
                  <Icon name={action?.icon} size={20} />
                  {action?.badge && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center font-caption">
                      {action?.badge > 9 ? '9+' : action?.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action?.title}
                  </h3>
                  <p className="text-sm font-body text-muted-foreground mt-1 leading-relaxed">
                    {action?.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Icon 
                    name="ArrowRight" 
                    size={16} 
                    className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" 
                  />
                </div>
              </div>
            </div>
            {/* Arrow and label for assignments button */}
            {action.id === 'assignments' && (
              <div
                className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-none"
                style={{ width: 'max-content' }}
              >
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded shadow text-sm font-semibold mb-1 text-center pointer-events-none">
                  Check and do your assignments here
                </div>
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none animate-bounce"
                  style={{ animationDuration: '1.2s' }}
                >
                  <path d="M12 2v20m0 0l-6-6m6 6l6-6" stroke="#f59e42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionButtons;