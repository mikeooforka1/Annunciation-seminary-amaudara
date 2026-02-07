import React, { useState } from 'react';

const terms = [
  { value: 'first', label: 'First Term' },
  { value: 'second', label: 'Second Term' },
  { value: 'third', label: 'Third Term' }
];

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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LoginForm = ({ onLogin, isLoading }) => {
  const [name, setName] = useState('');
  const [term, setTerm] = useState('');
  const [className, setClassName] = useState('');
  const [role, setRole] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  // Modal state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState('');

  // Search state for modal
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch students for selected class (normalize className for backend)
  const fetchStudents = async () => {
    setLoadingStudents(true);
    setStudentError('');
    try {
      // Normalize className to uppercase for backend consistency
      const normalizedClass = className ? className.toUpperCase() : '';
      const res = await fetch(`${API_BASE_URL}/api/user/class/${normalizedClass}/students`);
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setStudentError('Could not load students for this class.');
      setStudents([]);
    }
    setLoadingStudents(false);
  };

  // Open modal only if class, term, and role are selected
  const handleNameBoxClick = () => {
    if (!className || !term || !role) {
      alert('Please select class, term, and role first.');
      return;
    }
    fetchStudents();
    setShowStudentModal(true);
  };

  const handleStudentSelect = (student) => {
    setName(student.name);
    setShowStudentModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ name, term, className, role, token });
  };

  // When teacher role is selected, auto-set name to class and prevent editing
  // When admin role is selected, auto-set name to "admin" and prevent editing
  React.useEffect(() => {
    if (role === 'teacher' && className) {
      setName(className);
    } else if (role === 'admin') {
      setName('admin');
    } else {
      setName('');
    }
  }, [role, className]);

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    // Only admin can ignore class selection
    if (selectedRole !== 'admin' && (!className || !term)) {
      alert('Please select both class and term before choosing a role.');
      setRole('');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            value={className}
            onChange={e => setClassName(e.target.value)}
            required={role !== 'admin'}
          >
            <option value="">Select Class</option>
            {classOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
            value={role}
            onChange={handleRoleChange}
            required
          >
            <option value="">Select Role</option>
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          {role === 'student' ? (
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring cursor-pointer"
              placeholder="Click to select your name"
              value={name}
              onClick={handleNameBoxClick}
              readOnly
              required
            />
          ) : role === 'teacher' || role === 'admin' ? (
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring bg-gray-100 cursor-not-allowed"
              value={name}
              readOnly
              required
            />
          ) : (
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}
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
            'Loading...'
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* Student selection modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md sm:max-w-lg md:max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select Your Name</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowStudentModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            {/* Search bar */}
            <div className="mb-3">
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
                placeholder="Search name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            {loadingStudents ? (
              <div className="text-center py-4">
                <svg className="animate-spin h-6 w-6 mx-auto text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="block mt-2 text-gray-500">Loading students...</span>
              </div>
            ) : studentError ? (
              <div className="text-red-500 text-center py-4">{studentError}</div>
            ) : (
              <ul className="max-h-72 sm:max-h-96 overflow-y-auto transition-all duration-200">
                {filteredStudents.length === 0 ? (
                  <li className="text-gray-500 text-center py-2">No students found.</li>
                ) : (
                  filteredStudents.map(student => (
                    <li
                      key={student._id}
                      className="py-2 px-3 hover:bg-primary hover:text-white cursor-pointer rounded transition"
                      onClick={() => handleStudentSelect(student)}
                    >
                      {student.name}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;