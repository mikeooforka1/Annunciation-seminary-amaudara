import React, { useState } from 'react';

const terms = [
  { value: 'first', label: 'First Term' },
  { value: 'second', label: 'Second Term' },
  { value: 'third', label: 'Third Term' }
];

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' } // Added admin role
];

const LoginForm = ({ onLogin, isLoading }) => {
  const [name, setName] = useState('');
  const [term, setTerm] = useState('');
  const [className, setClassName] = useState('');
  const [role, setRole] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ name, term, className, role, token });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Term</label>
        <select
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          value={term}
          onChange={e => setTerm(e.target.value)}
          required
        >
          <option value="">Select Term</option>
          {terms.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Class</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          placeholder="Enter class (e.g. SS1, JSS2)"
          value={className}
          onChange={e => setClassName(e.target.value)}
          required={role !== 'admin'} // <-- Only required if not admin
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          value={role}
          onChange={e => setRole(e.target.value)}
          required
        >
          <option value="">Select Role</option>
          {roles.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password/Token</label>
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring pr-10"
            placeholder="Enter your password or token"
            value={token}
            onChange={e => setToken(e.target.value)}
            required
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-2 cursor-pointer"
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
        className="w-full bg-primary text-white font-semibold py-2 rounded-lg shadow hover:bg-primary-dark transition flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
};

export default LoginForm;