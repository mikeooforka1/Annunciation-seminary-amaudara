import React, { useState } from 'react';

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' }
];

const classes = [
  'JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'
];
const sections = ['A', 'B', 'C', 'D'];

const classOptions = [];
classes.forEach(cls => {
  sections.forEach(sec => {
    classOptions.push({ value: `${cls}${sec}`, label: `${cls} ${sec}` });
  });
});

const LoginForm = ({ onLogin, isLoading }) => {
  const [className, setClassName] = useState('');
  const [role, setRole] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side sanitization and length restriction
    const cleanClass = typeof className === 'string' ? className.trim() : '';
    const cleanRole = typeof role === 'string' ? role.trim().toLowerCase() : '';
    const cleanToken = typeof token === 'string' ? token.trim() : '';

    if (!cleanRole || !cleanToken) return;
    if (cleanRole !== 'admin' && !cleanClass) return;

    // Handle authentication request and store both keys locally for cross-portal compatibility
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include',
      body: JSON.stringify({
        className: cleanClass,
        role: cleanRole,
        token: cleanToken
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          localStorage.setItem('teacherData', JSON.stringify(data.user));
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        onLogin({ 
          className: cleanClass, 
          role: cleanRole, 
          token: cleanToken 
        });
      })
      .catch(() => {
        onLogin({ 
          className: cleanClass, 
          role: cleanRole, 
          token: cleanToken 
        });
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      {/* 1. Select Class */}
      <div>
        <label className="block text-sm font-medium mb-1">Class</label>
        <select
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          value={className}
          onChange={e => setClassName(e.target.value)}
          required={role !== 'admin'}
          autoComplete="off"
        >
          <option value="">Select Class</option>
          {classOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 2. Select Role */}
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          value={role}
          onChange={e => setRole(e.target.value)}
          required
          autoComplete="off"
        >
          <option value="">Select Role</option>
          {roles.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* 3. Enter Token */}
      <div>
        <label className="block text-sm font-medium mb-1">Password/Token</label>
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring pr-10"
            placeholder="Enter your password or token"
            value={token}
            onChange={e => setToken(e.target.value)}
            maxLength={100}
            autoComplete="new-password"
            autoCorrect="off"
            spellCheck="false"
            required
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowToken(!showToken)}
            tabIndex={-1}
          >
            {showToken ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.832-.642 1.624-1.104 2.354M15.362 17.362A9.958 9.958 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.54-4.362M9.88 9.88l4.24 4.24" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.54-4.362M6.634 6.634A9.958 9.958 0 0112 5c4.477 0 8.268 2.943 9.542 7-.274.832-.642 1.624-1.104 2.354M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </span>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white font-semibold py-2 rounded-lg shadow hover:bg-primary-dark transition flex items-center justify-center disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;