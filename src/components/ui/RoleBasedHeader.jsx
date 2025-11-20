import React, { useState, useRef, useEffect } from 'react';
import { IoMenuSharp } from "react-icons/io5";
import Icon from '../AppIcon';
import Button from './Button';
import Image from '../AppImage';


const RoleBasedHeader = ({ 
  userRole,      // Pass actual user role from login
  userName,      // Pass actual user name from login
  isCollapsed = false,
  onToggleSidebar}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef?.current && !profileRef?.current?.contains(event?.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef?.current && !mobileMenuRef?.current?.contains(event?.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNavigationItems = () => {
    const dashboardPath = userRole === 'teacher' ? '/teacher-portal' : '/student-dashboard';
    // Use the direct route for teacher result portal
    const resultsPath = userRole === 'teacher' 
      ? '/exam-creation-management/result-portal' // Direct route to ResultPortal for teachers
      : '/results-analytics-portal';              // Student results analytics

    const baseItems = [
      { label: 'Dashboard', path: dashboardPath, icon: 'LayoutDashboard', roles: ['student', 'teacher'] },
      { label: 'Exams', path: '/computer-based-testing-cbt-platform', icon: 'FileText', roles: ['student'] },
      { label: 'Create Exam', path: '/exam-creation-management', icon: 'Plus', roles: ['teacher'] },
      { label: 'Results', path: resultsPath, icon: 'BarChart3', roles: ['student', 'teacher'] },
    ];

    return baseItems?.filter(item => item?.roles?.includes(userRole));
  };

  const handleNavigation = (path) => {
    window.location.href = path;
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Clear all authentication/session data
    localStorage.removeItem('studentData');
    localStorage.removeItem('teacherData');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    // Optionally, clear cookies if used for auth
    // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect to landing page (not login)
    window.location.replace('/landing-page');
  };

  const navigationItems = getNavigationItems();
  const visibleItems = navigationItems?.slice(0, 4);

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-1000">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Open Mobile Menu"
          >
            <IoMenuSharp size={22} color="black" />
          </Button>

          {/* Sidebar Toggle (Desktop) */}
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="icon-btn" // Remove 'hidden lg:flex' or 'lg:hidden'
              aria-label="Toggle Sidebar"
              onClick={onToggleSidebar}
            >
              <Icon name={isCollapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={20} color="black" />
            </Button>
          )}

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full overflow-visible flex items-center justify-center p-1 shadow">
              <Image 
                src="/assets/images/school_logo-1754996036714.jpg"
                alt="ANNUNCIATION SEMINARY AMAUDARA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading font-semibold text-lg text-black">ANNUNCIATION SEMINARY AMAUDARA</h1>
              <p className="font-caption text-xs text-black">Educational Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {visibleItems?.map((item) => (
              <Button
                key={item?.path}
                variant="ghost"
                className="text-sm font-body"
                onClick={() => handleNavigation(item?.path)}
              >
                <Icon name={item?.icon} size={16} className="mr-2" />
                {item?.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Right Section - User Profile Only */}
        <div className="flex items-center space-x-3">
          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 px-3"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-body font-medium text-foreground">{userName}</p>
                <p className="text-xs font-caption text-muted-foreground capitalize">{userRole}</p>
              </div>
              <Icon name="ChevronDown" size={16} />
            </Button>

            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-elevation z-1010">
                <div className="py-1">
                  {userRole === 'student' && (
                    <button 
                      className="w-full px-3 py-2 text-left text-sm font-body text-foreground hover:bg-muted flex items-center"
                      onClick={() => {
                        setIsProfileOpen(false);
                        window.location.href = '/profile';
                      }}
                    >
                      <Icon name="User" size={16} className="mr-2" />
                      Profile
                    </button>
                  )}
                  <button 
                    className="w-full px-3 py-2 text-left text-sm font-body text-destructive hover:bg-muted flex items-center"
                    onClick={handleLogout}
                  >
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card" ref={mobileMenuRef}>
          <nav className="px-4 py-2 space-y-1">
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                className="w-full flex items-center px-3 py-2 text-left text-sm font-body text-foreground hover:bg-muted rounded-md"
                onClick={() => handleNavigation(item?.path)}
              >
                <Icon name={item?.icon} size={16} className="mr-3" />
                {item?.label}
              </button>
            ))}
            <div className="border-t border-border my-2"></div>
            <button
              className="w-full flex items-center px-3 py-2 text-left text-sm font-body text-destructive hover:bg-muted rounded-md"
              onClick={handleLogout}
            >
              <Icon name="LogOut" size={16} className="mr-3" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default RoleBasedHeader;