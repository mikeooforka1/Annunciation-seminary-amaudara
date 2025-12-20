import React, { useState, useEffect } from 'react';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import ContextualBreadcrumbs from '../../components/ui/ContextualBreadcrumbs';
// import GradeTrendChart from './components/GradeTrendChart'; // REMOVED
import ResultsTable from './components/ResultsTable';
import ExamBreakdownModal from './components/ExamBreakdownModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ResultsAnalyticsPortal = () => {
  const [userRole] = useState('student');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters] = useState({
    subject: '',
    examType: '',
    performance: '',
    dateFrom: '',
    dateTo: '',
    dateRange: ''
  });

  // Get user name and student data from localStorage
  const [userName, setUserName] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [currentTerm, setCurrentTerm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [examTypes, setExamTypes] = useState([]);

  useEffect(() => {
    const storedData = localStorage.getItem('studentData');
    if (storedData) {
      const student = JSON.parse(storedData);
      setStudentData(student);
      setUserName(student.name || `${student.firstName || student.personal?.firstName || ''} ${student.lastName || student.personal?.lastName || ''}`.trim());
      setCurrentTerm(student.term || student.currentTerm || '');
      setSelectedTerm(student.term || student.currentTerm || '');
      setSelectedClass(student.className || '');
      // Check for valid _id before proceeding
      if (!student._id) {
        alert('Session expired or invalid. Please log in again.');
        window.location.replace('/login-authentication');
      }
    } else {
      setUserName('John Doe');
    }
  }, []);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch real subjects and exam types from backend
  

  // Fetch results pushed by teacher for this student and term
  const [examResults, setExamResults] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [showNoResultsModal, setShowNoResultsModal] = useState(false);

  const [resultsError, setResultsError] = useState('');

  const [hasSelected, setHasSelected] = useState(false);

  // Utility to check for valid ObjectId
  const isValidObjectId = id => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);

  useEffect(() => {
    if (
      studentData?._id &&
      selectedTerm &&
      selectedClass &&
      hasSelected // <-- Only fetch after selection
    ) {
      if (!isValidObjectId(studentData._id)) {
        setResultsError('Invalid student ID. Please log in again.');
        setExamResults([]);
        setIsLoadingResults(false);
        setShowNoResultsModal(true);
        return;
      }
      setIsLoadingResults(true);
      setResultsError('');
      setShowNoResultsModal(false); // Hide modal while loading
      fetch(`${API_BASE_URL}/api/results/student/${studentData._id}/${selectedTerm}/${selectedClass}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) {
            setExamResults([]);
            setShowNoResultsModal(true);
            setIsLoadingResults(false);
            return;
          }
          // --- INSERT THE MAPPING CODE HERE ---
          const mappedResults = [];
          data.forEach(r => {
            if (r.subject && r.subject !== 'Overall') {
              mappedResults.push(r);
              if (typeof r.firstCatScore === 'number' || (typeof r.firstCatScore === 'string' && r.firstCatScore !== '')) {
                mappedResults.push({
                  ...r,
                  subject: r.subject + ' C/A',
                  score: r.firstCatScore,
                  examScore: undefined,
                  grade: undefined,
                  remark: undefined,
                  maxScore: undefined,
                  minScore: undefined,
                });
              }
            } else {
              mappedResults.push(r);
            }
          });
          setExamResults(mappedResults);

          const subjectsList = [...new Set(mappedResults.filter(r => r.subject && r.subject !== 'Overall').map(r => r.subject))];
          setSubjects(subjectsList);

          setIsLoadingResults(false);
          setShowNoResultsModal(false); // Hide modal if results exist
        })
        .catch(err => {
          setExamResults([]);
          setIsLoadingResults(false);
          setResultsError('Could not fetch results. Please check your network or try again later.');
          setShowNoResultsModal(true);
          console.error('Error fetching results:', err);
        });
    }
  }, [studentData, selectedTerm, selectedClass, API_BASE_URL, hasSelected]);

  // Fetch achievements if you have a backend endpoint for them

  // Fetch detailed exam data if you have a backend endpoint for it
  const [detailedExamData, setDetailedExamData] = useState({});
  const handleExamDetails = (examId) => {
    setSelectedExam(detailedExamData?.[examId]);
    setIsModalOpen(true);
  };

  // Handler to open published exam modal (to be called from "My Exams" tab)
  const [publishedExamModalOpen, setPublishedExamModalOpen] = useState(false);
  const [publishedExamQuestions, setPublishedExamQuestions] = useState(null);
  const handleViewPublishedExam = async (examId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/exams/${examId}`);
      const exam = await res.json();
      setPublishedExamQuestions(exam);
      setPublishedExamModalOpen(true);
    } catch (err) {
      setPublishedExamQuestions(null);
      setPublishedExamModalOpen(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Results & Analytics', path: '/results-analytics-portal' }
  ];

  // REMOVE gradeTrendData state and related useEffect
  // const [gradeTrendData, setGradeTrendData] = useState([]);
  // useEffect(() => { ... }, [examResults]);

  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    let filtered = [...examResults];

    // Subject filter
    if (filters.subject) {
      filtered = filtered.filter(r => r.subject === filters.subject);
    }

    // Exam type filter
    if (filters.examType) {
      filtered = filtered.filter(r => r.examType === filters.examType);
    }

    // Performance filter
    if (filters.performance) {
      filtered = filtered.filter(r => {
        const score = r.percentage || r.score;
        switch (filters.performance) {
          case 'excellent': return score >= 90;
          case 'very-good': return score >= 80 && score < 90;
          case 'good': return score >= 70 && score < 80;
          case 'satisfactory': return score >= 60 && score < 70;
          case 'needs-improvement': return score < 60;
          default: return true;
        }
      });
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(r => r.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => r.date <= filters.dateTo);
    }

    // Quick date range filter
    if (filters.dateRange) {
      const now = new Date();
      let from, to;
      if (filters.dateRange === 'thisMonth') {
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      } else if (filters.dateRange === 'lastMonth') {
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
        to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      } else if (filters.dateRange === 'thisSemester') {
        // Example: Jan-Jun or Jul-Dec
        const semesterStart = now.getMonth() < 6 ? 0 : 6;
        from = new Date(now.getFullYear(), semesterStart, 1).toISOString().slice(0, 10);
        to = new Date(now.getFullYear(), semesterStart + 5, 30).toISOString().slice(0, 10);
      }
      filtered = filtered.filter(r => r.date >= from && r.date <= to);
    }

    setFilteredResults(filtered);

    // --- Add this block ---
    // Ensure "Overall" result is always present
    const overallResult = examResults.find(r => r.subject === 'Overall');
    if (overallResult && !filtered.some(r => r.subject === 'Overall')) {
      setFilteredResults([...filtered, overallResult]);
    }
  }, [examResults, filters]);

  // Find the lowest-performing subject
  let lowestSubject = '';
  let lowestAvg = null;
  if (subjects.length > 0 && examResults.length > 0) {
    subjects.forEach(subject => {
      const subjectResults = examResults.filter(r => r.subject === subject);
      const avgScore = subjectResults.length > 0
        ? subjectResults.reduce((sum, r) => sum + (r.score || 0), 0) / subjectResults.length
        : null;
      if (avgScore !== null && (lowestAvg === null || avgScore < lowestAvg)) {
        lowestAvg = avgScore;
        lowestSubject = subject;
      }
    });
  }

  // Find the best-performing subject and check if it's in the top 10%
  let bestSubject = '';
  let bestAvg = null;
  let isTopTenPercent = false;
  if (subjects.length > 0 && examResults.length > 0) {
    subjects.forEach(subject => {
      const subjectResults = examResults.filter(r => r.subject === subject);
      const avgScore = subjectResults.length > 0
        ? subjectResults.reduce((sum, r) => sum + (r.score || 0), 0) / subjectResults.length
        : null;
      if (avgScore !== null && (bestAvg === null || avgScore > bestAvg)) {
        bestAvg = avgScore;
        bestSubject = subject;
      }
    });
    // Check if bestAvg is in top 10% (>= 90)
    isTopTenPercent = bestAvg !== null && bestAvg >= 90;
  }

  // Calculate current average and points to goal
  const currentAvg = examResults.length > 0
    ? examResults.reduce((sum, r) => sum + (r.score || 0), 0) / examResults.length
    : 0;
  const goalAvg = 90;
  const pointsToGoal = Math.max(0, Math.round(goalAvg - currentAvg));

  useEffect(() => {
    if (examResults.length === 0) {
      setShowNoResultsModal(true);
    } else {
      setShowNoResultsModal(false);
    }
  }, [examResults]);

  // --- ADD THIS LINE RIGHT BEFORE RETURN ---
  const overallResult = filteredResults.find(r => r.subject === 'Overall');

  const handlePrintResult = () => {
    const style = document.createElement('style');
    style.id = 'custom-print-style';
     style.innerHTML = `
      @media print {
        @page {
          size: A3;
          margin: 10mm;
        }
        body * {
          visibility: hidden !important;
        }
        #result-print-section, #result-print-section * {
          visibility: visible !important;
        }
        #result-print-section {
          position: absolute !important;
          left: 0;
          top: 0;
          width: 100vw !important;
          max-width: 100vw !important;
          min-width: 0 !important;
          margin: 0 !important;
          background: none !important;
          box-shadow: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background-image: url("/assets/images/school_logo-1754996036714.jpg") !important;
          background-repeat: no-repeat !important;
          background-position: center center !important;
          background-size: 60% !important;
          font-size: 14px !important;
          overflow-wrap: break-word !important;
        }
        #result-print-section h1, #result-print-section h2, #result-print-section h3 {
          font-size: 1.2em !important;
          word-break: break-word !important;
        }
        #result-print-section table {
          width: 100% !important;
          font-size: 12px !important;
          table-layout: auto !important;
          word-break: break-word !important;
        }
        #result-print-section td, #result-print-section th {
          word-break: break-word !important;
          padding: 2px 4px !important;
        }
        /* Mobile-specific print adjustments */
        @media print and (max-width: 600px) {
          #result-print-section {
            width: 100vw !important;
            max-width: 100vw !important;
            font-size: 11px !important;
            background-size: 90% !important;
            padding: 0 !important;
          }
          #result-print-section table {
            font-size: 10px !important;
          }
          #result-print-section h1, #result-print-section h2 {
            font-size: 1em !important;
          }
        }
      }
    `;
    document.head.appendChild(style);

    window.print();

    window.onafterprint = () => {
      const styleTag = document.getElementById('custom-print-style');
      if (styleTag) styleTag.remove();
      window.onafterprint = null;
    };
  };

  const manualClassOptions = [
    'JSS1A', 'JSS1B',
    'JSS2A', 'JSS2B',
    'JSS3A', 'JSS3B',
    'SS1A', 'SS1B', 'SS1C', // <-- Added SS1C
    'SS2A', 'SS2B',
    'SS3A', 'SS3B'
  ];

  const [classOptions, setClassOptions] = useState(manualClassOptions);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/classes/all`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Merge backend classes with manual list, avoiding duplicates
          const backendClasses = data
            .filter(cls => typeof cls === 'string' && !manualClassOptions.includes(cls))
            .map(cls => cls);
          setClassOptions([...manualClassOptions, ...backendClasses]);
        }
      })
      .catch(() => {
        setClassOptions(manualClassOptions); // fallback to manual list
      });
  }, [API_BASE_URL]);

  // Helper to check if previous class should be shown
  const showPreviousClass =
    studentData?.className &&
    !manualClassOptions.includes(studentData.className) &&
    selectedClass !== studentData.className;

  // Reset results/loading when class/term changes before "Continue"
  useEffect(() => {
    if (!hasSelected) {
      setExamResults([]);
      setResultsError('');
      setIsLoadingResults(false);
    }
  }, [selectedClass, selectedTerm, hasSelected]);

  // Render selection screen if not selected
  if (!hasSelected) {
    return (
      <main className="pt-24 pb-20 lg:pb-8 transition-all duration-300" style={{ minHeight: '100vh' }}>
        <div
          className="flex items-center justify-center"
          style={{ minHeight: '80vh', width: '100%' }}
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-6 text-center">Select Class and Term</h1>
            <div className="flex flex-wrap gap-4 mb-4 justify-center w-full">
              <div>
                <label className="block text-sm font-medium mb-1">Term</label>
                <select
                  value={selectedTerm}
                  onChange={e => setSelectedTerm(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="">Select Term</option>
                  <option value="first">First Term</option>
                  <option value="second">Second Term</option>
                  <option value="third">Third Term</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="">Select Class</option>
                  {classOptions.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                  {showPreviousClass && (
                    <option value={studentData.className}>{studentData.className} (Previous)</option>
                  )}
                </select>
              </div>
            </div>
            <Button
              variant="default"
              onClick={() => {
                if (selectedTerm && selectedClass) {
                  setHasSelected(true);
                } else {
                  alert('Please select both class and term.');
                }
              }}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <RoleBasedHeader
        userRole={userRole}
        userName={userName}
        notifications={3}
      />

      <main className="pt-24 pb-20 lg:pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8" style={{ width: '100%' }}>
          <ContextualBreadcrumbs items={breadcrumbItems} className="mb-6 print-hide" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 print-hide">
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button variant="default" onClick={handlePrintResult}>
                <Icon name="Printer" size={16} className="mr-2" />
                Print Results
              </Button>
            </div>
          </div>
          {/* PRINTABLE AREA */}
          <div
            id="result-print-section"
            style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              position: 'relative',
              background: 'none',
              backgroundImage: 'url("/assets/images/school_logo-1754996036714.jpg")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: '60%',
              opacity: 1,
              minHeight: '100vh',
              maxWidth: '1100px', // <-- Increased from 900px to 1100px
              margin: '0 auto',
            }}
          >
            {/* Watermark overlay */}
            <div className="watermark-overlay" style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: 'rgba(255,255,255,0.72)', // <-- Increased opacity from 0.7 to 0.72
            }} />

            {/* HEADER */}
            <header
              className="print-area-header"
              style={{
                position: 'relative',
                zIndex: 1,
                marginBottom: '24px',
                padding: '16px 0',
                borderBottom: '2px solid #e5e7eb',
                background: '#fff',
                flexWrap: 'wrap',
              }}
            >
              <div className="flex flex-col items-center w-full">
                <img
                  src="/assets/images/school_logo-1754996036714.jpg"
                  alt="School Logo"
                  style={{ width: 100, borderRadius: '50%', marginBottom: 12 }}
                />
                <h1
                  className="font-extrabold text-3xl md:text-4xl text-gray-900 tracking-wide mb-1 text-center"
                  style={{ letterSpacing: '2px' }}
                >
                  ANNUNCIATION SEMINARY AMAUDARA
                </h1>
                <div className="font-semibold text-lg text-gray-700 mb-1 text-center">
                  RENOVARE FACIEM TERRA
                </div>
                <div className="text-sm text-gray-600 mb-1 text-center">
                  Isiala Ngwa South, Owerrinta Abia State
                </div>
                <div className="text-sm text-gray-600 mb-1 text-center">
                  Website: <a href="https://annunciationseminaryamaudara.online" className="text-blue-600 underline">www.annunciationseminaryamaudara.online</a> &nbsp;|&nbsp;
                  Email: <a href="mailto:annunciationseminaryamaudara84@gmail.com" className="text-blue-600 underline">annunciationseminaryamaudara84@gmail.com</a>
                </div>
              </div>
              <div className="flex flex-wrap justify-between items-center mt-4 text-sm text-gray-700 gap-2 px-2 w-full">
                <div>
                  Name: <span className="font-extrabold text-2xl text-primary" style={{ fontWeight: 900, letterSpacing: '1px' }}>
                    {userName || 'N/A'}
                  </span>
                </div>
                <div>
                  Position: <span className="font-bold">{overallResult?.position || 'N/A'}</span>
                </div>
                <div>Class: <span className="font-bold">{selectedClass || 'N/A'}</span></div>
                <div>Term: <span className="font-bold">{selectedTerm || 'N/A'}</span></div>
              </div>
              <div className="flex flex-wrap justify-between items-center mt-2 text-sm text-gray-700 gap-2 px-2 w-full">
                <div>Academic Season: <span className="font-bold">{overallResult?.academicYear || '____'}</span></div>
                <div>Average: <span className="font-bold">{overallResult?.average || '____'}</span></div>
              </div>
              <div className="mt-2 text-sm text-gray-700 px-2 w-full">
                Next Term Begins: <span className="font-bold">{overallResult?.nextTerm || '____'}</span>
              </div>
              <hr style={{ margin: '16px auto', borderTop: '1px solid #ccc' }} />
            </header>

            {/* SUBHEADING */}
            <section style={{ marginBottom: '24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                COGNITIVE DOMAIN [PERFORMANCE IN SUBJECTS]
              </h2>
            </section>

            {/* RESULTS TABLE */}
            <div className="results-table mb-8 overflow-x-auto" style={{ position: 'relative', zIndex: 1 }}>
              {isLoadingResults ? (
                <div className="flex items-center justify-center py-8">
                  <Icon name="Loader" size={32} className="animate-spin text-primary mr-2" />
                  <span>Loading results...</span>
                </div>
              ) : resultsError ? (
                <div className="text-red-600 py-8">{resultsError}</div>
              ) : (
                <ResultsTable results={filteredResults} />
              )}
            </div>

            {/* KEY RATING SECTION */}
            <div className="key-rating-section" style={{ position: 'relative', zIndex: 1 }}>
              <h3 className="font-bold text-lg mb-2 text-center">Key Rating</h3>
              <div className="flex flex-wrap justify-center gap-2 text-sm mb-4">
                <span>5-EXCELLENT</span>
                <span>4-VERY GOOD</span>
                <span>3-SATISFACTORY</span>
                <span>2-POOR</span>
                <span>1-VERY POOR</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 rounded-lg mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1">Handwriting</th>
                      <th className="px-2 py-1">Punctuality</th>
                      <th className="px-2 py-1">Initiative</th>
                      <th className="px-2 py-1">Obedience</th>
                      <th className="px-2 py-1">Honesty</th>
                      <th className="px-2 py-1">Neatness</th>
                      <th className="px-2 py-1">Attentiveness</th>
                      <th className="px-2 py-1">Respect</th>
                      <th className="px-2 py-1">Attitude</th>
                      <th className="px-2 py-1">Creativity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {[
                        'handwriting', 'punctuality', 'initiative', 'obedience', 'honesty',
                        'neatness', 'attentiveness', 'respect', 'attitude', 'creativity'
                      ].map(key => {
                        const value = overallResult?.[key];
                        let label = '';
                        if (value === 5) label = 'Excellent';
                        else if (value === 4) label = 'Very Good';
                        else if (value === 3) label = 'Satisfactory';
                        else if (value === 2) label = 'Poor';
                        else if (value === 1) label = 'Very Poor';
                        return (
                          <td className="px-2 py-1 text-center" key={key}>
                            {value
                              ? <span className="font-bold">{value} - {label}</span>
                              : <span className="text-gray-400">Not marked</span>
                            }
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* COMMENTS SECTION */}
            <div className="comments-section flex flex-col md:flex-row gap-4 justify-between mt-4" style={{ position: 'relative', zIndex: 1 }}>
              <div className="flex-1">
                <label className="font-semibold">Deans Remark:</label>
                <div className="border rounded px-2 py-1 min-h-[32px]">{overallResult?.teacherComment || '_________________________'}</div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <label className="font-semibold">Rector's Signature:</label>
                <div className="flex items-center mt-2 justify-center">
                  <img
                    src="/assets/images/rector-signature.jpg"
                    alt="Rector's Signature"
                    className="h-16 object-contain"
                    style={{ background: '#fff', borderRadius: '4px', border: '1px solid #eee', padding: '4px' }}
                  />
                </div>
              </div>
              <div className="flex-1 mt-4 md:mt-0">
                <label className="font-semibold">Rectors Remark:</label>
                <div className="border rounded px-2 py-1 min-h-[32px]">{overallResult?.headTeacherRemark || '_________________________'}</div>
              </div>
            </div>
          </div>
          {/* END PRINTABLE AREA */}

          {/* The rest of your page (charts, recommendations, etc.) */}
          {/* REMOVED: Grade Trend Chart and Study Recommendations card */}
        </div>
      </main>
      <ExamBreakdownModal
        exam={selectedExam}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExam(null);
        }}
      />

      {isLoadingResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
            <Icon name="Loader" size={32} className="animate-spin text-primary mb-4" />
            <h2 className="font-heading text-xl font-bold mb-2 text-primary">Loading results...</h2>
          </div>
        </div>
      )}

      {showNoResultsModal && !isLoadingResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
            <Icon name="Info" size={32} color="#2563eb" className="mb-4" />
            <h2 className="font-heading text-xl font-bold mb-2 text-primary">Result Not Available</h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Your result for this term has not been published by your teacher yet. Please check back later.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="default"
                onClick={() => setShowNoResultsModal(false)}
              >
                OK
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNoResultsModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultsAnalyticsPortal;