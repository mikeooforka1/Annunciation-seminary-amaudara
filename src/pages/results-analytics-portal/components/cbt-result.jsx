import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CBTResult = () => {
  const [studentData, setStudentData] = useState(null);
  const [userName, setUserName] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [hasSelected, setHasSelected] = useState(false);
  const [cbtResults, setCbtResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get student data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('studentData');
    if (storedData) {
      const student = JSON.parse(storedData);
      setStudentData(student);
      setUserName(student.name || `${student.firstName || student.personal?.firstName || ''} ${student.lastName || student.personal?.lastName || ''}`.trim());
      setSelectedTerm(student.term || student.currentTerm || '');
      setSelectedClass(student.className || '');
    }
  }, []);

  // Fetch CBT results after selection
  useEffect(() => {
    if (studentData?._id && selectedTerm && selectedClass && hasSelected) {
      setIsLoading(true);
      fetch(`${API_BASE_URL}/api/cbt-results/student/${studentData._id}?className=${selectedClass}&term=${selectedTerm}`)
        .then(res => res.json())
        .then(data => {
          setCbtResults(Array.isArray(data) ? data : []);
          setSubjects([...new Set((data || []).filter(r => r.subject && r.subject !== 'Overall').map(r => r.subject))]);
          setIsLoading(false);
        })
        .catch(() => {
          setCbtResults([]);
          setSubjects([]);
          setIsLoading(false);
        });
    }
  }, [studentData, selectedTerm, selectedClass, hasSelected, API_BASE_URL]);

  // Extract session info from the first result (if available)
  const sessionInfo = (() => {
    if (cbtResults.length > 0) {
      const { session, sessionDay, sessionDate } = cbtResults[0];
      return {
        session: session || "N/A",
        sessionDay: sessionDay || "N/A",
        sessionDate: sessionDate || "N/A"
      };
    }
    return { session: "N/A", sessionDay: "N/A", sessionDate: "N/A" };
  })();

  // Manual class options (same as main result page)
  const manualClassOptions = [
    'JSS1A', 'JSS1B',
    'JSS2A', 'JSS2B',
    'JSS3A', 'JSS3B',
    'SS1A', 'SS1B', 'SS1C',
    'SS2A', 'SS2B',
    'SS3A', 'SS3B'
  ];
  const [classOptions, setClassOptions] = useState(manualClassOptions);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/classes/all`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const backendClasses = data
            .filter(cls => typeof cls === 'string' && !manualClassOptions.includes(cls))
            .map(cls => cls);
          setClassOptions([...manualClassOptions, ...backendClasses]);
        }
      })
      .catch(() => {
        setClassOptions(manualClassOptions);
      });
  }, [API_BASE_URL]);

  // Selection screen
  if (!hasSelected) {
    return (
      <main className="pt-24 pb-20 lg:pb-8 transition-all duration-300" style={{ minHeight: '100vh' }}>
        <div className="flex items-center justify-center" style={{ minHeight: '80vh', width: '100%' }}>
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
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                if (selectedTerm && selectedClass) {
                  setHasSelected(true);
                } else {
                  alert('Please select both class and term.');
                }
              }}
              className="w-full px-4 py-2 bg-primary text-white rounded"
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 lg:pb-8 transition-all duration-300" style={{ minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-8 py-8" style={{ width: '100%' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/assets/images/school_logo-1754996036714.jpg"
            alt="School Logo"
            style={{
              width: 100,
              borderRadius: '50%',
              marginBottom: 12,
              border: '4px solid #22c55e'
            }}
          />
          <h1 className="font-extrabold text-3xl md:text-4xl text-gray-900 tracking-wide mb-1 text-center" style={{ letterSpacing: '2px' }}>
            ANNUNCIATION SEMINARY AMAUDARA
          </h1>
          <div className="font-semibold text-lg text-gray-700 mb-1 text-center">
            RENOVARE FACIEM TERRA
          </div>
          <div className="text-sm text-gray-600 mb-1 text-center">
            Isiala Ngwa South, Owerrinta Abia State
          </div>
        </div>

        {/* Session Info */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <div className="text-base font-semibold text-primary">
            <span className="mr-1">Session:</span>
            <span className="font-bold">{sessionInfo.session}</span>
          </div>
          <div className="text-base font-semibold text-primary">
            <span className="mr-1">Day:</span>
            <span className="font-bold">{sessionInfo.sessionDay}</span>
          </div>
          <div className="text-base font-semibold text-primary">
            <span className="mr-1">Date:</span>
            <span className="font-bold">{sessionInfo.sessionDate}</span>
          </div>
        </div>

        {/* Results Table */}
        <div className="results-table mb-8" style={{ position: 'relative', zIndex: 1, overflow: 'visible', width: '100%' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span>Loading CBT results...</span>
            </div>
          ) : (
            <table className="min-w-[500px] w-full table-fixed md:table-auto text-xs md:text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr>
                  <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Subject</th>
                  <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Exam</th>
                  <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Grade</th>
                  <th className="px-2 py-2 bg-muted/50 text-center">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted-foreground">No CBT results available.</td>
                  </tr>
                )}
                {subjects.map(subject => {
                  const result = cbtResults.find(r => r.subject === subject);
                  return (
                    <tr key={subject} className="hover:bg-muted/50 transition-colors">
                      <td className="px-2 py-2 border-r border-border bg-white font-semibold text-center break-words whitespace-normal max-w-[120px] md:max-w-none">
                        {subject}
                      </td>
                      <td className="px-2 py-2 border-r border-border bg-white text-center">
                        {result?.score ?? <span className="italic text-muted-foreground">N/A</span>}
                      </td>
                      <td className="px-2 py-2 border-r border-border bg-white text-center">
                        {result?.grade ?? <span className="italic text-muted-foreground">N/A</span>}
                      </td>
                      <td className="px-2 py-2 bg-white text-center">
                        {typeof result?.remark === 'string' && result.remark.trim() !== ''
                          ? result.remark
                          : <span className="italic text-muted-foreground">N/A</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Rector's Signature */}
        <div className="flex flex-col items-center mt-8">
          <label className="font-semibold mb-2">Rector's Signature:</label>
          <img
            src="/assets/images/rector-signature.jpg"
            alt="Rector's Signature"
            className="h-16 object-contain"
            style={{ background: '#fff', borderRadius: '4px', border: '1px solid #eee', padding: '4px' }}
          />
        </div>
      </div>
    </main>
  );
};

export default CBTResult;