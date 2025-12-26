import React, { useEffect, useState } from 'react';
import ResultsTable from '../../results-analytics-portal/components/ResultsTable';

// Add ss1c to the manual class list
const manualClassList = [
  { id: 'jss1a', name: 'JSS1A' },
  { id: 'jss1b', name: 'JSS1B' },
  { id: 'jss2a', name: 'JSS2A' },
  { id: 'jss2b', name: 'JSS2B' },
  { id: 'jss3a', name: 'JSS3A' },
  { id: 'jss3b', name: 'JSS3B' },
  { id: 'ss1a', name: 'SS1A' },
  { id: 'ss1b', name: 'SS1B' },
  { id: 'ss1c', name: 'SS1C' }, // Added
  { id: 'ss2a', name: 'SS2A' },
  { id: 'ss2b', name: 'SS2B' },
  { id: 'ss3a', name: 'SS3A' },
  { id: 'ss3b', name: 'SS3B' },
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [classVerificationLoading, setClassVerificationLoading] = useState(false);
  const [classList, setClassList] = useState(manualClassList);
  const [confirmRemoveSubject, setConfirmRemoveSubject] = useState(null); // subject name to confirm
  const [studentTokenInput, setStudentTokenInput] = useState('');
  const [studentVerificationLoading, setStudentVerificationLoading] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [pendingEditAction, setPendingEditAction] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(null);

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

  // Fetch additional classes from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/classes/all`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Support both string and object formats from backend
          const backendClasses = data
            .map(cls =>
              typeof cls === 'string'
                ? { id: cls.toLowerCase(), name: cls.toUpperCase() }
                : { id: cls.id?.toLowerCase() || '', name: cls.name || (cls.id ? cls.id.toUpperCase() : '') }
            )
            .filter(cls => cls.id && !manualClassList.some(m => m.id === cls.id));
          setClassList([...manualClassList, ...backendClasses]);
        }
      })
      .catch(() => {
        setClassList(manualClassList); // fallback to manual list
      });
  }, [API_BASE_URL]);

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

  // --- Live position & average calculation for all students (exact teacher logic) ---
  useEffect(() => {
    if (students.length > 0) {
      // 1. Calculate each student's total C.A.T + Exam for all their subjects
      const studentTotals = students.map(student => {
        const studentId = student._id;
        let totalScore = 0;
        let subjectCount = 0;
        const result = editResults[studentId];
        if (result && Array.isArray(result.subjects)) {
          result.subjects.forEach(subject => {
            const cat = Number(result[subject]?.cat1 ?? 0);
            const exam = Number(result[subject]?.exam ?? 0);
            // Only count if at least one score is entered
            if (cat !== 0 || exam !== 0) {
              totalScore += cat + exam;
              subjectCount += 1;
            }
          });
        }
        // If no subjects have scores, fallback to subjects.length
        if (subjectCount === 0 && result && Array.isArray(result.subjects)) subjectCount = result.subjects.length;
        let average = subjectCount > 0 ? totalScore / subjectCount : 0;
        if (average > 100) average = 100;
        return {
          studentId,
          totalScore,
          average: Number(average.toFixed(1)),
        };
      });

      // 2. Sort by average DESC for position
      const sorted = [...studentTotals].sort((a, b) => b.average - a.average);

      // 3. Assign positions (handle ties)
      const positionMap = {};
      let lastAverage = null;
      let lastPosition = 0;
      let actualPosition = 1;
      sorted.forEach(item => {
        if (lastAverage !== null && item.average === lastAverage) {
          positionMap[item.studentId] = lastPosition;
        } else {
          positionMap[item.studentId] = actualPosition;
          lastAverage = item.average;
          lastPosition = actualPosition;
        }
        actualPosition++;
      });

      // 4. Update position and average for each student (unless manually set)
      setEditResults(prev => {
        // Only update if values actually changed
        let changed = false;
        const updated = { ...prev };
        students.forEach(student => {
          const studentId = student._id;
          const autoAverage = studentTotals.find(s => s.studentId === studentId)?.average || 0;
          const autoPosition = positionMap[studentId]
            ? `${positionMap[studentId]}${positionMap[studentId] === 1 ? 'st' : positionMap[studentId] === 2 ? 'nd' : positionMap[studentId] === 3 ? 'rd' : 'th'}`
            : '';
          // Only update if not manually set
          if (
            !updated[studentId]?.manualPosition // You can set this flag when admin manually edits position
          ) {
            updated[studentId] = {
              ...(updated[studentId] || {}),
              average: autoAverage,
              position: autoPosition,
            };
          }
        });
        return changed ? updated : prev;
      });
    }
  }, [students]); // Remove editResults from dependencies!
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
            // --- Use this mapping here ---
            const mapped = {};
            const subjects = [];
            let isReviewed = false;
            let isVerified = false;
            let subjectResults = [];
            results.forEach(r => {
              if (r.subject && r.subject !== 'Overall') {
                subjects.push(r.subject);
                mapped[r.subject] = {
                  cat1: r.firstCatScore ?? '',
                  exam: r.examScore ?? '',
                  maxScore: r.maxScore ?? '',
                  minScore: r.minScore ?? '',
                  grade: r.grade ?? '',
                  remark: r.remark ?? '',
                  _id: r._id,
                  reviewed: r.reviewed,
                  verified: r.verified,
                  pending: r.pending
                };
                subjectResults.push(r);
              } else if (r.subject === 'Overall') {
                mapped._overallId = r._id; // <-- Add this line
                mapped.position = r.position ?? '';
                mapped.academicYear = r.academicYear ?? '';
                mapped.schoolOpened = r.schoolOpened ?? '';
                mapped.present = r.present ?? '';
                mapped.absent = r.absent ?? '';
                mapped.average = r.average ?? '';
                mapped.nextTerm = r.nextTerm ?? '';
                mapped.teacherComment = r.teacherComment ?? '';
                mapped.headTeacherRemark = r.headTeacherRemark ?? '';
                // --- Add key rating fields ---
                mapped.handwriting = r.handwriting ?? '';
                mapped.punctuality = r.punctuality ?? '';
                mapped.initiative = r.initiative ?? '';
                mapped.obedience = r.obedience ?? '';
                mapped.honesty = r.honesty ?? '';
                mapped.neatness = r.neatness ?? '';
                mapped.attentiveness = r.attentiveness ?? '';
                mapped.respect = r.respect ?? '';
                mapped.attitude = r.attitude ?? '';
                mapped.creativity = r.creativity ?? '';
              }
            });
            mapped.subjects = subjects;

            // Calculate status for this student
            isReviewed = subjectResults.length > 0 && subjectResults.every(r => r.reviewed === true && r.pending === false);
            isVerified = subjectResults.length > 0 && subjectResults.every(r => r.verified === true && r.pending === false);
            mapped._status = { reviewed: isReviewed, verified: isVerified, pending: subjectResults.some(r => r.pending === true) };
            return { studentId: student._id, resultObj: mapped };
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
  }, [students, selectedClass, selectedTerm, refreshKey]);

  // Handle result modification
  const handleResultChange = (studentId, field, value) => {
    setEditResults(prev => {
      const prevStudent = prev[studentId] || {};
      // If it's a subject field (cat1, exam, grade, remark)
      if (prevStudent.subjects && prevStudent.subjects.includes(field)) {
        let newResult = { ...prevStudent[field], ...value };
        // Auto-calculate grade and remark if cat1 or exam changes
        const cat1 = Number(newResult.cat1 ?? '');
        const exam = Number(newResult.exam ?? '');
        const total = cat1 + exam;
        // Only auto-calculate if the field being changed is cat1 or exam
        if ('cat1' in value || 'exam' in value) {
          newResult.grade = getGrade(total);
          newResult.remark = getRemark(newResult.grade);
        }
        // --- Clear manual average if CAT or Exam is changed ---
        let newStudent = {
          ...prevStudent,
          [field]: newResult,
        };
        if ('cat1' in value || 'exam' in value) {
          newStudent.average = '';
        }
        return {
          ...prev,
          [studentId]: newStudent,
        };
      } else {
        // Meta/key field: value is a primitive
        return {
          ...prev,
          [studentId]: {
            ...prevStudent,
            [field]: value,
          }
        };
      }
    });
    setVerifiedStudents(prev => ({
      ...prev,
      [studentId]: 'pending'
    }));
  };
  const handleSaveChanges = async (studentId) => {
    const result = editResults[studentId];
    if (!result || !result.subjects || result.subjects.length === 0) {
      alert('No changes to save.');
      return;
    }
    // Save all subject results (but do NOT set reviewed/verified)
    for (const subject of result.subjects) {
      const subj = result[subject];
      if (subj && subj._id) {
        const updateUrl = `${API_BASE_URL}/api/results/update/${subj._id}`;
        const subjectPayload = {
          firstCatScore: Number(subj.cat1 ?? 0),
          examScore: Number(subj.exam ?? 0),
          maxScore: subj.maxScore ?? '',
          minScore: subj.minScore ?? '',
          grade: subj.grade ?? '',
          remark: subj.remark ?? '',
        };
        await fetch(updateUrl, {
          method: 'PUT',
          body: JSON.stringify(subjectPayload),
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    // Save "Overall" result (if present)
    if (result._overallId) {
      const overallFields = {};
      [
        'position', 'average',
        'handwriting', 'punctuality', 'initiative', 'obedience', 'honesty', 'neatness',
        'attentiveness', 'respect', 'attitude', 'creativity'
      ].forEach(field => {
        if (result[field] !== undefined) {
          overallFields[field] = result[field];
        }
      });
      overallFields.academicYear = "2025/2026";
      overallFields.nextTerm = "18/01/2026";
      // --- Set deans and rectors remark dynamically based on average ---
      const avg = Number(result.average ?? 0);
      overallFields.teacherComment = getDeansRemark(avg);
      overallFields.headTeacherRemark = getRectorsRemark(avg);
      await fetch(`${API_BASE_URL}/api/results/update/${result._overallId}`, {
        method: 'PUT',
        body: JSON.stringify(overallFields),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    alert('Changes saved!');
  };
  // Update handleRemoveSubject to support both individual and all-students removal
  const handleRemoveSubject = async (subject, forAll = true) => {
    if (forAll) {
      // --- REMOVE FOR ALL STUDENTS (existing logic, unchanged) ---
      const subjectResultIds = [];
      Object.keys(editResults).forEach(studentId => {
        const subjObj = editResults[studentId]?.[subject];
        if (subjObj && subjObj._id) {
          subjectResultIds.push(subjObj._id);
        }
      });

      setEditResults(prevResults => {
        const updatedResults = { ...prevResults };
        Object.keys(updatedResults).forEach(studentId => {
          if (updatedResults[studentId]) {
            Object.keys(updatedResults[studentId]).forEach(key => {
              if (key === subject || key.startsWith(`${subject}_`)) {
                delete updatedResults[studentId][key];
              }
            });
            if (Array.isArray(updatedResults[studentId].subjects)) {
              updatedResults[studentId].subjects = updatedResults[studentId].subjects.filter(s => s !== subject);
            }
          }
        });
        return updatedResults;
      });

      for (const resultId of subjectResultIds) {
        try {
          await fetch(`${API_BASE_URL}/api/results/delete/${resultId}`, {
            method: 'DELETE'
          });
        } catch (err) {
          // Optionally handle error
        }
      }
    } else {
      // --- REMOVE FOR INDIVIDUAL ONLY ---
      const studentId = viewingStudent;
      const subjObj = editResults[studentId]?.[subject];
      // 1. Update local state for just this student
      setEditResults(prevResults => {
        const updatedResults = { ...prevResults };
        if (updatedResults[studentId]) {
          Object.keys(updatedResults[studentId]).forEach(key => {
            if (key === subject || key.startsWith(`${subject}_`)) {
              delete updatedResults[studentId][key];
            }
          });
          if (Array.isArray(updatedResults[studentId].subjects)) {
            updatedResults[studentId].subjects = updatedResults[studentId].subjects.filter(s => s !== subject);
          }
        }
        return updatedResults;
      });
      // 2. Delete from backend for just this student
      if (subjObj && subjObj._id) {
        try {
          await fetch(`${API_BASE_URL}/api/results/delete/${subjObj._id}`, {
            method: 'DELETE'
          });
        } catch (err) {
          // Optionally handle error
        }
      }
    }
    setConfirmRemoveSubject(null); // close modal after removal
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

    // 1. Update only subjects currently in the tray
    const currentSubjects = editResults[studentId]?.subjects || [];
    const subjectUpdatePromises = currentSubjects.map(subject => {
      const subj = editResults[studentId][subject];
      if (subj && subj._id) {
        // Only send fields for subjects currently in the tray
        const subjectPayload = {
          firstCatScore: Number(subj.cat1 ?? 0),
          examScore: Number(subj.exam ?? 0),
          maxScore: subj.maxScore ?? '',
          minScore: subj.minScore ?? '',
          grade: subj.grade ?? '',
          remark: subj.remark ?? '',
        };
        return fetch(`${API_BASE_URL}/api/results/update/${subj._id}`, {
          method: 'PUT',
          body: JSON.stringify(subjectPayload),
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return Promise.resolve();
    });

    // 2. Update the "Overall" result (key ratings/meta fields/comments/header)
    const overallId = editResults[studentId]?._overallId;
    if (overallId) {
      const overallFields = {};
      [
        'position', 'average',
        'handwriting', 'punctuality', 'initiative', 'obedience', 'honesty', 'neatness',
        'attentiveness', 'respect', 'attitude', 'creativity'
      ].forEach(field => {
        if (editResults[studentId][field] !== undefined) {
          overallFields[field] = field === 'average'
            ? (
                editResults[studentId][field] !== undefined &&
                editResults[studentId][field] !== null &&
                editResults[studentId][field] !== ''
                  ? Number(editResults[studentId][field])
                  : (() => {
                      const subjectTotals = currentSubjects.map(subject => {
                        const subjObj = editResults[studentId]?.[subject];
                        const cat1 = Number(subjObj?.cat1 ?? 0);
                        const exam = Number(subjObj?.exam ?? 0);
                        return cat1 + exam;
                      });
                      let autoAverage =
                        subjectTotals.length > 0
                          ? (subjectTotals.reduce((a, b) => a + b, 0) / subjectTotals.length)
                          : 0;
                      if (autoAverage > 100) autoAverage = 100;
                      return Number(autoAverage.toFixed(1));
                    })()
            )
          : editResults[studentId][field];
        }
      });
      overallFields.academicYear = "2025/2026";
      overallFields.nextTerm = "18/01/2026";
      // --- Set deans and rectors remark dynamically based on average ---
      const avg = Number(overallFields.average ?? 0);
      overallFields.teacherComment = getDeansRemark(avg);
      overallFields.headTeacherRemark = getRectorsRemark(avg);

      await fetch(`${API_BASE_URL}/api/results/update/${overallId}`, {
        method: 'PUT',
        body: JSON.stringify(overallFields),
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      await Promise.all(subjectUpdatePromises);

      // 3. Now mark as reviewed
      const reviewUrl = `${API_BASE_URL}/api/results/review-student-all`;
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
        setVerifiedStudents(prev => ({
          ...prev,
          [studentId]: 'reviewed'
        }));
        setMessage('Result updated and marked as reviewed!');
        setTimeout(() => setMessage(''), 1500);
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
        }, 700);
        setReviewLoading(false);
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
    setClassVerificationLoading(true);
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
          setMessage(data.error || 'Verification failed. Please check the token and try again.');
          setClassVerificationLoading(false);
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
        setClassVerificationLoading(false);
      })
      .catch(() => {
        setMessage('Network error. Please try again.');
        setClassVerificationLoading(false);
      });
  };
// Helper to wrap edit actions with confirmation if verified
const confirmOrProceedEdit = (editAction) => {
  if (verifiedStudents[viewingStudent] === 'verified') {
    setPendingEditAction(() => editAction);
    setShowEditConfirmModal(true);
  } else {
    editAction();
  }
};

// Wrap handleResultChange for table and meta fields
const safeHandleResultChange = (studentId, field, value) => {
  confirmOrProceedEdit(() => handleResultChange(studentId, field, value));
};
  // Utility function for ObjectId validation
  const isValidObjectId = id => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);

  // --- Add these helper functions at the top, just like in the teacher portal ---
  function getGrade(score) {
    if (score >= 75 && score <= 100) return "A1";
    if (score >= 70 && score < 75) return "B2";
    if (score >= 65 && score < 70) return "B3";
    if (score >= 60 && score < 65) return "C4";
    if (score >= 55 && score < 60) return "C5";
    if (score >= 50 && score < 55) return "C6";
    if (score >= 45 && score < 50) return "D7";
    if (score >= 40 && score < 45) return "E8";
    return "F9";
  }
  function getRemark(grade) {
    if (grade === "A1") return "Excellent";
    if (grade === "B2" || grade === "B3") return "Very Good";
    if (grade === "C4" || grade === "C5" || grade === "C6") return "Good";
    if (grade === "D7" || grade === "E8") return "Pass";
    if (grade === "F9") return "Fail";
    return "";
  }
  // Add this helper function at the top (outside the component)
  function getRectorsRemark(average) {
    if (average >= 70) return "Excellent result, keep it up";
    if (average >= 65) return "Very good result";
    if (average >= 60) return "Good performance";
    if (average >= 50) return "Average result, work harder";
    return "Below average";
  }
  // Add this helper function at the top (outside the component)
  function getDeansRemark(average) {
    if (average >= 70) return "Exceptional result, sustain this excellence";
    if (average >= 65) return "High quality performance";
    if (average >= 60) return "Competent work";
    if (average >= 50) return "Middle-of-the road, strive for more";
    return "Not meeting the required benchmark";
  }

  // New function to handle reviewing all students
  const handleReviewAllStudents = async () => {
    setMessage('');
    setReviewLoading(true);
    if (!adminId) {
      setMessage('Admin ID not found. Please log in again.');
      setReviewLoading(false);
      return;
    }
    if (!selectedClass || !selectedTerm) {
      setMessage('Please select a class and term.');
      setReviewLoading(false);
      return;
    }

    // Check for incomplete students
    const incompleteStudents = [];
    for (const student of students) {
      const result = editResults[student._id];
      if (!result || !result.subjects || result.subjects.length === 0) {
        incompleteStudents.push(student.name);
        continue;
      }
      for (const subject of result.subjects) {
        const subj = result[subject];
        if (
          !subj ||
          subj.cat1 === '' || subj.cat1 === undefined ||
          subj.exam === '' || subj.exam === undefined
        ) {
          incompleteStudents.push(student.name);
          break;
        }
      }
    }
    if (incompleteStudents.length > 0) {
      setMessage(
        `Cannot review all. The following students have incomplete subject fields: ${incompleteStudents.join(', ')}`
      );
      setReviewLoading(false);
      return;
    }

    // Review all students
    try {
      for (const student of students) {
        await handleReviewStudent(student._id);
      }
      setMessage('All students reviewed!');
      setTimeout(() => setMessage(''), 1500);
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 700);
    } catch (err) {
      setMessage('An error occurred while reviewing all students.');
    }
    setReviewLoading(false);
  };

  const noResultsPushed = students.every(
    s => !editResults[s._id] || !editResults[s._id].subjects || editResults[s._id].subjects.length === 0
  );

  const allResultsPushedAndComplete = students.length > 0 && students.every(student => {
    const result = editResults[student._id];
    if (!result || !result.subjects || result.subjects.length === 0) return false;
    // All subject fields must have a value (including 0)
    return result.subjects.every(subject => {
      const subj = result[subject];
      return subj &&
        (subj.cat1 !== '' && subj.cat1 !== undefined && subj.cat1 !== null) &&
        (subj.exam !== '' && subj.exam !== undefined && subj.exam !== null);
    });
  });
  const incompleteStudents = students
    .filter(student => {
      const result = editResults[student._id];
      if (!result || !result.subjects || result.subjects.length === 0) return true;
      return result.subjects.some(subject => {
        const subj = result[subject];
        return !subj ||
          subj.cat1 === '' || subj.cat1 === undefined || subj.cat1 === null ||
          subj.exam === '' || subj.exam === undefined || subj.exam === null;
      });
    })
    .map(student => student.name);
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
        <div className="flex flex-col items-end mb-4">
          {incompleteStudents.length > 0 && (
            <div className="mb-2 text-warning font-semibold text-right">
              Incomplete results for: {incompleteStudents.join(', ')}
            </div>
          )}
          <button
            className="px-4 py-2 bg-info text-white rounded hover:bg-info/80 transition"
            onClick={handleReviewAllStudents}
            disabled={
              reviewLoading ||
              !allResultsPushedAndComplete ||
              (students.length > 0 &&
                students.every(s => verifiedStudents[s._id] === 'reviewed' || verifiedStudents[s._id] === 'verified'))
            }
          >
            {!allResultsPushedAndComplete
              ? 'All results must be pushed and complete'
              : reviewLoading
              ? 'Reviewing All...'
              : students.length > 0 && students.every(s => verifiedStudents[s._id] === 'verified')
              ? 'Verified'
              : students.length > 0 && students.every(s => verifiedStudents[s._id] === 'reviewed' || verifiedStudents[s._id] === 'verified')
              ? 'Reviewed'
              : 'Review for All'}
          </button>
        </div>
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
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground items-center">
                    <span><b>Name:</b> {students.find(s => s._id === viewingStudent)?.name || 'N/A'}</span>
                    <span><b>Class:</b> {classList.find(c => c.id === selectedClass)?.name || 'N/A'}</span>
                    <span><b>Term:</b> {selectedTerm ? selectedTerm.charAt(0).toUpperCase() + selectedTerm.slice(1) + ' Term' : 'N/A'}</span>
                    {/* --- Position Field --- */}
                    <span>
                      <b>Position:</b>{" "}
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-24 ml-2"
                        value={editResults[viewingStudent]?.position ?? ''}
                        onChange={e =>
                          setEditResults(prev => ({
                            ...prev,
                            [viewingStudent]: {
                              ...(prev[viewingStudent] || {}),
                              position: e.target.value
                            }
                          }))
                        }
                        placeholder="Position"
                        title="This is the position as pushed by the teacher. You can override it by typing."
                      />
                    </span>
                    {/* --- Average Field (moved here) --- */}
                    <span>
                      <b>Average:</b>{" "}
                      {(() => {
                        const manualAverage = editResults[viewingStudent]?.average;
                        const subjectTotals = editResults[viewingStudent]?.subjects?.map(subject => {
                          const subjObj = editResults[viewingStudent]?.[subject];
                          const cat1 = Number(subjObj?.cat1 || subjObj?.[`${subject}_cat1`] || 0);
                          const exam = Number(subjObj?.exam || subjObj?.[`${subject}_exam`] || 0);
                          return cat1 + exam;
                        }) || [];
                        let autoAverage =
                          subjectTotals.length > 0
                            ? (subjectTotals.reduce((a, b) => a + b, 0) / subjectTotals.length)
                            : '';
                        if (autoAverage !== '' && autoAverage > 100) autoAverage = 100;
                        autoAverage = autoAverage !== '' ? Number(autoAverage).toFixed(1) : '';
                        const displayAverage =
                          manualAverage !== undefined && manualAverage !== null && manualAverage !== ''
                            ? manualAverage
                            : autoAverage;
                        return (
                          <input
                            type="number"
                            step="0.1"
                            className="border rounded px-2 py-1 w-24 ml-2"
                            value={displayAverage}
                            onChange={e =>
                              handleResultChange(viewingStudent, 'average', e.target.value)
                            }
                            placeholder="Average"
                          />
                        );
                      })()}
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
                    <table className="min-w-full border border-border rounded mb-4">
                      <thead>
                        <tr>
                          <th className="px-2 py-2 border-r border-border text-center">Subject</th>
                          <th className="px-2 py-2 border-r border-border text-center">C.A.T (30%)</th>
                          <th className="px-2 py-2 border-r border-border text-center">Exam (70%)</th>
                          <th className="px-2 py-2 border-r border-border text-center">Total (100%)</th>
                          {/* Removed Max Score */}
                          {/* Removed Min Score */}
                          <th className="px-2 py-2 border-r border-border text-center">Grade</th>
                          <th className="px-2 py-2 text-center">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editResults[viewingStudent]?.subjects?.map(subject => {
                          const cat1 = Number(editResults[viewingStudent]?.[subject]?.cat1 ?? 0);
                          const exam = Number(editResults[viewingStudent]?.[subject]?.exam ?? 0);
                          const total = cat1 + exam;
                          const grade = editResults[viewingStudent]?.[subject]?.grade || '';
                          const remark = editResults[viewingStudent]?.[subject]?.remark || '';
                          return (
                            <tr key={subject}>
                              <td className="px-2 py-2 border-r border-border text-center">{subject}</td>
                              <td className="px-2 py-2 border-r border-border text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={editResults[viewingStudent]?.[subject]?.cat1 ?? ''}
                                  onChange={e => safeHandleResultChange(viewingStudent, subject, { ...editResults[viewingStudent][subject], cat1: e.target.value })}
                                  className="border rounded px-2 py-1 w-16 text-center"
                                />
                              </td>
                              <td className="px-2 py-2 border-r border-border text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="70"
                                  value={editResults[viewingStudent]?.[subject]?.exam ?? ''}
                                  onChange={e => safeHandleResultChange(viewingStudent, subject, { ...editResults[viewingStudent][subject], exam: e.target.value })}
                                  className="border rounded px-2 py-1 w-16 text-center"
                                />
                              </td>
                              <td className="px-2 py-2 border-r border-border text-center font-bold text-primary">{total}</td>
                              {/* Removed Max Score */}
                              {/* Removed Min Score */}
                              <td className="px-2 py-2 border-r border-border text-center">
                                <input
                                  type="text"
                                  value={
                                    editResults[viewingStudent]?.[subject]?.grade !== undefined && editResults[viewingStudent]?.[subject]?.grade !== ''
                                      ? editResults[viewingStudent]?.[subject]?.grade
                                      : getGrade(Number(editResults[viewingStudent]?.[subject]?.cat1 ?? 0) + Number(editResults[viewingStudent]?.[subject]?.exam ?? 0))
                                  }
                                  onChange={e => safeHandleResultChange(viewingStudent, subject, { ...editResults[viewingStudent][subject], grade: e.target.value })}
                                  className="border rounded px-2 py-1 w-16 text-center"
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <input
                                  type="text"
                                  value={
                                    editResults[viewingStudent]?.[subject]?.remark !== undefined && editResults[viewingStudent]?.[subject]?.remark !== ''
                                      ? editResults[viewingStudent]?.[subject]?.remark
                                      : getRemark(
                                          editResults[viewingStudent]?.[subject]?.grade !== undefined && editResults[viewingStudent]?.[subject]?.grade !== ''
                                            ? editResults[viewingStudent]?.[subject]?.grade
                                            : getGrade(Number(editResults[viewingStudent]?.[subject]?.cat1 ?? 0) + Number(editResults[viewingStudent]?.[subject]?.exam ?? 0))
                                      )
                                  }
                                  onChange={e => safeHandleResultChange(viewingStudent, subject, { ...editResults[viewingStudent][subject], remark: e.target.value })}
                                  className="border rounded px-2 py-1 w-24 text-center"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Subjects List */}
                    <div className="my-4">
                      <h3 className="font-bold text-md mb-2">Subjects</h3>
                      <div className="flex flex-wrap gap-2">
                        {editResults[viewingStudent].subjects?.map(subj => (
                          <span key={subj} className="px-2 py-1 bg-primary/10 border border-primary rounded text-primary text-xs font-semibold flex items-center">
                            {subj}
                            <button
                              type="button"
                              className="ml-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                verifiedStudents[viewingStudent] === 'verified'
                                  ? "Cannot remove subject after verification"
                                  : "Remove subject for all students"
                              }
                              onClick={() => setConfirmRemoveSubject(subj)}
                              disabled={verifiedStudents[viewingStudent] === 'verified'}
                            >
                              &times;
                            </button>
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
                                    onChange={e => safeHandleResultChange(viewingStudent, key, e.target.value)}
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
                        <textarea
                          className="border rounded px-2 py-1 w-full"
                          rows={2}
                          value={
                            (() => {
                              const avg = Number(editResults[viewingStudent]?.average ?? 0);
                              return getDeansRemark(avg);
                            })()
                          }
                          readOnly
                          disabled
                          placeholder="Deans Remark"
                        />
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
                        <textarea
                          className="border rounded px-2 py-1 w-full"
                          rows={2}
                          value={
                            (() => {
                              const avg = Number(editResults[viewingStudent]?.average ?? 0);
                              return getRectorsRemark(avg);
                            })()
                          }
                          readOnly
                          disabled
                          placeholder="Rectors Remark"
                        />
                      </div>
                    </div>

                    {/* Meta Fields Section */}
                    <div className="meta-fields-section grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div>
                        <label className="font-semibold">Academic Session:</label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          value="2025/2026"
                          readOnly
                          disabled
                          placeholder="Academic Session"
                        />
                      </div>
                      {/* --- REMOVED AVERAGE FIELD FROM HERE --- */}
                      <div>
                        <label className="font-semibold">Next Term Begins:</label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          value="18/01/2026"
                          readOnly
                          disabled
                          placeholder="Next Term Begins"
                        />
                      </div>
                    </div>

                    {/* Review Button for Individual Student */}
                    <div className="flex justify-end mt-6 gap-2">
                      <button
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition"
                        onClick={() => handleSaveChanges(viewingStudent)}
                        disabled={verifiedStudents[viewingStudent] === 'verified'}
                      >
                        Save Changes
                      </button>
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

                    {/* Verification Token Input for Individual Student */}
                    {verifiedStudents[viewingStudent] === 'reviewed' && (
                      <div className="flex flex-col sm:flex-row gap-2 items-center mt-6">
                        <input
                          type="text"
                          placeholder="Enter verification token"
                          value={studentTokenInput}
                          onChange={e => setStudentTokenInput(e.target.value)}
                          className="border border-border rounded px-2 py-1"
                        />
                        <button
                          className="px-4 py-2 bg-success text-white rounded hover:bg-success/80 transition"
                          onClick={async () => {
                            setStudentVerificationLoading(true);
                            // Call backend to verify this student's result
                            const overallId = editResults[viewingStudent]?._overallId;
                            const res = await fetch(`${API_BASE_URL}/api/results/verify-student`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                resultId: overallId,
                                adminId,
                                token: studentTokenInput
                              })
                            });
                            const data = await res.json();
                            if (res.ok && data.success) {
                              setVerifiedStudents(prev => ({
                                ...prev,
                                [viewingStudent]: 'verified'
                              }));
                              setStudentTokenInput('');
                            } else {
                              alert(data.error || 'Verification failed.');
                            }
                            setStudentVerificationLoading(false);
                          }}
                          disabled={!studentTokenInput || studentVerificationLoading}
                        >
                          {studentVerificationLoading ? 'Verifying...' : 'Verify Result'}
                        </button>
                      </div>
                    )}
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
                disabled={!tokenInput || classVerificationLoading}
              >
                {classVerificationLoading ? 'Verifying...' : 'Confirm Class Verification'}
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

      {/* Confirmation Modal for Subject Removal */}
      {confirmRemoveSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-lg mb-4">Remove Subject</h3>
            <p className="mb-4">
              Are you sure you want to <span className="font-semibold text-red-600">remove</span> the subject <br />
              <span className="font-bold text-primary">{confirmRemoveSubject}</span> <br />
              <span className="font-bold">?</span>
            </p>
            <div className="flex flex-col gap-2 mt-6">
              <button
                className="px-4 py-2 bg-danger text-white rounded hover:bg-danger/80 transition"
                onClick={() => setShowDeleteConfirmModal({ type: 'individual', subject: confirmRemoveSubject })}
              >
                Remove for This Student Only
              </button>
              <button
                className="px-4 py-2 bg-warning text-white rounded hover:bg-warning/80 transition"
                onClick={() => setShowDeleteConfirmModal({ type: 'all', subject: confirmRemoveSubject })}
              >
                Remove for All Students
              </button>
              <button
                className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
                onClick={() => setConfirmRemoveSubject(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Confirmation Modal for Individual or General Delete */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-lg mb-4">
              {showDeleteConfirmModal.type === 'individual'
                ? 'Confirm Individual Subject Removal'
                : 'Confirm General Subject Removal'}
            </h3>
            <p className="mb-4">
              Are you <span className="font-semibold text-red-600">sure</span> you want to{" "}
              <span className="font-bold">
                remove the subject <span className="text-primary">{showDeleteConfirmModal.subject}</span>
              </span>{" "}
              {showDeleteConfirmModal.type === 'individual'
                ? 'for this student only'
                : 'for all students'}
              ?
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                className={`px-4 py-2 ${showDeleteConfirmModal.type === 'individual' ? 'bg-danger' : 'bg-warning'} text-white rounded hover:opacity-90 transition`}
                onClick={async () => {
                  await handleRemoveSubject(
                    showDeleteConfirmModal.subject,
                    showDeleteConfirmModal.type === 'all'
                  );
                  setShowDeleteConfirmModal(null);
                  setConfirmRemoveSubject(null);
                }}
              >
                Yes, Remove
              </button>
              <button
                className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
                onClick={() => setShowDeleteConfirmModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Editing Verified Result */}
      {showEditConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-lg mb-4">Modify Verified Result?</h3>
            <p className="mb-4">
              This student's result is already <span className="text-success font-semibold">verified</span>.<br />
              Are you sure you want to modify it? This will set the result back to <span className="text-warning font-semibold">pending</span>.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                className="px-4 py-2 bg-danger text-white rounded hover:bg-danger/80 transition"
                onClick={() => {
                  setShowEditConfirmModal(false);
                  if (pendingEditAction) pendingEditAction();
                  setPendingEditAction(null);
                }}
              >
                Yes, Modify
              </button>
              <button
                className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
                onClick={() => {
                  setShowEditConfirmModal(false);
                  setPendingEditAction(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyResult;