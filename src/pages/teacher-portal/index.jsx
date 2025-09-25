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
    const storedData = localStorage.getItem('teacherData');
    let parsedData = {};
    if (storedData) {
      parsedData = JSON.parse(storedData);
      setTeacherData(parsedData);
    }
    // Best practice: Check for valid _id before proceeding
    if (!parsedData._id) {
      // Handle missing ID: show error and redirect to login
      alert('Session expired or invalid. Please log in again.');
      navigate('/login-authentication');
    }
  }, [navigate]);

  useEffect(() => {
    if (teacherData?.className && teacherData?._id) {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      fetch(
        `${API_BASE_URL}/api/user/class/${encodeURIComponent(teacherData.className)}/${encodeURIComponent(teacherData.term)}/students`,
        {
          credentials: 'include',
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
        });
    }
  }, [teacherData]);

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
    <div className="min-h-screen bg-background px-2 sm:px-4 lg:px-8">
      <WelcomeBanner
        teacherName={teacherData.name || teacherData.fullName || 'Teacher'}
        teacherPhoto={teacherData.photo || ''}
      />
      <DashboardWidgets teacherData={teacherData} />
      <div className="flex flex-col items-center mt-8 space-y-4 w-full">
        <button
          className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded shadow hover:bg-primary/80 transition"
          onClick={() => navigate('/exam-creation-management')}
        >
          Go to Exam Creation & Management
        </button>
        <button
          className="w-full sm:w-auto px-6 py-2 bg-secondary text-white rounded shadow hover:bg-secondary/80 transition"
          onClick={() => setShowStudentsModal(true)}
        >
          View My Students ({studentsList.length})
        </button>
        <button
          className="w-full sm:w-auto px-6 py-2 bg-accent text-white rounded shadow hover:bg-accent/80 transition"
          onClick={() => navigate('/post-announcement')}
        >
          Post Announcement
        </button>
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
                  {/* First horizontal line: Avatar */}
                  <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center text-lg sm:text-xl font-bold text-white border-2 border-primary mb-2">
                    {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                  </span>
                  {/* Second horizontal line: Name and Class */}
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

// --- Mobile adaptive styles are handled by Tailwind's responsive classes (e.g. px-2, w-full, sm:w-auto, grid-cols-1, md:grid-cols-2, etc).