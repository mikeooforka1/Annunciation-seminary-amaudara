import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHeader from './components/AuthHeader';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Use the same API setting as the admin/results pages; retain the old name as a fallback.
  const API_BASE_URL = (
    process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || ''
  ).trim().replace(/\/+$/, '');

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const cleanRole = String(credentials.role || '').trim().toLowerCase();
      const cleanClassName = cleanRole === 'admin' ? '' : String(credentials.className || '').trim();
      const cleanToken = String(credentials.token || '').trim();

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({
          className: cleanClassName,
          role: cleanRole,
          token: cleanToken
        })
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        setErrorMsg('The login endpoint returned an invalid response. Check REACT_APP_API_URL and your API routing, then rebuild the frontend.');
        return;
      }
      if (!result || typeof result !== 'object' || Array.isArray(result)) {
        setErrorMsg('Login failed: Invalid server authentication response.');
        return;
      }

      if (!response.ok) {
        setErrorMsg(result.error || 'Login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!result.user || !result.user._id) {
        setErrorMsg('Login failed: Invalid server authentication response.');
        setIsLoading(false);
        return;
      }

      // Sanitize stored payload to prevent storage poisoning
      const sanitizedUser = {
        name: String(result.user.name || ''),
        role: String(result.user.role || ''),
        className: String(result.user.className || ''),
        term: String(result.user.term || ''),
        _id: String(result.user._id || ''),
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      };

      sessionStorage.setItem('user', JSON.stringify(sanitizedUser));
      sessionStorage.setItem('userName', sanitizedUser.name);

      if (result.user.role === 'teacher') {
        sessionStorage.setItem('teacherData', JSON.stringify({
          ...result.user,
          _id: result.user._id
        }));
        window.location.replace('/teacher-portal');
        return;
      }

      if (result.user.role === 'student') {
        sessionStorage.setItem('studentData', JSON.stringify({
          ...result.user,
          _id: result.user._id,
          gradeLevel: result.user.gradeLevel || result.user.className || "",
          personal: result.user.personal || {},
          academic: result.user.academic || {},
          className: result.user.className || "",
          term: result.user.term || ""
        }));
        window.location.replace('/student-dashboard');
        return;
      }

      if (result.user.role === 'admin') {
        sessionStorage.setItem('adminData', JSON.stringify({
          ...result.user,
          _id: result.user._id
        }));
        window.location.replace('/admin');
        return;
      }

      navigate('/');
    } catch (error) {
      setErrorMsg('Network error or connection refused. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="relative z-10 min-h-screen flex">
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
                <div className="mt-4 flex flex-col items-center justify-center text-base font-semibold text-muted-foreground">
                  <span>
                    If you are having any issue with your login or dashboard, please reach out to our support team.
                  </span>
                  <button
                    className="mt-2 text-primary underline hover:text-primary/80 transition"
                    onClick={() => navigate('/contact')}
                    type="button"
                  >
                    Contact support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-96 lg:items-center lg:justify-center lg:p-8">
          <div className="w-full max-w-sm">
            <SecurityBadges />
          </div>
        </div>
      </div>

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