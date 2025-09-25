import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import ContextualBreadcrumbs from '../../components/ui/ContextualBreadcrumbs';
import WelcomeBanner from './components/WelcomeBanner';
import AnnouncementsCarousel from './components/AnnouncementsCarousel';
import QuickActionButtons from './components/QuickActionButtons';
import AcademicCalendarWidget from './components/AcademicCalendarWidget';
import ResourceLibrarySection from './components/ResourceLibrarySection';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get student data from localStorage
    const storedData = localStorage.getItem('studentData');
    let parsedData = {};
    if (storedData) {
      parsedData = JSON.parse(storedData);
      setStudentData(parsedData);
    }
    // Best practice: Check for valid _id before proceeding
    if (!parsedData._id) {
      alert('Session expired or invalid. Please log in again.');
      navigate('/login-authentication');
    }
  }, [navigate]);

  useEffect(() => {
    // Example: Fetch pending exams using API base URL from .env
    if (studentData?.className && studentData?.term && studentData?._id) {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      fetch(
        `${API_BASE_URL}/api/exams/categorized-exams?class=${encodeURIComponent(studentData.className)}&term=${encodeURIComponent(studentData.term)}&studentId=${studentData._id}`,
        {
          credentials: 'include', // <-- Send cookies/session with request
        }
      )
        .then(res => res.json())
        .then(data => {
          // handle data (e.g., setPendingExamsCount(data.pending.length))
        })
        .catch(() => {
          // handle error
        });
    }
  }, [studentData]);

  // Map backend fields to dashboard fields
  const data = studentData
    ? {
        name:
          studentData.name ||
          `${studentData.firstName || studentData.personal?.firstName || ''} ${studentData.lastName || studentData.personal?.lastName || ''}`.trim(),
        photo:
          studentData.photo ||
          studentData.personal?.photo ||
          '',
        grade:
          studentData.gradeLevel ||
          studentData.personal?.gradeLevel ||
          studentData.academic?.intendedClass ||
          '',
        academicYear:
          studentData.academicYear ||
          studentData.academic?.academicYear ||
          '',
        gpa:
          studentData.gpa ||
          studentData.academic?.gpa ||
          null,
        notifications: studentData.notifications || 0,
        email:
          studentData.email ||
          studentData.legal?.email ||
          studentData.parentGuardian?.email ||
          '',
        phone:
          studentData.phoneNumber ||
          studentData.personal?.phoneNumber ||
          '',
        dob:
          studentData.dob ||
          studentData.personal?.dob ||
          '',
        gender:
          studentData.gender ||
          studentData.personal?.gender ||
          '',
        address:
          studentData.address ||
          studentData.personal?.address ||
          '',
      }
    : {
        name: '',
        photo: '',
        grade: '',
        academicYear: '',
        gpa: null,
        notifications: 0,
        email: '',
        phone: '',
        dob: '',
        gender: '',
        address: '',
      };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <RoleBasedHeader
        userRole="student"
        userName={data.name}
        notifications={data.notifications}
      />
      {/* Main Content */}
      <main className="pt-16 pb-20 lg:pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <ContextualBreadcrumbs
            items={[{ label: 'Student Portal', path: '/student-dashboard' }]}
            className="mb-6"
          />

          {/* Welcome Banner */}
          <WelcomeBanner
            studentName={studentData?.name}
            studentPhoto={data.photo}
            currentGrade={data.grade}
            academicYear={data.academicYear}
            overallGPA={data.gpa}
            selectedTerm={studentData?.term}
            className="mb-8"
          />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Primary Content */}
            <div className="lg:col-span-2 space-y-6">
              <QuickActionButtons />
              <AnnouncementsCarousel />
            </div>

            {/* Right Column - Secondary Content */}
            <div className="space-y-6">
              <AcademicCalendarWidget />

              {/* Additional Stats Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">Academic Progress</h3>
                    <p className="text-sm font-body text-muted-foreground">This semester</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-body text-muted-foreground">Attendance</span>
                    <span className="text-sm font-mono font-medium text-success">{/* attendance % */}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-body text-muted-foreground">Assignments</span>
                    <span className="text-sm font-mono font-medium text-primary">{/* assignments count */}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-body text-muted-foreground">Exams Completed</span>
                    <span className="text-sm font-mono font-medium text-secondary">{/* exams count */}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  {/* Render achievements dynamically or leave empty */}
                </div>
              </div>
            </div>
          </div>

          {/* Resource Library Section */}
          <ResourceLibrarySection />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;