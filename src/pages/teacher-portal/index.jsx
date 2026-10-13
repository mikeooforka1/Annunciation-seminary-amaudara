import React, { useEffect, useState } from 'react';
import WelcomeBanner from './components/WelcomeBanner';
import DashboardWidgets from './components/DashboardWidgets';
import { useNavigate } from 'react-router-dom';

const TeacherPortal = () => {
  const [teacherData, setTeacherData] = useState(null);
  const navigate = useNavigate();
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentsList, setStudentsList] = useState([]);

  useEffect(() => {
    const storedData = localStorage.getItem('teacherData') || localStorage.getItem('user');
    let parsedData = {};
    if (storedData) {
      try {
        parsedData = JSON.parse(storedData);
        setTeacherData(parsedData);
      } catch (e) {
        parsedData = {};
      }
    }
    if (!parsedData._id) {
      alert('Session expired or invalid. Please log in again.');
      navigate('/login-authentication');
    }
  }, [navigate]);

  useEffect(() => {
    if (teacherData?.className && teacherData?._id) {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
      fetch(
        `${API_BASE_URL}/api/user/class/${encodeURIComponent(teacherData.className)}/${encodeURIComponent(teacherData.term || 'third')}/students`,
        {
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      )
        .then(res => res.json())
        .then(data => {
          setStudentsList(
            Array.isArray(data)
              ? data.map(student => ({
                  id: student._id,
                  name: student.name,
                  class: student.className,
                  photo: student.photo || '',
                }))
              : []
          );
        })
        .catch(err => console.error('Failed fetching students:', err));
    }
  }, [teacherData]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('teacherData');
    navigate('/login-authentication');
  };

  if (!teacherData || !teacherData._id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-lg font-semibold text-destructive">
          Unable to load teacher details. Please log in again.
        </span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-2 sm:px-4 lg:px-8"
      style={{
        background: `
          linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%),
          url('https://www.transparenttextures.com/patterns/paper-fibers.png')
        `,
        backgroundBlendMode: 'multiply',
        backgroundRepeat: 'repeat',
      }}
    >
      {/* Logout Button */}
      <div className="w-full flex justify-end items-center pt-4 pb-2">
        <button
          onClick={handleLogout}
          className="bg-destructive text-white px-4 py-2 rounded-lg shadow hover:bg-destructive/90 transition font-semibold text-sm sm:text-base"
          style={{ minWidth: 90 }}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
      <WelcomeBanner
        teacherName={teacherData.name || teacherData.fullName || 'Teacher'}
        teacherPhoto={teacherData.photo || ''}
      />
      <DashboardWidgets teacherData={teacherData} />
      <div className="flex flex-col items-center mt-8 space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Exam Creation Card */}
          <div
            className="bg-primary/10 border border-primary rounded-lg shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center p-6"
            onClick={() => navigate('/exam-creation-management')}
          >
            <span className="text-primary text-3xl mb-2">
              <i className="fas fa-file-alt" />
            </span>
            <span className="font-heading font-bold text-lg mb-1 text-primary">Exam Creation & Management</span>
            <span className="text-sm text-muted-foreground text-center">Create and manage exams for your classes.</span>
          </div>
          {/* Students Card */}
          <div
            className="bg-secondary/10 border border-secondary rounded-lg shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center p-6"
            onClick={() => setShowStudentsModal(true)}
          >
            <span className="text-secondary text-3xl mb-2">
              <i className="fas fa-users" />
            </span>
            <span
              className="font-heading font-extrabold text-xl mb-1"
              style={{
                color: '#252c3bff',
                textShadow: '0 1px 2px #fff8',
                letterSpacing: '0.5px'
              }}
            >
              View My Students
            </span>
            <span className="text-sm text-muted-foreground text-center">See all students in your classes. ({studentsList.length})</span>
          </div>
          {/* Announcement Card */}
          <div
            className="bg-accent/10 border border-accent rounded-lg shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center p-6"
            onClick={() => navigate('/post-announcement')}
          >
            <span className="text-accent text-3xl mb-2">
              <i className="fas fa-bullhorn" />
            </span>
            <span
              className="font-heading font-extrabold text-xl mb-1"
              style={{
                color: '#282f3dff',
                textShadow: '0 1px 2px #fff8',
                letterSpacing: '0.5px'
              }}
            >
              Post Announcement
            </span>
            <span className="text-sm text-muted-foreground text-center">Share important updates with your students.</span>
          </div>
          {/* Set Result Card */}
          <div
            className="bg-red-100 border border-red-400 rounded-lg shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center p-6"
            onClick={() => navigate('/result-portal')}
          >
            <span className="text-red-600 text-3xl mb-2">
              <i className="fas fa-chart-bar" />
            </span>
            <span className="font-heading font-bold text-lg mb-1 text-red-600">Set Result</span>
            <span className="text-sm text-muted-foreground text-center">Go to the result portal to set or view results.</span>
          </div>
           {/* Set CBT Exam Result Card (NEW) */}
            <div
              className="bg-blue-100 border border-blue-400 rounded-lg shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center p-6"
              onClick={() => navigate('/cbt-result-portal')}
            >
              <span className="text-blue-600 text-3xl mb-2">
                <i className="fas fa-laptop-code" />
              </span>
              <span className="font-heading font-bold text-lg mb-1 text-blue-600">Set CBT Exam Result</span>
              <span className="text-sm text-muted-foreground text-center">Manage and view CBT exam results for your students.</span>
            </div>
          {/* Print All Results Card */}
          <div
            className="bg-green-100 border border-green-400 rounded-lg shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center p-6"
            onClick={() => navigate('/print-all-results')}
          >
            <span className="text-green-600 text-3xl mb-2">
              <i className="fas fa-print" />
            </span>
            <span className="font-heading font-bold text-lg mb-1 text-green-600">Print All Results</span>
            <span className="text-sm text-muted-foreground text-center">Print results for all students in your class and term.</span>
          </div>
        </div>
      </div>

      {/* Students Modal */}
      {showStudentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex flex-row justify-between items-center mb-6 gap-2 overflow-x-auto">
              <h3 className="font-heading text-2xl font-bold text-primary whitespace-nowrap">
                My Students <span className="text-base text-muted-foreground">({studentsList.length})</span>
              </h3>
              <button
                className="flex items-center justify-center text-2xl font-bold text-destructive hover:text-destructive/80 w-10 h-10 rounded-full bg-muted transition"
                onClick={() => setShowStudentsModal(false)}
                title="Close"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {studentsList.map(student => (
                <div
                  key={student.id}
                  className="flex flex-col items-center bg-background border border-border rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition"
                >
                  <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center text-lg sm:text-xl font-bold text-white border-2 border-primary mb-2">
                    {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                  </span>
                  <div className="w-full text-center">
                    <div className="font-heading font-semibold text-base sm:text-lg text-foreground mb-1">
                      {student.name}
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-semibold">
                      Class: {student.class}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {studentsList.length === 0 && (
              <div className="text-center text-muted-foreground py-8">No students found for your classes.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPortal;