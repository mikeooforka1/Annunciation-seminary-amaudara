import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NetworkStatusBanner from "components/NetworkStatusBanner";
import Spinner from "components/spinner";
import Loader from "components/loader"; // <-- Import Loader
import { useNavigate } from "react-router-dom";
import NotFound from "pages/NotFound";
import LandingPage from './pages/landing-page';
import AboutPage from './pages/about-page';
import Announcements from './pages/announcements';
import ExamCreationManagement from './pages/exam-creation-management';
import ComputerBasedTestingPlatform from './pages/computer-based-testing-cbt-platform';
import LoginAuthentication from './pages/login-authentication';
import StudentDashboard from './pages/student-dashboard';
import ResultsAnalyticsPortal from './pages/results-analytics-portal';
import ProfilePage from './pages/profile';
import AccountSettingsPage from './pages/account-settings';
import TeacherPortal from './pages/teacher-portal';
import ContactPage from './pages/contact';
import ResultPortal from './pages/exam-creation-management/components/ResultPortal';
import PostAnnouncement from './pages/teacher-portal/components/post-announcement';
import AdminDashboard from './pages/admin'; // Add this import

const AppWrapper = ({ children }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Only activate inactivity logout if user is authenticated and on dashboard
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAuthenticated = user && user.isAuthenticated;
    const isDashboard =
      window.location.pathname.startsWith("/teacher-portal") ||
      window.location.pathname.startsWith("/student-dashboard") ||
      window.location.pathname.startsWith("/admin-dashboard") ||
      window.location.pathname.startsWith("/parent-dashboard");

    // If not authenticated or not on dashboard, do not set timer or listeners
    if (!isAuthenticated || !isDashboard) return;

    let timer = null;

    // Use a stable reference for the resetTimer function
    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.removeItem("user");
        alert("Session expired due to inactivity.");
        window.location.replace("/login-authentication");
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Attach listeners only once per mount
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    // Start timer on mount
    resetTimer();

    // Clean up listeners and timer on unmount
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []); // <-- Remove navigate from deps to avoid remounts

  return (
    <>
      <NetworkStatusBanner />
      {children}
    </>
  );
};

// Loader logic for entrance/exit transitions
const PageTransitionWrapper = ({ children }) => {
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true); // Spinner always shows first
  const prevPath = React.useRef(location.pathname);

  useEffect(() => {
    // Show loader only on landing page
    if (
      location.pathname === "/" ||
      location.pathname === "/landing-page"
    ) {
      setShowLoader(true);
      setShowSpinner(false);
      const timer = setTimeout(() => setShowLoader(false), 1800); // Loader duration
      prevPath.current = location.pathname;
      return () => clearTimeout(timer);
    } else {
      // Show spinner for all other routes
      setShowSpinner(true);
      setShowLoader(false);
      const timer = setTimeout(() => setShowSpinner(false), 600); // Spinner duration
      prevPath.current = location.pathname;
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  if (showLoader) return <Loader />;
  if (showSpinner)
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.8)",
          minHeight: "100vh",
          width: "100vw",
        }}
      >
        <Spinner message="Loading page..." />
      </div>
    );
  return children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <AppWrapper>
          <PageTransitionWrapper>
            <Suspense fallback={<Spinner message="Loading page..." />}>
              <RouterRoutes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing-page" element={<LandingPage />} />
                <Route path="/about-page" element={<AboutPage />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/exam-creation-management" element={<ExamCreationManagement />} />
                <Route path="/exam-creation-management/result-portal" element={<ResultPortal />} />
                <Route path="/computer-based-testing-cbt-platform" element={<ComputerBasedTestingPlatform />} />
                <Route path="/login-authentication" element={<LoginAuthentication />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/results-analytics-portal" element={<ResultsAnalyticsPortal />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/account-settings" element={<AccountSettingsPage />} />
                <Route path="/teacher-portal" element={<TeacherPortal />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/post-announcement" element={<PostAnnouncement />} />
                <Route path="/admin" element={<AdminDashboard />} /> {/* <-- Add this line */}
                <Route path="*" element={<NotFound />} />
              </RouterRoutes>
            </Suspense>
          </PageTransitionWrapper>
        </AppWrapper>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;