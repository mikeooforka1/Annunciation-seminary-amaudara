import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AuthFooter = ({ onForgotPassword, onNewRegistration }) => {
  const currentYear = new Date()?.getFullYear();

  return (
    <div className="space-y-6">
      {/* Action Links */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 pt-6 border-t border-border">
        <Button
          variant="link"
          onClick={onForgotPassword}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          <Icon name="HelpCircle" size={16} className="mr-2" />
          Forgot Password?
        </Button>

        <Button
          variant="outline"
          onClick={onNewRegistration}
          className="text-sm"
        >
          <Icon name="UserPlus" size={16} className="mr-2" />
          New Student Registration
        </Button>
      </div>

      {/* Trust Signals */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Shield" size={14} className="text-success" />
            <span>Secure Login</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Award" size={14} className="text-primary" />
            <span>Certified Platform</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Lock" size={14} className="text-accent" />
            <span>Data Protected</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground">
          © {currentYear} GOSHEN PRINATH ACADEMY. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Educational Excellence • Digital Innovation • Student Success
        </p>
      </div>
    </div>
  );
};

export default AuthFooter;