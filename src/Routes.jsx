import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, useLocation, useNavigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NetworkStatusBanner from "components/NetworkStatusBanner";
import Spinner from "components/spinner";
import Loader from "components/loader"; // <-- Import Loader
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
import StudentProfilePage from './pages/admin/components/student-profile'; // Import your student profile page

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

// Add this component for public route protection
const PublicRoute = ({ element: Element }) => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAuthenticated = user && user.isAuthenticated;
    if (isAuthenticated) {
      setShowWarning(true);
    }
  }, []);

  const handleBack = () => {
    // On second back, log out and redirect to login
    localStorage.removeItem("user");
    window.location.replace("/login-authentication");
  };

  if (showWarning) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="bg-white border border-primary/30 rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-primary mb-4">Notice</h2>
          <p className="mb-6 text-muted-foreground">
            You are currently logged in. Going back to public pages is not allowed.<br />
            <span className="font-semibold text-red-600">
              Going back again will automatically log you out.
            </span>
          </p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            onClick={handleBack}
          >
            Go Back Anyway (Logout)
          </button>
        </div>
      </div>
    );
  }

  return <Element />;
};

const ProtectedRouteGuard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  // Get user and authentication status
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAuthenticated = user && user.isAuthenticated;
  const protectedPaths = [
    "/admin", "/student-dashboard", "/teacher-portal", "/parent-dashboard"
  ];
  const isProtected = protectedPaths.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    const handlePopState = (event) => {
      // Only show modal if authenticated and on protected route
      if (isAuthenticated && isProtected) {
        const nextPath = window.location.pathname;
        const isGoingToPublic = !protectedPaths.some((p) => nextPath.startsWith(p));
        if (isGoingToPublic) {
          setShowModal(true);
          setPendingPath(nextPath);
          window.history.pushState(null, "", location.pathname);
        }
      } else {
        setShowModal(false); // Hide modal if not authenticated or not protected
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [location.pathname, isAuthenticated, isProtected]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setShowModal(false); // Hide modal on logout
    setPendingPath(null);
    navigate("/login-authentication");
  };

  const handleStay = () => {
    setShowModal(false);
    setPendingPath(null);
  };

  // Always hide modal if not authenticated or not on protected route
  useEffect(() => {
    if (!isAuthenticated || !isProtected) {
      setShowModal(false);
      setPendingPath(null);
    }
  }, [isAuthenticated, isProtected]);

  return (
    <>
      {children}
      {showModal && isAuthenticated && isProtected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-bold mb-2">Are you sure you want to logout?</h2>
            <p className="mb-4 text-muted-foreground">
              Going back will log you out and take you to a public page.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                onClick={handleLogout}
              >
                Logout
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handleStay}
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <AppWrapper>
          <ProtectedRouteGuard>
            <PageTransitionWrapper>
              <Suspense fallback={<Spinner message="Loading page..." />}>
                <RouterRoutes>
                  {/* Public pages wrapped with PublicRoute */}
                  <Route path="/" element={<PublicRoute element={LandingPage} />} />
                  <Route path="/landing-page" element={<PublicRoute element={LandingPage} />} />
                  <Route path="/about-page" element={<PublicRoute element={AboutPage} />} />
                  <Route path="/announcements" element={<PublicRoute element={Announcements} />} />
                  <Route path="/contact" element={<PublicRoute element={ContactPage} />} />
                  <Route path="/login-authentication" element={<PublicRoute element={LoginAuthentication} />} />
                  {/* Protected/dashboard pages */}
                  <Route path="/exam-creation-management" element={<ExamCreationManagement />} />
                  <Route path="/exam-creation-management/result-portal" element={<ResultPortal />} />
                  <Route path="/computer-based-testing-cbt-platform" element={<ComputerBasedTestingPlatform />} />
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                  <Route path="/results-analytics-portal" element={<ResultsAnalyticsPortal />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/account-settings" element={<AccountSettingsPage />} />
                  <Route path="/teacher-portal" element={<TeacherPortal />} />
                  <Route path="/post-announcement" element={<PostAnnouncement />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/student/:studentId" element={<StudentProfilePage />} />
                  <Route path="*" element={<NotFound />} />
                </RouterRoutes>
              </Suspense>
            </PageTransitionWrapper>
          </ProtectedRouteGuard>
        </AppWrapper>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;