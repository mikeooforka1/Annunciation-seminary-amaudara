import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import ContextualBreadcrumbs from '../../components/ui/ContextualBreadcrumbs';
import WelcomeBanner from './components/WelcomeBanner';
import AnnouncementsCarousel from './components/AnnouncementsCarousel';
import QuickActionButtons from './components/QuickActionButtons';
import AcademicCalendarWidget from './components/AcademicCalendarWidget';
import ResourceLibrarySection from './components/ResourceLibrarySection';

const VOCATION_REPORT_URL = "/assets/docs/vacation_report.pdf"; // Ensure this path is correct

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showXmasModal, setShowXmasModal] = useState(false); // New state for xmas modal
  const navigate = useNavigate();

  // Map backend fields to dashboard fields (move this above useEffect)
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
    // Fetch profile as soon as studentData is available
    if (!studentData?._id) return;
    setProfileLoading(true);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
    fetch(`${API_BASE_URL}/api/profile/${studentData._id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setProfile(data);
        setProfileLoading(false);
      })
      .catch(() => {
        setProfile(null);
        setProfileLoading(false);
      });
  }, [studentData]);

  useEffect(() => {
    if (profileLoading) return; // Don't check until profile is loaded
    // If profile is not loaded, show modal
    if (!profile) {
      setShowProfileModal(true);
      return;
    }
    // List required fields (except name, which is read-only)
    const requiredFields = [
      { key: "gender", value: profile.gender },
      { key: "dob", value: profile.dob },
      { key: "address", value: profile.address },
      { key: "currentFunction", value: profile.currentFunction },
      { key: "gradeLevel", value: profile.gradeLevel },
      { key: "photo", value: profile.photo }
    ];
    // Find missing fields
    const missingFields = requiredFields.filter(field => !field.value || field.value === "").map(field => field.key);
    // Show modal if any field is missing or profile is empty
    const isProfileEmpty = Object.values(profile).every(val => !val || val === "");
    const isIncomplete = missingFields.length > 0 || isProfileEmpty;
    setShowProfileModal(isIncomplete);

    // Show xmas modal only if profile is complete and not loading
    if (!isIncomplete && !profileLoading) {
      setShowXmasModal(true);
    }
  }, [profile, profileLoading]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg font-semibold text-primary">Checking profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modal for incomplete profile */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-2 text-primary">Complete Your Profile</h2>
            <p className="mb-4 text-muted-foreground">
              Please fill in your profile details before using the dashboard.
            </p>
            {/* List missing sections */}
            <div className="mb-4 text-left">
              <span className="block font-semibold text-red-600 mb-1">Missing Information:</span>
              <ul className="list-disc list-inside text-sm text-red-700">
                {[
                  { key: "gender", label: "Gender" },
                  { key: "dob", label: "Date of Birth" },
                  { key: "address", label: "Address" },
                  { key: "currentFunction", label: "Current Function" },
                  { key: "gradeLevel", label: "Grade/Class" },
                  { key: "photo", label: "Profile Photo" }
                ]
                  .filter(field =>
                    !profile || !profile[field.key] || profile[field.key] === ""
                  )
                  .map(field => (
                    <li key={field.key}>{field.label}</li>
                  ))}
              </ul>
            </div>
            <button
              className="px-6 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90"
              onClick={() => navigate('/profile')}
            >
              Go to Profile
            </button>
          </div>
        </div>
      )}

      {/* Merry Christmas Modal (same as login page) */}
      {showXmasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowXmasModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-green-700 mb-2">🎄 Merry Christmas!</h2>
            <p className="mb-3 text-base font-semibold text-gray-700">
              Wishing you a joyful Christmas and a successful academic year ahead!
            </p>
            <p className="mb-4 text-sm text-gray-600">
              <span className="font-bold text-red-600">Important:</span> All students are required to download and print their <span className="font-bold">Vacation Report</span> before returning to school. <br />
              <span className="text-red-600 font-semibold">Strict Warning:</span> <span className="font-semibold">You must print and fill the vacation report. Failure to do so may affect your resumption process.</span>
            </p>
            <a
              href={VOCATION_REPORT_URL}
              download
              className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-primary/90 transition"
            >
              Download Vacation Report
            </a>
          </div>
        </div>
      )}

      {/* Header */}
      <RoleBasedHeader
        userRole="student"
        userName={data.name}
        notifications={data.notifications}
        lockHeader={showProfileModal}
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