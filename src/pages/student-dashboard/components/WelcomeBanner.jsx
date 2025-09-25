import React from 'react';

const WelcomeBanner = ({
  studentName,
  selectedTerm, // Pass selectedTerm from parent (e.g., "first", "second", "third")
  className = ''
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get first letter of student name for avatar
  const getInitial = (name) => {
    return name && typeof name === 'string' && name.length > 0
      ? name.charAt(0).toUpperCase()
      : 'S';
  };

  // Get current year and selected term for academic year display
  const getAcademicYear = () => {
    const year = new Date().getFullYear();
    const termLabel = selectedTerm
      ? ({
          first: 'First Term',
          second: 'Second Term',
          third: 'Third Term'
        }[selectedTerm.toLowerCase()] || selectedTerm)
      : 'N/A';
    return `${year} • ${termLabel}`;
  };

  return (
    <div className={`bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white shadow-lg ${className}`}>
      <div className="flex flex-col sm:flex-row items-center sm:space-x-8">
        {/* Modern Avatar */}
        <div className="flex-shrink-0 mb-4 sm:mb-0">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-primary shadow-lg border-4 border-primary/30">
            {getInitial(studentName)}
          </div>
        </div>
        {/* Welcome Content */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-heading font-bold mb-2 drop-shadow">
            {getGreeting()}, {studentName || "Student"}!
          </h1>
          <p className="text-lg font-body opacity-90 mb-2">
            Welcome back to your academic dashboard.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 justify-center sm:justify-start text-base font-body mt-2">
            <span className="inline-block px-4 py-2 rounded-full bg-white/20 text-white font-semibold border border-white/30">
              Academic Year: {getAcademicYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;