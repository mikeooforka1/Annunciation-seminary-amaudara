import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from './components/AuthHeader';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // <-- Use env variable

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: credentials.name.trim(),
          className: String(credentials.role).trim().toLowerCase() === 'admin'
            ? ''
            : credentials.className.trim(),
          role: String(credentials.role).trim().toLowerCase(),
          token: credentials.token,
          term: String(credentials.term).trim().toLowerCase()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || 'Login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Ensure _id exists before storing
      if (!result.user || !result.user._id) {
        setErrorMsg('Login failed: Missing user ID.');
        setIsLoading(false);
        return;
      }

      // Store user data in localStorage for global access
      localStorage.setItem('user', JSON.stringify({
        name: result.user.name,
        role: result.user.role,
        className: result.user.className,
        term: result.user.term,
        _id: result.user._id,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      }));

      localStorage.setItem('userName', result.user.name);

      // Teacher-specific navigation and storage
      if (result.user.role === 'teacher') {
        localStorage.setItem('teacherData', JSON.stringify({
          ...result.user,
          _id: result.user._id // Ensure _id is present
        }));
        window.location.replace('/teacher-portal');
        setIsLoading(false);
        return;
      }

      // Student-specific navigation and storage
      if (result.user.role === 'student') {
        localStorage.setItem('studentData', JSON.stringify({
          ...result.user,
          _id: result.user._id // Ensure _id is present
        }));
        window.location.replace('/student-dashboard');
        setIsLoading(false);
        return;
      }

      // Admin-specific navigation and storage
      if (result.user.role === 'admin') {
        localStorage.setItem('adminData', JSON.stringify({
          ...result.user,
          _id: result.user._id
        }));
        window.location.replace('/admin');
        setIsLoading(false);
        return;
      }

      navigate('/');
    } catch (error) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="relative z-10 min-h-screen flex">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-xl shadow-elevation p-6 lg:p-8">
              <AuthHeader />
              
              <div className="space-y-6">
                {errorMsg && (
                  <div className="bg-error/10 border border-error text-error rounded-md px-4 py-2 mb-2 text-sm">
                    {errorMsg}
                  </div>
                )}
                <LoginForm 
                  onLogin={handleLogin}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Information Sidebar - Desktop Only */}
        <div className="hidden lg:flex lg:w-96 lg:items-center lg:justify-center lg:p-8">
          <div className="w-full max-w-sm">
            <SecurityBadges />
          </div>
        </div>
      </div>

      {/* Mobile Security Info */}
      <div className="lg:hidden bg-muted/30 border-t border-border p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Data Protected</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAuthentication;