import React, { useEffect, useState } from 'react';
import ResultsTable from '../../results-analytics-portal/components/ResultsTable';

const classList = [
  { id: 'jss1', name: 'JSS1' },
  { id: 'jss2', name: 'JSS2' },
  { id: 'jss3', name: 'JSS3' },
  { id: 'ss1', name: 'SS1' },
  { id: 'ss2', name: 'SS2' },
  { id: 'ss3', name: 'SS3' },
];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

const VerifyResult = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [editResults, setEditResults] = useState({});
  const [verifiedStudents, setVerifiedStudents] = useState({});
  const [viewingStudent, setViewingStudent] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [allVerified, setAllVerified] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [adminId, setAdminId] = useState('');
  const [message, setMessage] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    // Get admin data from localStorage (adjust key as needed)
    const stored = localStorage.getItem('adminData');
    if (stored) {
      try {
        const admin = JSON.parse(stored);
        setAdminId(admin._id);
      } catch {}
    }
  }, []);

  // Fetch students and their pushed results when class is selected
  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      let studentsUrl = `${API_BASE_URL}/api/user/class/${selectedClass}/all/students`;
      if (selectedTerm) {
        studentsUrl += `?term=${selectedTerm}`;
      }
      console.log('Fetching students:', studentsUrl);
      fetch(studentsUrl)
        .then(res => res.json())
        .then(data => {
          setStudents(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => {
          setStudents([]);
          setLoading(false);
        });
    }
  }, [selectedClass, selectedTerm]);

  // Fetch pushed results for each student (refactored)
  useEffect(() => {
    if (students.length > 0 && selectedTerm) {
      setLoading(true);
      const normalizedClassName = selectedClass ? selectedClass.toLowerCase() : '';
      const normalizedTerm = selectedTerm ? selectedTerm.toLowerCase() : '';
      const fetchPromises = students.map(student => {
        const resultsUrl = `${API_BASE_URL}/api/results/student/${student._id}/pushed?className=${normalizedClassName}&term=${normalizedTerm}`;
        return fetch(resultsUrl)
          .then(res => res.json())
          .then(results => {
            const resultObj = {};
            const subjects = [];
            let isReviewed = false;
            let isVerified = false;
            // Always define subjectResults
            let subjectResults = [];
            if (Array.isArray(results) && results.length > 0) {
              // Only consider subject results (not 'Overall')
              subjectResults = results.filter(r => r.subject && r.subject !== 'Overall');
              // Use backend fields directly
              isReviewed = subjectResults.length > 0 && subjectResults.every(r => r.reviewed === true && r.pending === false);
              isVerified = subjectResults.length > 0 && subjectResults.every(r => r.verified === true && r.pending === false);
              results.forEach(r => {
                if (r.subject && r.subject !== 'Overall') {
                  resultObj[r.subject] = r;
                  subjects.push(r.subject);
                } else if (r.subject === 'Overall') {
                  // Map meta/key rating fields
                  Object.assign(resultObj, r);
                }
              });
              resultObj.subjects = subjects;
            }
            // Store backend status fields for this student
            resultObj._status = {
              reviewed: isReviewed,
              verified: isVerified,
              pending: subjectResults.some(r => r.pending === true)
            };
            return { studentId: student._id, resultObj };
          });
      });

      Promise.all(fetchPromises)
        .then(resultsArray => {
          const newEditResults = {};
          const newVerifiedStudents = {};
          resultsArray.forEach(({ studentId, resultObj }) => {
            newEditResults[studentId] = resultObj;
            // Use backend status fields for display
            if (resultObj._status?.verified) {
              newVerifiedStudents[studentId] = 'verified';
            } else if (resultObj._status?.reviewed) {
              newVerifiedStudents[studentId] = 'reviewed';
            } else {
              newVerifiedStudents[studentId] = 'pending';
            }
          });
          setEditResults(newEditResults);
          setVerifiedStudents(newVerifiedStudents);
          setLoading(false);
        })
        .catch(() => {
          setEditResults({});
          setVerifiedStudents({});
          setLoading(false);
        });
    }
  }, [students, selectedClass, selectedTerm]);

  // Handle result modification
  const handleResultChange = (studentId, subject, updatedResult) => {
    setEditResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: updatedResult,
        subjects: prev[studentId].subjects
      }
    }));
  };

  // Save modified result
  const handleSaveResult = (studentId, subject) => {
    const result = editResults[studentId][subject];
    if (!result || !result._id) {
      alert('No result document found for update.');
      return;
    }
    const updateUrl = `${API_BASE_URL}/api/results/update/${result._id}`;
    console.log('Saving result:', updateUrl, result);
    fetch(updateUrl, {
      method: 'PUT',
      body: JSON.stringify(result),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(() => {
        alert('Result updated!');
      });
  };

  // Helper to check if all subjects for a student are reviewed
  const checkStudentReviewed = async (studentId) => {
    const normalizedClassName = selectedClass ? selectedClass.toLowerCase() : '';
    const normalizedTerm = selectedTerm ? selectedTerm.toLowerCase() : '';
    const resultsUrl = `${API_BASE_URL}/api/results/student/${studentId}/all?className=${normalizedClassName}&term=${normalizedTerm}`;
    const res = await fetch(resultsUrl);
    const results = await res.json();

    if (!Array.isArray(results)) return false;

    // Only consider subject results (not 'Overall')
    const subjectResults = results.filter(r => r.subject && r.subject !== 'Overall');
    // Student is reviewed only if all subject results are reviewed
    return subjectResults.length > 0 && subjectResults.every(r => r.reviewed === true);
  };

  // Helper to check if all subjects for a student are verified (after token verification)
  const checkStudentVerified = async (studentId) => {
    const normalizedClassName = selectedClass ? selectedClass.toLowerCase() : '';
    const normalizedTerm = selectedTerm ? selectedTerm.toLowerCase() : '';
    const resultsUrl = `${API_BASE_URL}/api/results/student/${studentId}/all?className=${normalizedClassName}&term=${normalizedTerm}`;
    const res = await fetch(resultsUrl);
    const results = await res.json();

    if (!Array.isArray(results)) return false;

    // Only consider subject results (not 'Overall')
    const subjectResults = results.filter(r => r.subject && r.subject !== 'Overall');
    // Student is verified only if all subject results are verified and pending is false
    return subjectResults.length > 0 && subjectResults.every(r => r.verified === true && r.pending === false);
  };

  // Mark individual student result as reviewed (admin review)
 const handleReviewStudent = async (studentId, retryCount = 0) => {
  setMessage('');
  setReviewLoading(true);
  if (!adminId) {
    setMessage('Admin ID not found. Please log in again.');
    setReviewLoading(false);
    return;
  }
  if (!isValidObjectId(studentId)) {
    setMessage('Invalid student ID.');
    setReviewLoading(false);
    return;
  }
  const normalizedClassName = selectedClass ? selectedClass.toLowerCase() : '';
  const normalizedTerm = selectedTerm ? selectedTerm.toLowerCase() : '';
  const reviewUrl = `${API_BASE_URL}/api/results/review-student-all`;
  try {
    const res = await fetch(reviewUrl, {
      method: 'POST',
      body: JSON.stringify({
        studentId,
        className: normalizedClassName,
        term: normalizedTerm
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setMessage('Result marked as reviewed!');
      setTimeout(() => setMessage(''), 1500);
      // Always re-fetch latest pushed results after status change
      setTimeout(async () => {
        let studentsUrl = `${API_BASE_URL}/api/user/class/${selectedClass}/all/students`;
        if (selectedTerm) studentsUrl += `?term=${selectedTerm}`;
        const studentsRes = await fetch(studentsUrl);
        const studentsData = await studentsRes.json();
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setReviewLoading(false); // <-- Move here so it always resets after re-fetch
      }, 700);
    } else {
      setMessage(data.error || 'Failed to mark as reviewed.');
      setReviewLoading(false);
    }
  } catch (err) {
    setMessage('Network error. Please try again.');
    setReviewLoading(false);
  }
};

  // Check if all students are reviewed
  useEffect(() => {
    if (
      students.length > 0 &&
      students.every(s => verifiedStudents[s._id] === 'reviewed')
    ) {
      setAllVerified(true);
    } else {
      setAllVerified(false);
    }
  }, [verifiedStudents, students]);

  // Finalize verification for the class (with token)
  const handleClassVerification = () => {
    const classVerifyUrl = `${API_BASE_URL}/api/results/verify-class`;
    setMessage(''); // Clear previous messages
    fetch(classVerifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: selectedClass,
        term: selectedTerm,
        token: tokenInput // <-- use the actual input value
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          // Show error from backend (e.g., invalid token)
          setMessage(data.error || 'Verification failed. Please check the token and try again.');
          return;
        }
        alert('Class results verified and pushed to students!');
        setSelectedClass(null);
        setStudents([]);
        setVerifiedStudents({});
        setTokenInput('');
        setEditResults({});
        setViewingStudent(null);
        setAllVerified(false);
      })
      .catch(() => {
        setMessage('Network error. Please try again.');
      });
  };

  // Utility function for ObjectId validation
  const isValidObjectId = id => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Verify Results</h2>
      {/* Display message bar */}
      {message && (
        <div className="mb-4 p-2 rounded bg-red-100 text-red-700 font-semibold text-center">
          {message}
        </div>
      )}
      {!selectedClass && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {classList.map(cls => (
            <div
              key={cls.id}
              className="bg-primary/10 border border-primary rounded-lg shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center p-6"
              onClick={() => setSelectedClass(cls.id)}
            >
              <span className="font-heading font-bold text-lg text-primary mb-2">{cls.name}</span>
              <span className="text-sm text-muted-foreground text-center">Click to verify results for {cls.name}</span>
            </div>
          ))}
        </div>
      )}

      {loading && <p>Loading students...</p>}

      {selectedClass && (
        <div className="mb-4">
          <label className="font-semibold mr-2">Select Term:</label>
          <select
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Select Term --</option>
            <option value="first">First Term</option>
            <option value="second">Second Term</option>
            <option value="third">Third Term</option>
          </select>
        </div>
      )}

      {selectedClass && selectedTerm && students.length === 0 && !loading && (
        <p className="text-center text-muted-foreground mt-4">No students were found for that term.</p>
      )}

      {selectedClass && selectedTerm && students.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Students in {classList.find(c => c.id === selectedClass)?.name}
          </h3>
          <table className="w-full border border-border rounded mb-4">
            <thead>
              <tr>
                <th className="px-2 py-2 border-r border-border">Name</th>
                <th className="px-2 py-2 border-r border-border">View Result</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id}>
                  <td className="px-2 py-2 border-r border-border">
                    <span className="font-bold text-lg text-primary">{student.name}</span>
                  </td>
                  <td className="px-2 py-2 border-r border-border">
                    <button
                      className="px-3 py-1 bg-accent text-white rounded hover:bg-accent/80 transition"
                      onClick={() => setViewingStudent(student._id)}
                    >
                      View Result
                    </button>
                  </td>
                  <td className="px-2 py-2">
                    {/* Status bar in table */}
                    {verifiedStudents[student._id] === 'verified' ? (
                      <span className="text-success font-semibold">Verified</span>
                    ) : verifiedStudents[student._id] === 'reviewed' ? (
                      <span className="text-info font-semibold">Reviewed</span>
                    ) : (
                      <span className="text-warning font-semibold">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {viewingStudent && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
                <button
                  className="absolute top-2 right-2 text-lg"
                  onClick={() => setViewingStudent(null)}
                >
                  &times;
                </button>
                {/* Header Section */}
                <div className="mb-4">
                  <h4 className="font-bold text-lg mb-1">Preview & Modify Result</h4>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span><b>Name:</b> {students.find(s => s._id === viewingStudent)?.name || 'N/A'}</span>
                    <span><b>Class:</b> {classList.find(c => c.id === selectedClass)?.name || 'N/A'}</span>
                    <span><b>Term:</b> {selectedTerm ? selectedTerm.charAt(0).toUpperCase() + selectedTerm.slice(1) + ' Term' : 'N/A'}</span>
                    {/* --- Position Field --- */}
                    <span>
                      <b>Position:</b>{" "}
                      {editResults[viewingStudent]?.position || 'N/A'}
                    </span>
                  </div>
                </div>
                {/* If no result pushed */}
                {!editResults[viewingStudent] ||
                  !editResults[viewingStudent].subjects ||
                  editResults[viewingStudent].subjects.length === 0 ? (
                  <div className="text-center py-8 text-lg text-muted-foreground">
                    No result has been pushed by the teacher.
                  </div>
                ) : (
                  <>
                    {/* Results Table */}
                    <ResultsTable
                      results={
                        editResults[viewingStudent] && editResults[viewingStudent].subjects
                          ? Object.values(editResults[viewingStudent])
                              .filter(r => typeof r === 'object' && r.subject)
                              .map(r => ({
                                ...r,
                                remarks: r.remarks || '',
                                score: r.score || 0,
                              }))
                          : []
                      }
                      editable={true}
                      onChange={(subject, field, value) =>
                        handleResultChange(viewingStudent, subject, {
                          ...editResults[viewingStudent][subject],
                          [field]: value
                        })
                      }
                    />

                    {/* Subjects List */}
                    <div className="my-4">
                      <h3 className="font-bold text-md mb-2">Subjects</h3>
                      <div className="flex flex-wrap gap-2">
                        {editResults[viewingStudent].subjects?.map(subj => (
                          <span key={subj} className="px-2 py-1 bg-primary/10 border border-primary rounded text-primary text-xs font-semibold">
                            {subj}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Rating Section */}
                    <div className="key-rating-section mb-4">
                      <h3 className="font-bold text-lg mb-2 text-center">Key Rating</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-lg mb-4">
                          <thead>
                            <tr className="bg-gray-100">
                              {[
                                'Handwriting', 'Punctuality', 'Initiative', 'Obedience', 'Honesty',
                                'Neatness', 'Attentiveness', 'Respect', 'Attitude', 'Creativity'
                              ].map(label => (
                                <th key={label} className="px-2 py-1">{label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {[
                                'handwriting', 'punctuality', 'initiative', 'obedience', 'honesty',
                                'neatness', 'attentiveness', 'respect', 'attitude', 'creativity'
                              ].map(key => (
                                <td key={key}>
                                  <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={editResults[viewingStudent]?.[key] || ''}
                                    onChange={e =>
                                      handleResultChange(viewingStudent, key, e.target.value)
                                    }
                                    className="border rounded px-2 py-1 w-16"
                                  />
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {(() => {
                                      const val = Number(editResults[viewingStudent]?.[key]);
                                      if (val === 5) return 'EXCELLENT';
                                      if (val === 4) return 'VERY GOOD';
                                      if (val === 3) return 'SATISFACTORY';
                                      if (val === 2) return 'POOR';
                                      if (val === 1) return 'VERY POOR';
                                      return '';
                                    })()}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="comments-section flex flex-col md:flex-row gap-4 justify-between mt-4">
                      <div className="flex-1">
                        <label className="font-semibold">Deans Remark:</label>
                        <input
                          type="text"
                          value={editResults[viewingStudent]?.teacherComment || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'teacherComment', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="font-semibold">Signature & Date:</label>
                        <input
                          type="text"
                          value={editResults[viewingStudent]?.signatureDate || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'signatureDate', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div className="flex-1 mt-4 md:mt-0">
                        <label className="font-semibold">Rectors Remark:</label>
                        <input
                          type="text"
                          value={editResults[viewingStudent]?.headTeacherRemark || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'headTeacherRemark', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                    </div>

                    {/* Meta Fields Section */}
                    <div className="meta-fields-section grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div>
                        <label className="font-semibold">Academic Season:</label>
                        <input
                          type="text"
                          value={editResults[viewingStudent]?.academicYear || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'academicYear', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">No. of Times School Opened:</label>
                        <input
                          type="number"
                          value={editResults[viewingStudent]?.schoolOpened || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'schoolOpened', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">No. of Time Present:</label>
                        <input
                          type="number"
                          value={editResults[viewingStudent]?.present || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'present', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">No. of Time Absent:</label>
                        <input
                          type="number"
                          value={editResults[viewingStudent]?.absent || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'absent', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">Total Score:</label>
                        <input
                          type="number"
                          value={editResults[viewingStudent]?.totalScore || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'totalScore', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">Project Defence:</label>
                        <input
                          type="text"
                          value={editResults[viewingStudent]?.projectDefence || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'projectDefence', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">Over-all Score:</label>
                        <input
                          type="number"
                          value={editResults[viewingStudent]?.overallScore || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'overallScore', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">Average:</label>
                        <input
                          type="number"
                          value={editResults[viewingStudent]?.average || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'average', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div>
                        <label className="font-semibold">Next Term Begins:</label>
                        <input
                          type="text"
                          value={editResults[viewingStudent]?.nextTerm || ''}
                          onChange={e =>
                            handleResultChange(viewingStudent, 'nextTerm', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                    </div>

                    {/* Review Button for Individual Student */}
                    <div className="flex justify-end mt-6">
                      <button
                        className="px-4 py-2 bg-success text-white rounded hover:bg-success/80 transition"
                        onClick={() => handleReviewStudent(viewingStudent)}
                        disabled={verifiedStudents[viewingStudent] === 'reviewed' || verifiedStudents[viewingStudent] === 'verified' || reviewLoading}
                      >
                        {reviewLoading
                          ? 'Marking...'
                          : verifiedStudents[viewingStudent] === 'verified'
                          ? 'Verified'
                          : verifiedStudents[viewingStudent] === 'reviewed'
                          ? 'Reviewed'
                          : 'Mark as Reviewed'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* After all students verified, show token input */}
          {allVerified && (
            <div className="flex flex-col sm:flex-row gap-2 items-center mt-6">
              <div className="mb-2 text-success font-semibold">
                All students reviewed! Please enter the token to push results.
              </div>
              <input
                type="text"
                placeholder="Enter verification token"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                className="border border-border rounded px-2 py-1"
              />
              <button
                className="px-4 py-2 bg-success text-white rounded hover:bg-success/80 transition"
                onClick={handleClassVerification}
                disabled={!tokenInput}
              >
                Confirm Class Verification
              </button>
            </div>
          )}

          <button
            className="mt-4 px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
            onClick={() => {
              setSelectedClass(null);
              setStudents([]);
              setVerifiedStudents({});
              setTokenInput('');
              setEditResults({});
              setViewingStudent(null);
            }}
          >
            Back to Class List
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyResult;