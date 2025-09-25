import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'SSL Encrypted',
      description: 'Your data is protected with industry-standard encryption'
    },
    {
      icon: 'UserCheck',
      title: 'Role-Based Access',
      description: 'Secure authentication with appropriate access levels'
    },
    {
      icon: 'Clock',
      title: 'Session Management',
      description: 'Automatic logout for enhanced security'
    },
    {
      icon: 'Eye',
      title: 'Privacy Protected',
      description: 'Your personal information remains confidential'
    }
  ];

  return (
    <div className="hidden lg:block">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="ShieldCheck" size={24} className="text-success" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Secure & Trusted Platform
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Your educational data is protected with enterprise-grade security
          </p>
        </div>

        <div className="space-y-4">
          {securityFeatures?.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name={feature?.icon} size={14} className="text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-body font-medium text-foreground">
                  {feature?.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {feature?.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>System Online</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadges;