import React, { useState, useEffect } from 'react';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import ContextualBreadcrumbs from '../../components/ui/ContextualBreadcrumbs';
import GradeTrendChart from './components/GradeTrendChart';
import ResultsTable from './components/ResultsTable';
import ExamBreakdownModal from './components/ExamBreakdownModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ResultsAnalyticsPortal = () => {
  const [userRole] = useState('student');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNoResultsModal, setShowNoResultsModal] = useState(false);
  const [filters, setFilters] = useState({
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

  // Move these two lines up here, before any useEffect or logic that uses them
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Add these two states at the top
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
  useEffect(() => {
    if (!studentData?._id) return;
    async function fetchStudentMeta() {
      try {
        const subjectsRes = await fetch(`${API_BASE_URL}/api/student/subjects`);
        const examTypesRes = await fetch(`${API_BASE_URL}/api/student/exam-types`);
        const subjectsData = await subjectsRes.json();
        const examTypesData = await examTypesRes.json();
        setSubjects(subjectsData || []);
        setExamTypes(examTypesData || []);
      } catch (err) {
        setSubjects([]);
        setExamTypes([]);
      }
    }
    fetchStudentMeta();
  }, [API_BASE_URL, studentData]);

  // Fetch results pushed by teacher for this student and term
  const [examResults, setExamResults] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState('');

  useEffect(() => {
    if (
      studentData?._id &&
      selectedTerm &&
      selectedClass
    ) {
      setIsLoadingResults(true);
      setResultsError('');
      fetch(`${API_BASE_URL}/api/results/student/${studentData._id}/${selectedTerm}/${selectedClass}`)
        .then(res => {
          if (!res.ok) throw new Error
          return res.json();
        })
        .then(data => {
          const formattedResults = data.map((result, idx) => ({
            id: idx + 1,
            date: result.date ? new Date(result.date).toISOString().slice(0, 10) : '',
            subject: result.subject,
            subjectIcon: 'BookOpen',
            examType: '',
            score: result.score,
            totalMarks: 100,
            percentage: result.score,
            duration: '',
            remarks: result.remarks || '',
            term: result.term,
            className: result.className
          }));

          // Add overall score and position object
          const totalScore = formattedResults.reduce((sum, r) => sum + (r.score || 0), 0);
          const totalMarks = formattedResults.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
          const overallPercentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

          formattedResults.push({
            subject: 'Overall',
            score: overallPercentage,
            remarks: `Position: ${data[0]?.position || 'N/A'}`
          });

          setExamResults(formattedResults);
          setIsLoadingResults(false);
        })
        .catch(err => {
          setExamResults([]);
          setIsLoadingResults(false);
          setResultsError('Could not fetch results. Please check your network or try again later.');
          console.error('Error fetching results:', err);
        });
    }
  }, [studentData, selectedTerm, selectedClass, API_BASE_URL]);

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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      subject: '',
      examType: '',
      performance: '',
      dateFrom: '',
      dateTo: '',
      dateRange: ''
    });
  };

  const handleExportReport = () => {
    console.log('Exporting comprehensive report...');
    // Mock export functionality
  };

  const handleShareWithParent = () => {
    console.log('Sharing results with parent...');
    // Mock sharing functionality
  };

  const breadcrumbItems = [
    { label: 'Results & Analytics', path: '/results-analytics-portal' }
  ];

  // New state variables for performance summary and grade trend data
  const [performanceSummary, setPerformanceSummary] = useState([]);
  const [gradeTrendData, setGradeTrendData] = useState([]);

  useEffect(() => {
    if (examResults.length > 0) {
      // Average score
      const avgScore = Math.round(
        examResults.reduce((sum, r) => sum + (r.score || 0), 0) / examResults.length
      );

      // Best subject
      const subjectScores = {};
      examResults.forEach(r => {
        if (!subjectScores[r.subject]) subjectScores[r.subject] = [];
        subjectScores[r.subject].push(r.score || 0);
      });
      const bestSubject = Object.entries(subjectScores)
        .map(([subject, scores]) => ({
          subject,
          avg: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
        }))
        .sort((a, b) => b.avg - a.avg)[0]?.subject || '';

      // Exams taken
      const examsTaken = examResults.length;

      // Attendance (if you have attendance data, otherwise mock as 100%)
      const attendance = 100;

      setPerformanceSummary([
        {
          title: 'Average Score',
          value: `${avgScore}%`,
          subtitle: 'This Term',
          icon: 'BarChart',
          trend: avgScore >= 80 ? 'up' : avgScore < 60 ? 'down' : 'neutral',
          trendValue: '', // You can calculate trend compared to previous term if you have data
          color: 'success'
        },
        {
          title: 'Best Subject',
          value: bestSubject,
          subtitle: 'Top Score',
          icon: 'BookOpen',
          trend: 'up',
          trendValue: '',
          color: 'primary'
        },
        {
          title: 'Exams Taken',
          value: examsTaken,
          subtitle: 'This Term',
          icon: 'ClipboardList',
          trend: 'neutral',
          trendValue: '',
          color: 'info'
        },
        {
          title: 'Attendance',
          value: `${attendance}%`,
          subtitle: 'This Term',
          icon: 'UserCheck',
          trend: 'neutral',
          trendValue: '',
          color: 'success'
        }
      ]);
    } else {
      setPerformanceSummary([]);
    }
  }, [examResults]);

  useEffect(() => {
    if (examResults.length > 0) {
      // Group results by month
      const monthMap = {};
      examResults.forEach(res => {
        const month = res.date ? res.date.slice(0, 7) : ''; // 'YYYY-MM'
        if (!monthMap[month]) monthMap[month] = [];
        monthMap[month].push(res.score);
      });

      // Build trend data array
      const trendArr = Object.entries(monthMap).map(([month, scores]) => ({
        month,
        myScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        classAverage: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) // Replace with real class average if available
      }));

      setGradeTrendData(trendArr);
    } else {
      setGradeTrendData([]);
    }
  }, [examResults]);

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

  useEffect(() => {
    // Only hide modal if there are real results (excluding "Overall" row)
    const realResults = examResults.filter(r => r.subject && r.subject !== 'Overall');
    if (realResults.length > 0) {
      setShowNoResultsModal(false);
    } else {
      setShowNoResultsModal(true);
    }
  }, [examResults]);

  return (
    <>
      <RoleBasedHeader
        userRole={userRole}
        userName={userName}
        notifications={3}
      />

      <main className="pt-24 pb-20 lg:pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* --- MOVE THIS SECTION TO THE TOP --- */}
          <ContextualBreadcrumbs items={breadcrumbItems} className="mb-6" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Results & Analytics</h1>
              <p className="font-body text-lg text-muted-foreground mt-2">
                Track your academic performance and progress over time
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button variant="default" onClick={() => window.print()}>
                <Icon name="Printer" size={16} className="mr-2" />
                Print Results
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
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
                {/* Dynamically list classes if available */}
                {studentData?.allClasses?.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
                {/* Fallback to current class */}
                {!studentData?.allClasses && (
                  <option value={studentData?.className}>{studentData?.className}</option>
                )}
              </select>
            </div>
          </div>
          {/* ------------------------------------- */}

          {/* Print Area */}
          <div className="print-area" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <header
              style={{
                textAlign: 'center',
                marginBottom: '24px',
                background: '#16a34a', // Tailwind green-600
                padding: '24px 0',
                borderRadius: '12px',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(22,163,74,0.08)'
              }}
            >
              <img
                src="/assets/images/school_logo-1754996036714.jpg"
                alt="School Logo"
                style={{
                  width: 90,
                  margin: '0 auto 16px auto',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              />
              <h2 style={{
                fontWeight: 'bold',
                fontSize: '2rem',
                marginBottom: '8px',
                color: '#fff',
                letterSpacing: '1px'
              }}>
                Annunciation Seminary Amaudara
              </h2>
              <div style={{
                fontSize: '1.2rem',
                marginBottom: '4px',
                fontWeight: 'bold',
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.12)'
              }}>
                Student: <span style={{ fontWeight: 'bold', fontSize: '1.35rem', color: '#fff' }}>{userName || 'N/A'}</span>
              </div>
              <div style={{
                fontSize: '1.1rem',
                marginBottom: '4px',
                color: '#fff'
              }}>
                Class: {selectedClass || 'N/A'}
              </div>
              <div style={{
                fontSize: '1.1rem',
                marginBottom: '4px',
                color: '#fff'
              }}>
                Term: {selectedTerm || 'N/A'}
              </div>
              <hr style={{ margin: '16px auto', borderTop: '1px solid #fff', opacity: 0.3 }} />
            </header>
            <section style={{ marginBottom: '24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Exam Results</h2>
            </section>
            <div className="results-table mb-8 overflow-x-auto">
              {isLoadingResults ? (
                <div className="flex items-center justify-center py-8">
                  <Icon name="Loader" size={32} className="animate-spin text-primary mr-2" />
                  <span>Loading results...</span>
                </div>
              ) : resultsError ? (
                <div className="text-red-600 py-8">{resultsError}</div>
              ) : (
                <>
                  <ResultsTable 
                    results={filteredResults}
                    onViewDetails={handleExamDetails}
                    showOverallScore={true}
                    showPosition={true}
                  />
                  {/* --- Summary boxes inside results-table for print --- */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '24px 0' }}>
                    {(() => {
                      const overallResult = filteredResults.find(r => r.subject === 'Overall');
                      if (overallResult) {
                        return (
                          <>
                            <div style={{
                              background: '#e0e7ff',
                              padding: '1rem 2rem',
                              borderRadius: '1rem',
                              fontWeight: 'bold',
                              fontSize: '1.2rem',
                              color: '#2563eb',
                              boxShadow: '0 2px 8px rgba(38,99,235,0.08)'
                            }}>
                              Overall Score: <span style={{ color: '#16a34a' }}>{overallResult.score}%</span>
                            </div>
                            <div style={{
                              background: '#f0fdf4',
                              padding: '1rem 2rem',
                              borderRadius: '1rem',
                              fontWeight: 'bold',
                              fontSize: '1.2rem',
                              color: '#16a34a',
                              boxShadow: '0 2px 8px rgba(38,99,235,0.08)'
                            }}>
                              Position: <span style={{ color: '#2563eb' }}>{overallResult.remarks.replace('Position:', '').trim()}</span>
                            </div>
                          </>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  {/* --- End summary boxes --- */}
                </>
              )}
            </div>
          </div>
          {/* --- End printable content --- */}

          {/* The rest of your page */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="w-full lg:w-2/3">
              <GradeTrendChart data={gradeTrendData} />
            </div>
            <div className="w-full lg:w-1/3">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Study Recommendations</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">
                        {lowestSubject
                          ? `Focus on ${lowestSubject}`
                          : 'Keep reviewing all subjects'}
                      </p>
                      <p className="font-caption text-xs text-muted-foreground">
                        {lowestSubject && lowestAvg !== null
                          ? `Your average score in ${lowestSubject} is ${Math.round(lowestAvg)}%. Consider extra practice or asking for help.`
                          : 'No subjects with low scores detected.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <Icon name="CheckCircle" size={16} className="text-success mt-0.5" />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">
                        {bestSubject
                          ? `Excellent in ${bestSubject}`
                          : 'No top subject detected'}
                      </p>
                      <p className="font-caption text-xs text-muted-foreground">
                        {isTopTenPercent
                          ? `Keep up the great work! You're in the top 10% for ${bestSubject}.`
                          : bestAvg !== null
                            ? `Your average in ${bestSubject} is ${Math.round(bestAvg)}%.`
                            : 'No scores available.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <Icon name="Target" size={16} className="text-primary mt-0.5" />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">
                        Goal: {goalAvg}% Average
                      </p>
                      <p className="font-caption text-xs text-muted-foreground">
                        {pointsToGoal > 0
                          ? `You need ${pointsToGoal} more point${pointsToGoal > 1 ? 's' : ''} to reach your semester goal`
                          : `Congratulations! You've reached your semester goal.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    

      {showNoResultsModal && (
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
                onClick={() => {
                  // Only close if there are real results
                  const realResults = examResults.filter(r => r.subject && r.subject !== 'Overall');
                  if (realResults.length > 0) setShowNoResultsModal(false);
                }}
              >
                OK
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const realResults = examResults.filter(r => r.subject && r.subject !== 'Overall');
                  if (realResults.length > 0) setShowNoResultsModal(false);
                }}
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