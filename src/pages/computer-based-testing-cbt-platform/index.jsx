import React, { useState, useEffect, useCallback } from 'react';
import { TbFidgetSpinner } from "react-icons/tb"; // already imported
import { FiRefreshCcw } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import ExamHeader from './components/ExamHeader';
import QuestionDisplay from './components/QuestionDisplay';
import QuestionNavigation from './components/QuestionNavigation';
import ExamControls from './components/ExamControls';
import BrowserLockdown from './components/BrowserLockdown';

const POLLING_INTERVAL = 30000; // 30 seconds

// Countdown utility
function getCountdownString(targetDate) {
  const now = new Date();
  const diff = new Date(targetDate) - now;
  if (diff <= 0) return '';
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

const ComputerBasedTestingPlatform = () => {
  const navigate = useNavigate();
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || "";

  const [exams, setExams] = useState([]); // All exams (not used directly now)
  const [student, setStudent] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [violations, setViolations] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [takenExamIds, setTakenExamIds] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'taken', 'missed'
  const [ipCheckLoading, setIpCheckLoading] = useState(true);
  const [ipAllowed, setIpAllowed] = useState(null); // null=loading, true=allowed, false=blocked
  const [ipErrorMsg, setIpErrorMsg] = useState('');
  const [showIpModal, setShowIpModal] = useState(false);

  // New state for categorized exams
  const [pendingExams, setPendingExams] = useState([]);
  const [takenExams, setTakenExams] = useState([]);
  const [missedExams, setMissedExams] = useState([]);
  const [cancelledExams, setCancelledExams] = useState([]); // New state for cancelled exams
  const [currentTerm, setCurrentTerm] = useState('');
  const [isLoadingExams, setIsLoadingExams] = useState(false); // <-- Spinner state

  // Spinner state for each tab
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isLoadingTaken, setIsLoadingTaken] = useState(false);
  const [isLoadingMissed, setIsLoadingMissed] = useState(false);
  const [isLoadingCancelled, setIsLoadingCancelled] = useState(false); // Spinner for cancelled tab

  // Add countdown state for pending exams
  const [pendingCountdowns, setPendingCountdowns] = useState({});

  // Move fetchCategorizedExams here
  const fetchCategorizedExams = useCallback(async () => {
    setIsLoadingPending(true);
    setIsLoadingTaken(true);
    setIsLoadingMissed(true);
    setIsLoadingCancelled(true); // <-- Add this line
    try {
      const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
      const studentClass = studentData.className || studentData.class;
      const studentTerm = studentData.term;
      if (!studentClass || !studentData._id) {
        setErrorMsg('Student information missing. Please log in again.');
        setIsLoadingPending(false);
        setIsLoadingTaken(false);
        setIsLoadingMissed(false);
        setIsLoadingCancelled(false); // Stop loading for cancelled exams
        return;
      }
      const url = `${API_BASE_URL}/api/exams/categorized-exams?class=${encodeURIComponent(studentClass)}${studentTerm ? `&term=${encodeURIComponent(studentTerm)}` : ''}&studentId=${studentData._id}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to fetch categorized exams');
      }
      const data = await res.json();
      setPendingExams(Array.isArray(data.pending) ? data.pending : []);
      setTakenExams(Array.isArray(data.taken) ? data.taken : []);
      setMissedExams(Array.isArray(data.missed) ? data.missed : []);
      setCancelledExams(Array.isArray(data.cancelled) ? data.cancelled : []); // <-- Add this line
      setTakenExamIds(Array.isArray(data.taken) ? data.taken.map(exam => exam._id) : []);
      setErrorMsg('');
    } catch (err) {
      setPendingExams([]);
      setTakenExams([]);
      setMissedExams([]);
      setCancelledExams([]); // <-- Add this line
      setErrorMsg('Unable to load exams. Please check your connection or contact your teacher.');
    }
    setIsLoadingPending(false);
    setIsLoadingTaken(false);
    setIsLoadingMissed(false);
    setIsLoadingCancelled(false); // <-- Add this line
  }, [API_BASE_URL]);

 useEffect(() => {
  let interval;
  const checkIp = () => {
    setIpCheckLoading(true);
    fetch(`${API_BASE_URL}/api/exams/check-ip`)
      .then(res => res.json())
      .then(data => {
        if (data.allowed) {
          setIpAllowed(true);
          setIpErrorMsg('');
        } else {
          setIpAllowed(false);
          setIpErrorMsg(data.error || 'Access denied: Your device is not authorized for this exam.');
        }
        setIpCheckLoading(false);
        setShowIpModal(true); // Show modal after check
      })
      .catch(() => {
        setIpAllowed(false);
        setIpErrorMsg('Network error: Unable to verify your device IP. Please try again or contact your teacher.');
        setIpCheckLoading(false);
        setShowIpModal(true); // Show modal after check
      });
  };

  checkIp(); // Initial check on landing

  interval = setInterval(checkIp, 5000); // Repeat every 5 seconds

  return () => clearInterval(interval);
}, [API_BASE_URL]);


  useEffect(() => {
    const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
    setStudent(studentData);
    setCurrentTerm(studentData.term || '');

    // Only fetch once on mount or when API_BASE_URL changes
    if (studentData.className || studentData.class) {
      fetchCategorizedExams();
    }
  }, [API_BASE_URL, fetchCategorizedExams]);

  // Timer effect
  useEffect(() => {
    if (!examStarted || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, timeRemaining]);

  // Auto-save effect
  useEffect(() => {
    if (examStarted) {
      const autoSave = setInterval(() => {
        // Save answers to backend or localStorage
      }, 30000);
      return () => clearInterval(autoSave);
    }
  }, [answers, examStarted]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Friendly error handler
  const showFriendlyError = (msg) => {
    setErrorMsg(msg || "Something went wrong. Please try again or contact your teacher.");
    setTimeout(() => setErrorMsg(''), 7000);
  };

  // Start exam robustly
  const handleStartExam = (exam) => {
    // Ensure exam is published before starting
    if (exam.status !== 'published') {
      showFriendlyError('This exam is not available. Please contact your teacher.');
      return;
    }
    if (!exam?.questions || exam.questions.length === 0) {
      showFriendlyError('This exam has no questions. Please contact your teacher.');
      return;
    }
    // Check if exam already taken
    if (takenExamIds.includes(exam._id)) {
      showFriendlyError('You have already taken this exam. Retaking is not allowed.');
      return;
    }
    setSelectedExam(exam);
    setExamStarted(true);
    setTimeRemaining(Number(exam?.duration) * 60 || 0); // <-- duration in seconds
    setCurrentQuestion(1);
    setAnswers({});
    setFlaggedQuestions([]);
    setErrorMsg('');
    if (document.documentElement?.requestFullscreen) {
      document.documentElement?.requestFullscreen()?.catch(() => {});
    }
  };

  // Navigation handlers
  const handleQuestionSelect = useCallback((questionNumber) => {
    setCurrentQuestion(questionNumber);
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentQuestion < selectedExam?.questions?.length) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, selectedExam]);

  // Answer handling
  const handleAnswerSelect = useCallback((answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  }, [currentQuestion]);

  const handleFlagQuestion = useCallback(() => {
    setFlaggedQuestions(prev => {
      if (prev?.includes(currentQuestion)) {
        return prev?.filter(q => q !== currentQuestion);
      } else {
        return [...prev, currentQuestion];
      }
    });
  }, [currentQuestion]);

  // Exam submission handler (finalizes submission)
  const handleSubmitExam = useCallback(async (isAuto = false) => {
    // Defensive checks for all required fields
    const examId = typeof selectedExam?._id === 'string' ? selectedExam._id : '';
    const studentId = typeof student?._id === 'string' ? student._id : '';
    const answersObj = typeof answers === 'object' && answers !== null ? answers : {};
    const flaggedArr = Array.isArray(flaggedQuestions) ? flaggedQuestions : [];
    const violationsArr = Array.isArray(violations) ? violations : [];
    const timeSpentNum = typeof selectedExam?.duration === 'number' && typeof timeRemaining === 'number'
      ? selectedExam.duration - timeRemaining
      : 0;
    const submittedAtStr = new Date().toISOString();
    const photoStr = typeof selectedExam?.photo === 'string' ? selectedExam.photo : '';

    const examResults = {
      examId,
      studentId,
      answers: answersObj,
      questions: selectedExam?.questions || [], // <-- send published questions
      flaggedQuestions: flaggedArr,
      timeSpent: timeSpentNum,
      violations: violationsArr,
      submittedAt: submittedAtStr,
      photo: photoStr,
      term: student?.term || '', // <-- send current term
    };

    console.log('Submitting exam payload:', examResults);

    // Validate required fields before sending
    if (!examId || !studentId) {
      showFriendlyError('Exam ID or Student ID is missing. Please contact support.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(examResults)
      });

      if (!response.ok) {
        throw new Error('Submission failed. Please try again after some time or check your network connection.');
      }

      // Submission succeeded, remove any saved progress
      localStorage.removeItem(`examAutoSave_${examId}_${studentId}`);

      // Refetch taken exams after submission
      async function fetchTakenExams() {
        try {
          const res = await fetch(`${API_BASE_URL}/api/exams/student-submissions?studentId=${student._id}`, {
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Failed to fetch taken exams');
          const data = await res.json();
          setTakenExamIds(Array.isArray(data) ? data.map(sub => sub.examId) : []);
        } catch {
          setTakenExamIds([]);
        }
      }
      await fetchTakenExams();

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen()?.catch(() => {});
      }
      // Redirect to student dashboard
      navigate('/student-dashboard');
    } catch (err) {
      // Save answers to localStorage for retry
      localStorage.setItem(`examAutoSave_${examId}_${studentId}`, JSON.stringify(examResults));
      showFriendlyError('Network error: Your answers have been saved and will be submitted automatically when the network is restored.');
      // Do not mark as missed
    }
  }, [answers, flaggedQuestions, timeRemaining, violations, navigate, selectedExam, student, API_BASE_URL]);

  const handleAutoSubmitTabSwitch = useCallback(() => {
    // Optionally show a message
    alert("Exam auto-submitted due to tab switch.");
    handleSubmitExam(true); // auto-submit
  }, [handleSubmitExam]);

  // Auto-submit logic on exam end
  const handleAutoSubmit = useCallback(async () => {
    const now = new Date();
    const examEnd = new Date(selectedExam?.endDate);
    const examId = selectedExam?._id;
    const studentId = student?._id;

    if (now >= examEnd) {
      // Try to submit from localStorage if available
      const saved = localStorage.getItem(`examAutoSave_${examId}_${studentId}`);
      if (saved) {
        await handleSubmitExam(true); // Try to submit saved answers
      } else {
        // Try to finalize draft from backend
        try {
          await fetch(`${API_BASE_URL}/api/exams/finalize-progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ examId, studentId })
          });
          // Optionally refetch taken exams
        } catch (err) {
          showFriendlyError('Network error: Your saved progress will be submitted automatically when the network is restored.');
        }
      }
    }
  }, [selectedExam, student, handleSubmitExam, API_BASE_URL]);

  const handleExitExam = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const confirmExit = useCallback(async () => {
    if (examStarted && selectedExam) {
      const progress = {
        examId: selectedExam._id,
        studentId: student._id,
        answers,
        questions: selectedExam.questions,
        flaggedQuestions,
        timeSpent: selectedExam.duration - timeRemaining,
        photo: selectedExam.photo,
        term: student.term,
      };
      // Save to localStorage for offline recovery
      localStorage.setItem(`examProgress_${selectedExam._id}_${student._id}`, JSON.stringify(progress));
      // Save to backend for reliability
      try {
        await fetch(`${API_BASE_URL}/api/exams/save-progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(progress)
        });
      } catch (err) {
        // Optionally show error or just rely on localStorage
      }
    }
    if (document.fullscreenElement) {
      document.exitFullscreen()?.catch(() => {});
    }
    navigate('/student-dashboard');
  }, [examStarted, selectedExam, answers, flaggedQuestions, currentQuestion, timeRemaining, student, navigate, API_BASE_URL]);

  const handleToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()?.catch(() => {});
    } else {
      document.documentElement?.requestFullscreen()?.catch(() => {});
    }
  }, []);

  const handleViolation = useCallback((violation) => {
    setViolations(prev => [...prev, violation]);
  }, []);

  // Get current question data
  const getCurrentQuestion = () => {
    return selectedExam?.questions?.[currentQuestion - 1];
  };

  const getAnsweredQuestions = () => {
    return Object.keys(answers)?.map(Number);
  };

  const isWarningTime = timeRemaining <= 600 && timeRemaining > 300;
  const isCriticalTime = timeRemaining <= 300;

  // Utility to format class value
  const formatClassName = (classValue) => {
    switch (classValue?.toLowerCase()) {
      case 'primary1': return 'Primary 1';
      case 'primary2': return 'Primary 2';
      case 'primary3': return 'Primary 3';
      case 'primary4': return 'Primary 4';
      case 'primary5': return 'Primary 5';
      case 'primary6': return 'Primary 6';
      case 'js1': return 'JS1 (Grade 7)';
      case 'js2': return 'JS2 (Grade 8)';
      case 'js3': return 'JS3 (Grade 9)';
      case 'ss1': return 'SS1 (Grade 10)';
      case 'ss2': return 'SS2 (Grade 11)';
      case 'ss3': return 'SS3 (Grade 12)';
      default: return classValue || <span className="text-gray-400">Loading...</span>;
    }
  };

  // Utility to format duration in minutes to "HH:mm:ss"
  const formatDuration = (duration) => {
    // duration is in minutes, may be float
    const totalSeconds = Math.round(Number(duration) * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  // Filter exams by current term and published status for pending tab
  const filteredPendingExams = pendingExams
    .filter(exam => exam.term === currentTerm && exam.status === 'published');
  const filteredTakenExams = takenExams.filter(exam => exam.term === currentTerm);
  const filteredMissedExams = missedExams.filter(exam => exam.term === currentTerm);
  const filteredCancelledExams = cancelledExams.filter(exam => exam.term === currentTerm);

  useEffect(() => {
    // Update countdowns every second for pending exams
    if (pendingExams.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const updatedCountdowns = {};
      pendingExams.forEach(exam => {
        updatedCountdowns[exam._id] = getCountdownString(exam.startDate);
      });
      setPendingCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingExams]);
  // Show loading or error before exam UI
  if (ipCheckLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
          <TbFidgetSpinner className="animate-spin text-5xl text-primary mb-4" />
          <span className="text-lg font-semibold text-primary">Checking device authorization...</span>
        </div>
      </div>
    );
  }
  // Show modal after IP check
  if (showIpModal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: ipAllowed ? "#D1FAE5" : "#FEE2E2" }}>
                <span className={`text-2xl ${ipAllowed ? "text-green-600" : "text-red-600"}`}>
                  {ipAllowed ? "✅" : "⛔"}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {ipAllowed ? "Device Authorized" : "Access Denied"}
              </h3>
              <p className="text-gray-600">
                {ipAllowed
                  ? "Your device is authorized for this exam. You may proceed."
                  : ipErrorMsg || "Your device is not authorized for this exam."}
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowIpModal(false);
                  if (!ipAllowed) navigate('/student-dashboard');
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Pre-exam screen: List all scheduled exams with tabs
  if (!examStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
          {/* School Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src="/assets/images/school_logo-1754996036714.jpg" alt="Goshen Academy Logo" className="w-24 h-24 mb-2 rounded-full border-4 border-green-700" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ANNUNCIATION SEMINARY AMAUDARA</h1>
            <p className="text-gray-600">Computer-Based Testing Platform</p>
          </div>
          {/* Student Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Student Information</h3>
            <div className="text-sm text-gray-700">
              <p><strong>Name:</strong> {student?.name || <span className="text-gray-400">Loading...</span>}</p>
              <p>
                <strong>Class:</strong> {formatClassName(student?.className || student?.class)}
              </p>
            </div>
          </div>
          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center">
              <span className="mr-2">⚠️</span>
              {errorMsg}
            </div>
          )}
          {/* Tabs for exam status */}
          <div className="mb-6 flex flex-nowrap overflow-x-auto gap-2">
            <button
              className={`px-3 py-2 rounded-t-lg font-medium border-b-2 whitespace-nowrap
                ${activeTab === 'pending'
                  ? 'border-green-600 text-green-700 bg-green-50'
                  : 'border-transparent text-gray-600 bg-gray-100'
                }`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Exams
            </button>
            <button
              className={`px-3 py-2 rounded-t-lg font-medium border-b-2 whitespace-nowrap
                ${activeTab === 'taken'
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-600 bg-gray-100'
                }`}
              onClick={() => setActiveTab('taken')}
            >
              Already Taken
            </button>
            <button
              className={`px-3 py-2 rounded-t-lg font-medium border-b-2 whitespace-nowrap
                ${activeTab === 'missed'
                  ? 'border-red-600 text-red-700 bg-red-50'
                  : 'border-transparent text-gray-600 bg-gray-100'
                }`}
              onClick={() => setActiveTab('missed')}
            >
              Missed Exams
            </button>
            <button
              className={`px-3 py-2 rounded-t-lg font-medium border-b-2 whitespace-nowrap
                ${activeTab === 'cancelled'
                  ? 'border-gray-600 text-gray-700 bg-gray-100'
                  : 'border-transparent text-gray-600 bg-gray-100'
                }`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled Exams
            </button>
          </div>
          {/* List of Exams by Tab */}
          <div className="mb-8">
            {/* Pending Exams Tab */}
            {activeTab === 'pending' && (
              <>
                <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-base font-semibold text-primary">
                    Pending Exams for term: <span className="underline">{currentTerm || 'Not set'}</span>
                  </span>
                  <button
                    onClick={fetchCategorizedExams}
                    className="ml-2 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 font-medium shadow-sm"
                    title="Refresh"
                    style={{ fontSize: '0.95rem' }}
                  >
                    <FiRefreshCcw size={16} />
                    Refresh
                  </button>
                </div>
                {activeTab === 'pending' && isLoadingPending ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <TbFidgetSpinner className="animate-spin text-5xl text-primary mb-2" />
                    <span className="text-primary font-medium">Loading pending exams...</span>
                  </div>
                ) : activeTab === 'pending' ? (
                  filteredPendingExams.length === 0 ? (
                    <div className="text-gray-600">No pending exams available for this term.</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredPendingExams.map((exam, idx) => {
                        const startDate = new Date(exam.startDate);
                        const endDate = new Date(exam.endDate);
                        const now = new Date();
                        const canStart = now >= startDate && now <= endDate;
                        const countdown = pendingCountdowns[exam._id] || getCountdownString(exam.startDate);

                        // Check for saved progress
                        const savedProgress = localStorage.getItem(`examProgress_${exam._id}_${student?._id}`);
                        const canContinue = !!savedProgress && now <= endDate;

                        return (
                          <div key={exam._id || idx} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-lg">{exam.title}</h4>
                                <div className="text-sm text-gray-700">
                                  <span>Subject: {exam.subject}</span>
                                  <span className="ml-4">Term: {exam.term}</span>
                                  <span className="ml-4">
                                    Duration: {Number(exam.duration)} min
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      ({formatDuration(exam.duration)})
                                    </span>
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  <strong>Scheduled:</strong> {startDate.toLocaleString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true,
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    timeZone: 'Africa/Lagos' // or your local timezone
                                  })} - {endDate.toLocaleString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true,
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    timeZone: 'Africa/Lagos' // or your local timezone
                                  })}
                                </div>
                              </div>
                              <button
                                className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                                  canStart || canContinue
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={!(canStart || canContinue)}
                                onClick={() => {
                                  if (canContinue) {
                                    // Restore progress
                                    const progress = JSON.parse(savedProgress);
                                    setSelectedExam(exam);
                                    setExamStarted(true);
                                    setAnswers(progress.answers || {});
                                    setFlaggedQuestions(progress.flaggedQuestions || []);
                                    setCurrentQuestion(progress.currentQuestion || 1);
                                    setTimeRemaining(progress.timeRemaining || Number(exam.duration) || 0);
                                    setErrorMsg('');
                                    localStorage.removeItem(`examProgress_${exam._id}_${student._id}`);
                                    if (document.documentElement?.requestFullscreen) {
                                      document.documentElement?.requestFullscreen()?.catch(() => {});
                                    }
                                  } else if (canStart) {
                                    handleStartExam(exam);
                                  }
                                }}
                              >
                                {canContinue ? 'Continue Exam Before End Date' : canStart ? 'Start Now' : 'Not Yet Available'}
                              </button>
                            </div>
                            {!canStart && (
                              <div className="mt-2 text-xs text-orange-600">
                                Exam will be available in <span className="font-semibold">{countdown}</span>
                              </div>
                            )}
                            {now > endDate && (
                              <div className="mt-2 text-xs text-red-600">
                                Exam period has ended.
                              </div>
                            )}
                            {exam?.questions?.length === 0 && (
                              <div className="mt-2 text-xs text-red-600">
                                This exam has no questions. Please contact your teacher.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : null}
              </>
            )}

            {/* Taken Exams Tab */}
            {activeTab === 'taken' && (
              <>
                <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-base font-semibold text-blue-600">
                    Already Taken Exams for term: <span className="underline">{currentTerm || 'Not set'}</span>
                  </span>
                  <button
                    onClick={fetchCategorizedExams}
                    className="ml-2 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 font-medium shadow-sm"
                    title="Refresh"
                    style={{ fontSize: '0.95rem' }}
                  >
                    <FiRefreshCcw size={16} />
                    Refresh
                  </button>
                </div>
                {activeTab === 'taken' && isLoadingTaken ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <TbFidgetSpinner className="animate-spin text-5xl text-blue-600 mb-2" />
                    <span className="text-blue-600 font-medium">Loading taken exams...</span>
                  </div>
                ) : activeTab === 'taken' ? (
                  filteredTakenExams.length === 0 ? (
                    <div className="text-gray-600">No exams have been taken yet for this term.</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTakenExams.map((exam, idx) => {
                        const startDate = new Date(exam.startDate);
                        const endDate = new Date(exam.endDate);
                        return (
                          <div key={exam._id || idx} className="border rounded-lg p-4 bg-blue-50">
                            <div>
                              <h4 className="font-semibold text-lg">{exam.title}</h4>
                              <div className="text-sm text-gray-700">
                                <span>Subject: {exam.subject}</span>
                                <span className="ml-4">Term: {exam.term}</span>
                                <span className="ml-4">
                                  Duration: {Number(exam.duration)} min
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({formatDuration(exam.duration)})
                                  </span>
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <strong>Scheduled:</strong> {startDate.toLocaleString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true,
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  timeZone: 'Africa/Lagos' // or your local timezone
                                })} - {endDate.toLocaleString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true,
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  timeZone: 'Africa/Lagos' // or your local timezone
                                })}
                              </div>
                              <div className="mt-2 text-xs text-blue-600">
                                You have already taken this exam.
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : null}
              </>
            )}

            {/* Missed Exams Tab */}
            {activeTab === 'missed' && (
              <>
                <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-base font-semibold text-red-600">
                    Missed Exams for term: <span className="underline">{currentTerm || 'Not set'}</span>
                  </span>
                  <button
                    onClick={fetchCategorizedExams}
                    className="ml-2 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 font-medium shadow-sm"
                    title="Refresh"
                    style={{ fontSize: '0.95rem' }}
                  >
                    <FiRefreshCcw size={16} />
                    Refresh
                  </button>
                </div>
                {activeTab === 'missed' && isLoadingMissed ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <TbFidgetSpinner className="animate-spin text-5xl text-red-600 mb-2" />
                    <span className="text-red-600 font-medium">Loading missed exams...</span>
                  </div>
                ) : activeTab === 'missed' ? (
                  filteredMissedExams.length === 0 ? (
                    <div className="text-gray-600">No missed exams for this term.</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredMissedExams.map((exam, idx) => {
                        const startDate = new Date(exam.startDate);
                        const endDate = new Date(exam.endDate);
                        return (
                          <div key={exam._id || idx} className="border rounded-lg p-4 bg-red-50">
                            <div>
                              <h4 className="font-semibold text-lg">{exam.title}</h4>
                              <div className="text-sm text-gray-700">
                                <span>Subject: {exam.subject}</span>
                                <span className="ml-4">Term: {exam.term}</span>
                                <span className="ml-4">
                                  Duration: {Number(exam.duration)} min
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({formatDuration(exam.duration)})
                                  </span>
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <strong>Scheduled:</strong> {startDate.toLocaleString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true,
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  timeZone: 'Africa/Lagos' // or your local timezone
                                })} - {endDate.toLocaleString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true,
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  timeZone: 'Africa/Lagos' // or your local timezone
                                })}
                              </div>
                              <div className="mt-2 text-xs text-red-600">
                                You missed this exam.
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : null}
              </>
            )}

            {/* Cancelled Exams Tab */}
            {activeTab === 'cancelled' && (
              <>
                <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-base font-semibold text-gray-700">
                    Cancelled Exams for term: <span className="underline">{currentTerm || 'Not set'}</span>
                  </span>
                  <button
                    onClick={fetchCategorizedExams}
                    className="ml-2 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-1 font-medium shadow-sm"
                    title="Refresh"
                    style={{ fontSize: '0.95rem' }}
                  >
                    <FiRefreshCcw size={16} />
                    Refresh
                  </button>
                </div>
                {isLoadingCancelled ? (
      <div className="flex flex-col items-center justify-center py-12">
        <TbFidgetSpinner className="animate-spin text-5xl text-gray-700 mb-2" />
        <span className="text-gray-700 font-medium">Loading cancelled exams...</span>
      </div>
    ) : filteredCancelledExams.length === 0 ? (
      <div className="text-gray-600">No cancelled exams for this term.</div>
    ) : (
      <div className="space-y-4">
        {filteredCancelledExams.map((exam, idx) => {
          const startDate = new Date(exam.startDate);
          const endDate = new Date(exam.endDate);
          return (
            <div key={exam._id || idx} className="border rounded-lg p-4 bg-gray-100">
              <div>
                <h4 className="font-semibold text-lg">{exam.title}</h4>
                <div className="text-sm text-gray-700">
                  <span>Subject: {exam.subject}</span>
                  <span className="ml-4">Term: {exam.term}</span>
                  <span className="ml-4">
                    Duration: {Number(exam.duration)} min
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({formatDuration(exam.duration)})
                    </span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  <strong>Scheduled:</strong> {startDate.toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'Africa/Lagos'
                  })} - {endDate.toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'Africa/Lagos'
                  })}
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  This exam was cancelled by your teacher and will not be available.
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
              </>
            )}
          </div>
          {/* Current Term Display */}
          <div className="mb-4 text-lg font-semibold text-green-700">
            Current Term: {currentTerm || 'Not set'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 exam-content">
      {/* Browser Lockdown */}
      <BrowserLockdown 
        isActive={examStarted} 
        onViolation={handleViolation}
        onAutoSubmit={handleAutoSubmitTabSwitch}
      />
      {/* Exam Header */}
      <ExamHeader
        examTitle={selectedExam?.title}
        subject={selectedExam?.subject}
        timeRemaining={timeRemaining}
        studentName={student?.name}
        onExitExam={handleExitExam}
        isWarningTime={isWarningTime}
        isCriticalTime={isCriticalTime}
      />
      {/* Main Content */}
      <div className="pt-20 pb-24 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Display */}
            <div className="lg:col-span-3">
              <QuestionDisplay
                question={getCurrentQuestion()}
                selectedAnswer={answers?.[currentQuestion]}
                onAnswerSelect={handleAnswerSelect}
                onFlagQuestion={handleFlagQuestion}
                isFlagged={flaggedQuestions?.includes(currentQuestion)}
              />
            </div>
            {/* Question Navigation */}
            <div className="lg:col-span-1">
              <QuestionNavigation
                questions={selectedExam?.questions}
                currentQuestion={currentQuestion}
                answeredQuestions={getAnsweredQuestions()}
                flaggedQuestions={flaggedQuestions}
                onQuestionSelect={handleQuestionSelect}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Exam Controls */}
      <ExamControls
        currentQuestion={currentQuestion}
        totalQuestions={selectedExam?.questions?.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmitExam={() => setShowSubmitConfirm(true)} // <-- open modal
        hasAnswered={!!answers?.[currentQuestion]}
        canGoNext={currentQuestion < selectedExam?.questions?.length}
        canGoPrevious={currentQuestion > 1}
      />
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exit Exam?</h3>
              <p className="text-gray-600">
                Are you sure you want to exit? Your progress will be saved, but you may not be able to resume.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Continue Exam
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Exit Exam
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Exam?</h3>
              <p className="text-gray-600">
                Are you sure you want to submit? You will not be able to change your answers after submission.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                No, Go Back
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmitExam(); // <-- Only this final modal triggers submission
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Show live countdown to exam end date */}
      {examStarted && selectedExam && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow z-40">
          <span className="font-semibold">Time left:</span>
          <span className="ml-2 font-bold">
            {getCountdownString(selectedExam.endDate)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ComputerBasedTestingPlatform;