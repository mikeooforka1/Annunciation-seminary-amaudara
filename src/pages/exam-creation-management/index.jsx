import React, { useState, useEffect } from 'react';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import AcademicTabNavigation from '../../components/ui/AcademicTabNavigation';
import ContextualBreadcrumbs from '../../components/ui/ContextualBreadcrumbs';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ExamConfigurationPanel from './components/ExamConfigurationPanel';
import QuestionBuilder from './components/QuestionBuilder';
import ExamPreview from './components/ExamPreview';
import QuestionBankModal from './components/QuestionBankModal';
import Modal from '../../components/ui/Modal'; // If you have a Modal component
import { TbFidgetSpinner } from "react-icons/tb"; // <-- Add this import at the top
import { FiRefreshCcw } from "react-icons/fi";

const initialExamData = {
  title: '',
  subject: '',
  class: '',
  duration: '',
  difficulty: '',
  instructions: '',
  totalMarks: '',
  passMarks: '',
  maxAttempts: 1,
  questionOrder: 'sequential',
  showResultsImmediately: false,
  allowReview: true,
  startDate: '',
  endDate: '',
  preventTabSwitching: true,
  disableCopyPaste: true,
  fullscreenMode: false,
  maxTabSwitchWarnings: 3
};

const POLLING_INTERVAL = 30000; // 30 seconds

const ExamCreationManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Only this state
  const [activeView, setActiveView] = useState('configuration'); // 'configuration', 'questions', 'existing', 'submitted'
  const [activeExamTab, setActiveExamTab] = useState('all'); // 'all' or 'submitted'
  const [showPreview, setShowPreview] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [openExamModal, setOpenExamModal] = useState(null); // <-- Add this line to fix "not defined" error
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openPhotoModal, setOpenPhotoModal] = useState({ idx: null, photo: null }); // <-- Add this to fix "not defined" error
  const [errorMsg, setErrorMsg] = useState('');
  const [openPhotoIdx, setOpenPhotoIdx] = useState(null); // <-- Add this line
  const [currentTerm, setCurrentTerm] = useState('');
  const [draftMsg, setDraftMsg] = useState('');

  // Get teacher data from localStorage
  const [teacherData, setTeacherData] = useState(null);
  useEffect(() => {
    const storedData = localStorage.getItem('teacherData');
    if (storedData) {
      const teacher = JSON.parse(storedData);
      setTeacherData(teacher);
      setCurrentTerm(teacher?.term || teacher?.currentTerm || ''); // Detect term
    }
  }, []);

  // Exam data state
  const [examData, setExamData] = useState(initialExamData);

  const [questions, setQuestions] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // <-- Use env variable

  // Exam fetch with teacherId validation
  const fetchExams = async () => {
    setIsLoading(true);
    const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
    if (!teacherData || !teacherData._id) {
      setErrorMsg('No teacher ID found. Please log in again.');
      setIsLoading(false);
      console.error('Fetch aborted: teacherData or teacherData._id missing', teacherData);
      return;
    }
    const url = `${API_BASE_URL}/api/exams/teacher?teacherId=${teacherData._id}`;
    console.log('Fetching exams:', url);
    try {
      const res = await fetch(url, {
        credentials: 'include',
      });
      console.log('Exams response status:', res.status);
      const data = await res.json();
      console.log('Exams response data:', data);
      if (!res.ok || !Array.isArray(data)) throw new Error(data.error || 'Unable to fetch exams.');
      setExams(data);
      setErrorMsg('');
    } catch (err) {
      console.error('Error fetching exams:', err);
      setExams([]);
      setErrorMsg('Oops! We couldn\'t load your exams. Please check your internet connection or contact support.');
    }
    setIsLoading(false);
  };

  // Fetch all submitted exams grouped by student for teacher
  const fetchSubmittedExamsByStudent = async () => {
    setIsLoading(true);
    const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
    if (!teacherData || !teacherData._id) {
      setErrorMsg('No teacher ID found. Please log in again.');
      setIsLoading(false);
      console.error('Fetch aborted: teacherData or teacherData._id missing', teacherData);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/exams/submitted-by-student?teacherId=${teacherData._id}`, {
        credentials: 'include',
      });
      console.log('Submitted exams response status:', res.status);
      const data = await res.json();
      console.log('Submitted exams response data:', data);
      if (!res.ok || !Array.isArray(data)) throw new Error(data.error || 'Unable to fetch submitted exams.');
      setSubmissions(data);
      setErrorMsg('');
    } catch (err) {
      console.error('Error fetching submitted exams:', err);
      setSubmissions([]);
      setErrorMsg('Sorry, we couldn\'t load student submissions. Please try again or contact support.');
    }
    setIsLoading(false);
  };

  // Fetch all submissions for teacher's exams
  const fetchAllSubmissions = async () => {
    if (!exams.length) return;
    setIsLoading(true);
    try {
      const allSubmissions = [];
      for (const exam of exams) {
        const res = await fetch(`${API_BASE_URL}/api/exams/submissions?examId=${exam._id}`, {
          credentials: 'include', // <-- Send cookies/session with request
        });
        if (!res.ok) throw new Error('Unable to fetch submissions.');
        const data = await res.json();
        if (Array.isArray(data)) {
          data.forEach(sub => allSubmissions.push({ ...sub, exam }));
        }
      }
      setSubmissions(allSubmissions);
      setErrorMsg('');
    } catch (err) {
      setSubmissions([]);
      setErrorMsg('Sorry, we couldn\'t load student submissions. Please try again or contact support.');
    }
    setIsLoading(false);
  };

  const breadcrumbItems = [
    { label: 'Exam Management', path: '/exam-creation-management' }
  ];

  const handleExamDataChange = (newData) => {
    setExamData(newData);
  };

  const handleAddQuestion = (question) => {
    setQuestions(prev => [...prev, question]);
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(prev => prev?.filter(q => q?.id !== questionId));
  };

  const handleImportQuestions = (importedQuestions) => {
    const questionsWithNewIds = importedQuestions?.map(q => ({
      ...q,
      id: Date.now() + Math.random()
    }));
    setQuestions(prev => [...prev, ...questionsWithNewIds]);
  };

  // When saving/publishing an exam, ensure term is set
  const handleSaveExam = async () => {
    setIsLoading(true);
    setTimeout(() => {
      const payload = {
        ...examData,
        term: currentTerm,
        questions,
        // Convert startDate and endDate to ISO format if present
        startDate: examData.startDate ? new Date(examData.startDate).toISOString() : '',
        endDate: examData.endDate ? new Date(examData.endDate).toISOString() : '',
      };
      console.log('Exam saved as draft:', payload);
      setIsLoading(false);
    }, 1000);
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setDraftMsg('');
    try {
      const teacherClass = teacherData?.className || teacherData?.class;
      const payload = {
        ...examData,
        questions,
        status: 'draft',
        createdBy: teacherData?._id,
        class: teacherClass,
        term: currentTerm,
        startDate: examData.startDate ? new Date(examData.startDate).toISOString() : '',
        endDate: examData.endDate ? new Date(examData.endDate).toISOString() : '',
        photo: '',
      };
      const res = await fetch(`${API_BASE_URL}/api/exams/save-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        setErrorMsg('');
        setDraftMsg('✅ Draft saved successfully! You can continue later.');
        localStorage.setItem('examDraft', JSON.stringify({ examData: payload, questions }));
      } else {
        setErrorMsg(result.error || 'Failed to save draft.');
        setDraftMsg('');
      }
    } catch (err) {
      setErrorMsg('Network error. Please check your connection and try again.');
      setDraftMsg('');
    }
    setIsLoading(false);
  };

  // Reset exam after publish
  const handlePublishExam = async () => {
    // Check for missing questions
    if (!questions || questions.length === 0) {
      setErrorMsg('Please add at least one question before publishing the exam.');
      alert('⚠️ You must add at least one question before publishing your exam.');
      return;
    }
    // Check for missing required exam fields
    const requiredFields = [
      { key: 'title', label: 'Exam Title' },
      { key: 'subject', label: 'Subject' },
      { key: 'class', label: 'Class' },
      { key: 'duration', label: 'Duration' },
      { key: 'totalMarks', label: 'Total Marks' },
      { key: 'passMarks', label: 'Pass Marks' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' }
    ];
    const missingFields = requiredFields.filter(f => !examData[f.key] || String(examData[f.key]).trim() === '');
    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(f => f.label).join(', ');
      setErrorMsg(`Please fill in the following required fields before publishing: ${missingLabels}`);
      alert(`⚠️ Please fill in the following required fields before publishing:\n${missingLabels}`);
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const teacherClass = teacherData?.className || teacherData?.class;
      const payload = {
        ...examData,
        questions,
        status: 'published',
        createdBy: teacherData?._id,
        class: teacherClass,
        term: currentTerm, // Ensure term is set
        startDate: examData.startDate ? new Date(examData.startDate).toISOString() : '',
        endDate: examData.endDate ? new Date(examData.endDate).toISOString() : '',
        photo: '',
      };
      const res = await fetch(`${API_BASE_URL}/api/exams/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        alert('🎉 Exam published successfully! Students will see it at the scheduled time.');
        setExamData({ ...initialExamData, class: teacherClass, term: currentTerm });
        setQuestions([]);
        setErrorMsg('');
        fetchExams();
        fetchAllSubmissions();
      } else {
        setErrorMsg(result.error || 'Failed to publish exam. Please check your details and try again.');
        alert(result.error || 'Failed to publish exam. Please check your details and try again.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please check your connection and try again.');
      alert('Network error. Please check your connection and try again.');
    }
    setIsLoading(false);
  };

  const handleCancelExam = async (examId) => {
    if (!window.confirm('Are you sure you want to cancel this exam? This action cannot be undone.')) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/exams/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId }),
      });
      const result = await res.json();
      if (res.ok) {
        alert('Exam cancelled successfully.');
        fetchExams();
      } else {
        setErrorMsg(result.error || 'Failed to cancel exam.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    }
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-success bg-success/10';
      case 'draft': return 'text-warning bg-warning/10';
      case 'scheduled': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return 'CheckCircle';
      case 'draft': return 'Edit3';
      case 'scheduled': return 'Clock';
      default: return 'Circle';
    }
  };

  // Add console logs for debugging
  useEffect(() => {
    console.log('Fetched exams:', exams.map(e => ({ id: e._id, title: e.title, status: e.status })));
  }, [exams]);

  useEffect(() => {
    console.log('Fetched submissions:', submissions.map(s => ({
      id: s._id,
      examId: s.examId,
      studentId: s.studentId,
      examTitle: s.exam?.title,
      studentName: s.studentId?.name
    })));
  }, [submissions]);

  // Filter exams and submissions by current term
  const filteredExams = exams.filter(exam => exam.term === currentTerm);
  const filteredSubmissions = submissions.map(group => ({
    ...group,
    exams: Array.isArray(group.exams)
      ? group.exams.filter(sub => sub.examId?.term === currentTerm)
      : []
  })).filter(group => group.exams.length > 0);

  // Group submissions by student
  const submissionsByStudent = submissions.reduce((acc, sub) => {
    const studentId = sub.studentId?._id || sub.studentId;
    if (!acc[studentId]) acc[studentId] = { student: sub.studentId, exams: [] };
    acc[studentId].exams.push(sub);
    return acc;
  }, {});

  // Fetch exams instantly when "My Exams" tab is active
  useEffect(() => {
    if (activeView === 'existing') {
      fetchExams();
    }
  }, [activeView, teacherData, currentTerm]);

  // Fetch submitted exams instantly when "Submitted Exams" tab is active
  useEffect(() => {
    if (activeView === 'submitted') {
      fetchSubmittedExamsByStudent();
    }
  }, [activeView]);

  // Optionally, fetch exams when teacherData or currentTerm changes
  useEffect(() => {
    if (teacherData && currentTerm) {
      fetchExams();
    }
  }, [teacherData, currentTerm]);

  // Optionally, fetch submissions when exams change (for up-to-date data)
  useEffect(() => {
    if (activeView === 'submitted' && exams.length > 0) {
      fetchAllSubmissions();
    }
  }, [activeView, exams]);

  // Polling for "My Exams" tab
  useEffect(() => {
    let interval;
    if (activeView === 'existing') {
      interval = setInterval(() => {
        fetchExams();
        fetchAllSubmissions();
      }, POLLING_INTERVAL);
    }
    return () => clearInterval(interval);
  }, [activeView, teacherData, currentTerm]);

  useEffect(() => {
    const autoSaveDraft = (e) => {
      if (examData && questions.length > 0 && examData.status !== 'published') {
        handleSaveDraft();
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', autoSaveDraft);
    return () => window.removeEventListener('beforeunload', autoSaveDraft);
  }, [examData, questions, teacherData, currentTerm]);

  useEffect(() => {
    const savedDraft = localStorage.getItem('examDraft');
    if (savedDraft) {
      const { examData: savedExamData, questions: savedQuestions } = JSON.parse(savedDraft);
      if (savedExamData && savedExamData.status !== 'published') {
        setExamData(savedExamData);
        setQuestions(savedQuestions || []);
        setDraftMsg('📝 Draft loaded! Continue from where you stopped.');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <RoleBasedHeader
        userRole="teacher"
        userName={teacherData?.name || teacherData?.fullName || 'Teacher'}
        notifications={teacherData?.notifications || 0}
      />
      
      {/* Indicate current term */}
      <div className="p-4">
        <div className="mb-2 text-lg font-semibold text-primary">
          Current Term: {currentTerm || 'Not set'}
        </div>
      </div>
      {/* Main Content */}
      <div className="pt-16 pb-20 lg:pb-0 transition-all duration-300">
        <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <ContextualBreadcrumbs items={breadcrumbItems} className="mb-6" />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <div>
              <h1 className="font-heading font-bold text-2xl lg:text-3xl text-foreground mb-2">
                Exam Creation & Management
              </h1>
              <p className="font-body text-muted-foreground">
                Create comprehensive CBT assessments with multiple question types and scheduling capabilities
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 lg:mt-0 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowQuestionBank(true)}
                iconName="Database"
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                Question Bank
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                iconName="Eye"
                iconPosition="left"
                disabled={questions?.length === 0}
                className="w-full sm:w-auto"
              >
                Preview
              </Button>
            </div>
          </div>

          {/* Main Tabs */}
          <div className="flex flex-nowrap overflow-x-auto border-b border-border mb-6 gap-1">
            <button
              onClick={() => setActiveView('configuration')}
              className={`flex items-center px-4 py-3 text-sm font-body border-b-2 transition-colors whitespace-nowrap
                ${activeView === 'configuration'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon name="Settings" size={16} className="mr-2" />
              Configuration
            </button>
            <button
              onClick={() => setActiveView('existing')}
              className={`flex items-center px-4 py-3 text-sm font-body border-b-2 transition-colors whitespace-nowrap
                ${activeView === 'existing'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon name="FileText" size={16} className="mr-2" />
              My Exams
            </button>
            <button
              onClick={() => setActiveView('submitted')}
              className={`flex items-center px-4 py-3 text-sm font-body border-b-2 transition-colors whitespace-nowrap
                ${activeView === 'submitted'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon name="Users" size={16} className="mr-2" />
              Submitted Exams
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeView === 'configuration' && (
              <>
                {/* Configuration Panel */}
                <div className="lg:col-span-2">
                  <ExamConfigurationPanel
                    examData={examData}
                    onExamDataChange={setExamData}
                    onSaveExam={handleSaveExam}
                    onSaveDraft={handleSaveDraft} // <-- Add this prop
                    onPublishExam={handlePublishExam}
                    isLoading={isLoading}
                    questions={questions}
                    setQuestions={setQuestions}
                  />
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Exam Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Questions Added:</span>
                        <span className="text-sm font-medium text-foreground">{questions?.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Points:</span>
                        <span className="text-sm font-medium text-foreground">
                          {questions?.reduce((sum, q) => sum + (q?.points || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Duration:</span>
                        <span className="text-sm font-medium text-foreground">
                          {examData?.duration ? `${examData?.duration} min` : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span className="text-sm font-medium text-warning">Draft</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeView === 'questions' && (
              <div className="lg:col-span-3">
                <QuestionBuilder
                  questions={questions}
                  onQuestionsChange={setQuestions}
                  onAddQuestion={handleAddQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onImportQuestions={() => setShowQuestionBank(true)}
                />
              </div>
            )}

            {activeView === 'existing' && (
              <div className="lg:col-span-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-base font-semibold text-primary">
                    Showing exams for term: <span className="underline">{currentTerm || 'Not set'}</span>
                  </span>
                  <button
                    onClick={fetchExams}
                    className="ml-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-2 font-medium shadow-sm"
                    title="Refresh"
                    style={{ fontSize: '1rem' }}
                  >
                    <FiRefreshCcw size={22} />
                    Refresh
                  </button>
                </div>
                {/* My Exams: Only published and draft exams for current term */}
                <div>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <TbFidgetSpinner className="animate-spin text-4xl text-primary" />
                      <span className="ml-3 text-primary font-medium">Loading exams...</span>
                    </div>
                  ) : filteredExams.length === 0 ? (
                    <div className="text-muted-foreground">No exams found for this term.</div>
                  ) : (
                    filteredExams
                      .filter(exam => exam.status === 'published' || exam.status === 'draft')
                      .map(exam => {
                        const now = new Date();
                        const endDate = exam.endDate ? new Date(exam.endDate) : null;
                        const canCancel = exam.status === 'published' && endDate && endDate > now;
                        return (
                          <div key={exam._id} className="mb-4 p-4 border rounded bg-muted">
                            <h3 className="font-semibold">
                              {exam.title}
                              <span className={`ml-2 px-2 py-1 rounded ${getStatusColor(exam.status)}`}>{exam.status}</span>
                            </h3>
                            <div className="text-sm text-muted-foreground">
                              Subject: {exam.subject} | Class: {exam.class} | Term: <span className="font-bold">{exam.term}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                iconName="Eye"
                                onClick={() => setOpenExamModal(exam)}
                              >
                                View Questions
                              </Button>
                              {canCancel && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  iconName="XCircle"
                                  onClick={() => handleCancelExam(exam._id)}
                                >
                                  Cancel Exam
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
                {/* Modal for viewing exam questions professionally */}
                {openExamModal && (
                  <Modal
                    isOpen={!!openExamModal}
                    onClose={() => setOpenExamModal(null)}
                    title={`Exam: ${openExamModal.title} (${openExamModal.subject})`}
                  >
                    <div>
                      <h4 className="font-heading font-semibold mb-2">
                        {openExamModal.title} ({openExamModal.subject})
                      </h4>
                      <div className="mb-4">
                        <strong>Questions:</strong>
                        <div className="space-y-4 mt-2">
                          {(openExamModal.questions || []).map((q, idx) => {
                            let displayOptions = null;
                            if (q.type === 'multiple-choice' && Array.isArray(q.options)) {
                              displayOptions = (
                                <ul className="ml-4 list-disc">
                                  {q.options.map((opt, i) => (
                                    <li key={i} className="mb-1">{opt}</li>
                                  ))}
                                </ul>
                              );
                            } else if (q.type === 'true-false') {
                              displayOptions = (
                                <div className="ml-4">
                                  <span className="mr-2">True</span>
                                  <span>False</span>
                                </div>
                              );
                            }
                            return (
                              <div key={idx} className="p-3 border rounded bg-muted relative mb-4">
                                <div className="font-medium mb-1 flex items-center gap-2">
                                  {idx + 1}. {q?.text || q?.question || 'Question'}
                                  {q?.photo && (
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      className="ml-2 px-2 py-1 text-xs text-primary border border-primary rounded hover:bg-primary/10"
                                      onClick={() => setOpenPhotoModal({ idx, photo: q.photo })}
                                    >
                                      📷 View Photo
                                    </Button>
                                  )}
                                </div>
                                {/* Photo Modal for enlarged view */}
                                {openPhotoModal.idx === idx && openPhotoModal.photo && (
                                  <Modal
                                    isOpen={true}
                                    onClose={() => setOpenPhotoModal({ idx: null, photo: null })}
                                    title={`Question ${idx + 1} Photo`}
                                  >
                                    <img
                                      src={openPhotoModal.photo}
                                      alt={`Question ${idx + 1} Full Photo`}
                                      style={{ maxWidth: '100%', borderRadius: '8px' }}
                                    />
                                  </Modal>
                                )}
                                <div>
                                  <span className="text-muted-foreground">Type: </span>
                                  <span className="font-semibold">{q.type === 'multiple-choice' ? 'Multiple Choice' : q.type === 'true-false' ? 'True/False' : q.type === 'short-answer' ? 'Short Answer' : q.type === 'essay' ? 'Essay' : q.type}</span>
                                </div>
                                {displayOptions && (
                                  <div className="mt-2">
                                    <span className="text-muted-foreground">Options:</span>
                                    {displayOptions}
                                  </div>
                                )}
                                {q.type === 'short-answer' && (
                                  <div className="mt-2 text-muted-foreground">Expected: Short written answer</div>
                                )}
                                {q.type === 'essay' && (
                                  <div className="mt-2 text-muted-foreground">Expected: Essay response</div>
                                )}
                                <div className="mt-2 text-muted-foreground">Points: <span className="font-semibold">{q.points || 0}</span></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mb-4">
                        <strong>Exam Details:</strong>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div><strong>Duration:</strong> {openExamModal.duration ? `${openExamModal.duration} min` : 'N/A'}</div>
                          <div><strong>Total Marks:</strong> {openExamModal.totalMarks || 'N/A'}</div>
                          <div><strong>Pass Marks:</strong> {openExamModal.passMarks || 'N/A'}</div>
                          <div><strong>Status:</strong> {openExamModal.status}</div>
                          <div><strong>Start Date:</strong> {openExamModal.startDate ? new Date(openExamModal.startDate).toLocaleString() : 'N/A'}</div>
                          <div><strong>End Date:</strong> {openExamModal.endDate ? new Date(openExamModal.endDate).toLocaleString() : 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </Modal>
                )}
              </div>
            )}

            {activeView === 'submitted' && (
              <div className="lg:col-span-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-base font-semibold text-primary">
                    Showing submitted exams for term: <span className="underline">{currentTerm || 'Not set'}</span>
                  </span>
                  <button
                    onClick={fetchSubmittedExamsByStudent}
                    className="ml-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-2 font-medium shadow-sm"
                    title="Refresh"
                    style={{ fontSize: '1rem' }}
                  >
                    <FiRefreshCcw size={22} />
                    Refresh
                  </button>
                </div>
                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <TbFidgetSpinner className="animate-spin text-4xl text-primary" />
                    <span className="ml-3 text-primary font-medium">Loading submissions...</span>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="text-muted-foreground">No submitted exams found for this term.</div>
                ) : (
                  filteredSubmissions.map(({ student, exams }) => (
                    <div key={student._id || student} className="mb-8 p-4 border rounded bg-muted">
                      <h3 className="font-semibold mb-2">
                        {student.name || student.fullName || student._id}
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        {exams.map(sub => {
                          // --- Auto-mark multiple choice ---
                          let mcTotal = 0;
                          let mcScore = 0;
                          if (sub.examId?.questions) {
                            sub.examId.questions.forEach((q, idx) => {
                              if (q.type === 'multiple-choice') {
                                mcTotal += q.points || 1;
                                const answer =
                                  sub.answers[q?.id] ??
                                  sub.answers[String(q?.id)] ??
                                  sub.answers[idx + 1] ??
                                  sub.answers[idx] ??
                                  (Array.isArray(sub.answers) ? sub.answers[idx] : undefined);
                                // Mark correct if answer matches correctAnswer index
                                if (
                                  q.correctAnswer !== undefined &&
                                  answer !== undefined &&
                                  String(answer) === String(q.correctAnswer)
                                ) {
                                  mcScore += q.points || 1;
                                }
                              }
                            });
                          }
                          return (
                            <div key={sub._id} className="border rounded p-3 bg-white flex flex-col items-start min-w-[200px]">
                              <div className="flex items-center mb-2">
                                <strong>{sub.examId?.subject || sub.examId?.title || 'Exam'}</strong>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                              {/* Show auto-marked multiple choice score */}
                              <div className="mb-2">
                                <span className="font-semibold text-success">
                                  Multiple Choice Score: {mcScore}/{mcTotal}
                                </span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (Other question types to be marked manually)
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSubmission(sub)}
                                iconName="Eye"
                                className="w-full"
                              >
                                View Answers
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
                {/* Submission Modal/Panel */}
                {selectedSubmission && (
                  <Modal
                    isOpen={!!selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    title={`Submission by ${selectedSubmission.studentId?.name || selectedSubmission.studentId?.fullName || selectedSubmission.studentId?._id}`}
                  >
                    <div>
                      <h4 className="font-heading font-semibold mb-2">
                        {selectedSubmission.examId?.title} ({selectedSubmission.examId?.subject})
                      </h4>
                      <div className="mb-4">
                        <strong>Questions & Answers:</strong>
                        <div className="space-y-4 mt-2">
                          {selectedSubmission.examId?.questions?.map((q, idx) => {
                            let answer;
                            if (selectedSubmission.answers) {
                              answer =
                                selectedSubmission.answers[q?.id] ??
                                selectedSubmission.answers[String(q?.id)] ??
                                selectedSubmission.answers[idx + 1] ??
                                selectedSubmission.answers[idx] ??
                                (Array.isArray(selectedSubmission.answers) ? selectedSubmission.answers[idx] : undefined);
                            }

                            // Format answer for display based on question type
                            let displayAnswer;
                            if (answer === undefined || answer === null || answer === '') {
                              displayAnswer = <span className="italic text-warning">Not answered</span>;
                            } else if (q.type === 'multiple-choice' && Array.isArray(q.options)) {
                              displayAnswer = q.options[Number(answer)] ?? answer;
                            } else if (q.type === 'true-false') {
                              displayAnswer = answer === true || answer === 'true' || answer === 1 || answer === '1'
                                ? 'True'
                                : answer === false || answer === 'false' || answer === 0 || answer === '0'
                                  ? 'False'
                                  : String(answer);
                            } else if (q.type === 'short-answer' || q.type === 'essay') {
                              displayAnswer = <span style={{ whiteSpace: 'pre-line' }}>{String(answer)}</span>;
                            } else {
                              displayAnswer = String(answer);
                            }

                            // --- Show auto-mark result for multiple choice ---
                            let autoMark = null;
                            if (q.type === 'multiple-choice' && q.correctAnswer !== undefined) {
                              autoMark =
                                String(answer) === String(q.correctAnswer)
                                  ? <span className="ml-2 text-success font-bold">✔ {q.points || 1} pt</span>
                                  : <span className="ml-2 text-destructive font-bold">✘ 0 pt</span>;
                            }

                            return (
                              <div key={idx} className="p-3 border rounded bg-muted relative mb-4">
                                <div className="font-medium mb-1 flex items-center gap-2">
                                  {idx + 1}. {q?.text || q?.question || 'Question'}
                                  {q?.photo && (
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      className="ml-2 px-2 py-1 text-xs text-primary border border-primary rounded hover:bg-primary/10"
                                      onClick={() => setOpenPhotoModal({ idx, photo: q.photo })}
                                    >
                                      📷 View Photo
                                    </Button>
                                  )}
                                </div>
                                {/* Photo Modal for enlarged view */}
                                {openPhotoModal.idx === idx && openPhotoModal.photo && (
                                  <Modal
                                    isOpen={true}
                                    onClose={() => setOpenPhotoModal({ idx: null, photo: null })}
                                    title={`Question ${idx + 1} Photo`}
                                  >
                                    <img
                                      src={openPhotoModal.photo}
                                      alt={`Question ${idx + 1} Full Photo`}
                                      style={{ maxWidth: '100%', borderRadius: '8px' }}
                                    />
                                  </Modal>
                                )}
                                <div>
                                  <span className="text-muted-foreground">Student Answer: </span>
                                  <span className="font-semibold">{displayAnswer}</span>
                                  {autoMark}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mb-4">
                        <strong>Submission Details:</strong>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div><strong>Submitted At:</strong> {selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : 'N/A'}</div>
                          <div><strong>Time Spent:</strong> {typeof selectedSubmission.timeSpent === 'number' ? `${selectedSubmission.timeSpent} min` : 'N/A'}</div>
                          <div><strong>Flagged Questions:</strong> {Array.isArray(selectedSubmission.flaggedQuestions) && selectedSubmission.flaggedQuestions.length > 0 ? selectedSubmission.flaggedQuestions.join(', ') : 'None'}</div>
                          <div><strong>Violations:</strong> {Array.isArray(selectedSubmission.violations) && selectedSubmission.violations.length > 0 ? selectedSubmission.violations.join(', ') : 'None'}</div>
                          <div className="col-span-1 sm:col-span-2"><strong>Photo:</strong> {selectedSubmission.photo ? (<img src={selectedSubmission.photo} alt="Submitted Exam Photo" style={{ maxWidth: '300px', borderRadius: '8px', marginTop: '8px' }} />) : 'None'}</div>
                        </div>
                      </div>
                    </div>
                  </Modal>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modals */}
      {showPreview && (
        <ExamPreview
          examData={examData}
          questions={questions}
          onClose={() => setShowPreview(false)}
        />
      )}
      {showQuestionBank && (
        <QuestionBankModal
          isOpen={showQuestionBank}
          onClose={() => setShowQuestionBank(false)}
          onImportQuestions={handleImportQuestions}
        />
      )}
      {draftMsg && (
        <div className="mb-4 px-4 py-2 rounded bg-green-100 text-green-800 font-semibold shadow">
          {draftMsg}
        </div>
      )}
    </div>
  );
};

export default ExamCreationManagement;