import React, { useState, useEffect } from 'react';
import { TbFidgetSpinner } from "react-icons/tb";
import RoleBasedHeader from '../../../components/ui/RoleBasedHeader';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Modal from '../../../components/ui/Modal';

const terms = [
    { value: 'first', label: 'First Term' },
    { value: 'second', label: 'Second Term' },
    { value: 'third', label: 'Third Term' }
];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ResultPortal = () => {
    const [teacherData, setTeacherData] = useState(null);
    const [selectedTerm, setSelectedTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState(['Mathematics', 'English', 'Biology', 'Physics', 'Chemistry']);
    const [newSubject, setNewSubject] = useState('');
    const [results, setResults] = useState({});
    const [overall, setOverall] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [teacherResults, setTeacherResults] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isLoadingResults, setIsLoadingResults] = useState(false);
    const [manualOverall, setManualOverall] = useState({});
    const [caScores, setCaScores] = useState({});
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [resultsPushed, setResultsPushed] = useState({});
    const [showPushConfirm, setShowPushConfirm] = useState(false);
    const [pendingPushStudentId, setPendingPushStudentId] = useState(null);


    function buildSaveAllPayload(studentId) {
  // You may need to adjust these variable names if your state is different
  // This assumes you have access to results, caScores, overall, subjects, teacherData, selectedTerm
  // If you define this inside the component, you can access them directly

  // Example for inside the component:
  return {
    studentId,
    teacherId: teacherData?._id,
    className: teacherData?.className,
    term: selectedTerm,
    subjects,
    caScores: caScores[studentId] || {},
    results: results[studentId] || {},
    overall: overall[studentId] || {},
  };
}
    // 1. Load subjects from localStorage on mount (per class/term)
    useEffect(() => {
      const key = `resultPortal_subjects_${teacherData?.className}_${selectedTerm}`;
      const savedSubjects = localStorage.getItem(key);
      if (savedSubjects) {
        setSubjects(JSON.parse(savedSubjects));
      }
    }, [teacherData, selectedTerm]);

    // 2. Save subjects to localStorage whenever it changes
    useEffect(() => {
      if (teacherData?.className && selectedTerm) {
        const key = `resultPortal_subjects_${teacherData.className}_${selectedTerm}`;
        localStorage.setItem(key, JSON.stringify(subjects));
      }
    }, [subjects, teacherData, selectedTerm]);

    // 3. Load saved result data for selected student (including subjects)
    useEffect(() => {
      if (selectedStudent) {
        const key = `resultPortal_${teacherData?.className}_${selectedTerm}_${selectedStudent._id}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          setResults(prev => ({
            ...prev,
            [selectedStudent._id]: parsed.results || {},
          }));
          setCaScores(prev => ({
            ...prev,
            [selectedStudent._id]: parsed.caScores || {},
          }));
          setOverall(prev => ({
            ...prev,
            [selectedStudent._id]: parsed.overall || {},
          }));
          // Merge subjects from localStorage for this student
          if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
            setSubjects(prev => {
              const merged = Array.from(new Set([...prev, ...parsed.subjects]));
              return merged;
            });
          }
        }
      }
    }, [selectedStudent, teacherData, selectedTerm]);

    // 4. Save result data for selected student to localStorage (including subjects)
    useEffect(() => {
      if (selectedStudent) {
        localStorage.setItem(
          `resultPortal_${teacherData?.className}_${selectedTerm}_${selectedStudent._id}`,
          JSON.stringify({
            results: results[selectedStudent._id] || {},
            caScores: caScores[selectedStudent._id] || {},
            overall: overall[selectedStudent._id] || {},
            subjects,
          })
        );
      }
    }, [results, caScores, overall, subjects, selectedStudent, teacherData, selectedTerm]);

    // Get teacher data from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('teacherData');
        if (stored) setTeacherData(JSON.parse(stored));
    }, []);

    // Fetch all students registered under this class (not just those who took the exam)
    useEffect(() => {
        if (teacherData?.className && selectedTerm) {
            setIsLoadingStudents(true);
            fetch(`${API_BASE_URL}/api/user/class/${encodeURIComponent(teacherData.className)}/${encodeURIComponent(selectedTerm)}/students`, {
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => setStudents(Array.isArray(data) ? data : []))
                .catch(() => setStudents([]))
                .finally(() => setIsLoadingStudents(false));
        }
    }, [teacherData, selectedTerm]);

    // Fetch teacher's results for the class and term
    useEffect(() => {
        if (teacherData?.className && selectedTerm) {
            setIsLoadingResults(true);
            fetch(`${API_BASE_URL}/api/results/class/${encodeURIComponent(teacherData.className)}/${encodeURIComponent(selectedTerm)}`, {
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    setTeacherResults(Array.isArray(data) ? data : []);
                    // Merge previous state to preserve input
                    const newResults = { ...results };
                    const newCaScores = { ...caScores };
                    const newOverall = { ...overall };
                    students.forEach(student => {
                      newResults[student._id] = { ...(results[student._id] || {}) };
                      newCaScores[student._id] = { ...(caScores[student._id] || {}) };
                      subjects.forEach(subject => {
                        // Find all result objects for this student/subject
                        const foundResults = data.filter(
                          r => String(r.studentId) === String(student._id) && r.subject === subject
                        );
                        if (foundResults.length > 0) {
                          // Set all fields from backend for this subject
                          const r = foundResults[0];
                          [
                            '_project', '_cat1', '_cat2', '_exam', '_maxScore', '_minScore', '_grade', '_remark'
                          ].forEach(suffix => {
                            if (r[subject + suffix] !== undefined) {
                              newResults[student._id][subject + suffix] = r[subject + suffix];
                            }
                          });
                          // Also set score if present
                          if (r.score !== undefined) {
                            newResults[student._id][subject] = r.score;
                          }
                        }
                        // C/A scores
                        const foundCA = data.find(
                          r => String(r.studentId) === String(student._id) && r.subject === `${subject} C/A`
                        );
                        if (foundCA) {
                          newCaScores[student._id][subject] = foundCA.score;
                        }
                      });
                      // Overall
                      const foundOverall = data.find(
                        r => String(r.studentId) === String(student._id) && r.subject === 'Overall'
                      );
                      if (foundOverall) {
                        newOverall[student._id] = {
                          ...(overall[student._id] || {}),
                          overallScore: foundOverall.score,
                          position: foundOverall.remarks?.replace('Position:', '').trim() || ''
                        };
                      }
                    });
                    setResults(newResults);
                    setCaScores(newCaScores);
                    setOverall(newOverall);
                })
                .catch(() => {
                    setTeacherResults([]);
                    // Do NOT reset results, caScores, or overall here!
                })
                .finally(() => setIsLoadingResults(false));
        }
    }, [teacherData, selectedTerm, students, subjects]);

    // Map fetched results to local state
    useEffect(() => {
        if (teacherResults.length && students.length && subjects.length) {
            // Merge previous state to preserve input
            const newResults = { ...results };
            const newCaScores = { ...caScores };
            students.forEach(student => {
                newResults[student._id] = { ...(results[student._id] || {}) };
                newCaScores[student._id] = { ...(caScores[student._id] || {}) };
                subjects.forEach(subject => {
                    // Only update if found in teacherResults, otherwise preserve previous value
                    const foundExam = teacherResults.find(
                        r => String(r.studentId) === String(student._id) && r.subject === subject
                    );
                    if (foundExam) {
                        newResults[student._id][subject] = foundExam.score;
                    }
                    const foundCA = teacherResults.find(
                        r => r.studentId?.toString() === student._id && r.subject === `${subject} C/A`
                    );
                    if (foundCA) {
                        newCaScores[student._id][subject] = foundCA.score;
                    }
                });
            });
            setResults(newResults);
            setCaScores(newCaScores);

            // Merge overall state
            const newOverall = { ...overall };
            students.forEach(student => {
                const found = teacherResults.find(
                    r => r.studentId?.toString() === student._id && r.subject === 'Overall'
                );
                if (found) {
                    newOverall[student._id] = {
                        ...(overall[student._id] || {}),
                        overallScore: found.score,
                        position: found.remarks?.replace('Position:', '').trim() || ''
                    };
                }
            });
            setOverall(newOverall);
        }
    }, [teacherResults, students, subjects]);

    // --- ADDED: Track pushed status for each student ---
    useEffect(() => {
      if (teacherResults.length && students.length) {
        const pushedStatus = {};
        students.forEach(student => {
          // Only consider results with pending: false
          const hasPushed = teacherResults
            .filter(r =>
              String(r.studentId) === String(student._id) &&
              r.className === teacherData.className &&
              r.term === selectedTerm &&
              r.pending === false // Only pushed results
            ).length > 0;
          pushedStatus[student._id] = hasPushed;
        });
        setResultsPushed(pushedStatus);
      }
    }, [teacherResults, students, teacherData, selectedTerm]);
    // --- END ADDED ---

    // --- ADDED: Track verified status for each student ---
    useEffect(() => {
      if (teacherResults.length && students.length) {
        const verifiedStatus = {};
        students.forEach(student => {
          // Check if any result for this student is verified by admin
          const isVerified = teacherResults.some(
            r => String(r.studentId) === String(student._id) && r.verified === true && r.pending === false
          );
          verifiedStatus[student._id] = isVerified;
        });
        setResultsPushed(prev => {
          // If already pushed, keep true, but if verified, force true (read-only)
          const updated = { ...prev };
          Object.keys(verifiedStatus).forEach(id => {
            if (verifiedStatus[id]) updated[id] = true;
          });
          return updated;
        });
      }
    }, [teacherResults, students]);

    function isSubjectFilled(studentId, subject) {
  const subjectFields = [
    `${subject}_project`,
    `${subject}_cat1`,
    `${subject}_cat2`,
    `${subject}_exam`,
    `${subject}_maxScore`,
    `${subject}_minScore`,
    `${subject}_grade`,
    `${subject}_remark`
  ];
  return subjectFields.some(
    field => results?.[studentId]?.[field] !== undefined && results?.[studentId]?.[field] !== ''
  );
}
    // --- END ADDED ---

    // Automatically update overall score and position when subject scores change, unless manually edited
    useEffect(() => {
        if (students.length && subjects.length) {
            const newOverall = { ...overall };
            // Calculate overall scores for all students
            const scoresArr = students.map(student => {
                const studentId = student._id;
                // Sum C/A and Exam for each subject
                const subjectScores = subjects.map(subject => {
                    const ca = Number(caScores?.[studentId]?.[subject] || 0);
                    const exam = Number(results?.[studentId]?.[subject] || 0);
                    let total = ca + exam;
                    if (total < 0) total = 0;
                    if (total > 100) total = 100;
                    return total;
                });
                const autoScore = subjectScores.length
                    ? Math.round(subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length)
                    : 0;
                return {
                    studentId,
                    autoScore,
                };
            });
            // Sort by overall score descending for position
            const sorted = [...scoresArr].sort((a, b) => b.autoScore - a.autoScore);
            // Assign positions (1st, 2nd, 3rd, 4th, ...)
            const positionMap = {};
            let lastScore = null;
            let lastPosition = 0;
            let actualPosition = 1;
            sorted.forEach((item, idx) => {
                if (lastScore !== null && item.autoScore === lastScore) {
                    positionMap[item.studentId] = lastPosition; // Same score, same position
                } else {
                    positionMap[item.studentId] = actualPosition;
                    lastScore = item.autoScore;
                    lastPosition = actualPosition;
                }
                actualPosition++;
            });
            // Update overall state
            students.forEach(student => {
                const studentId = student._id;
                const autoScore = scoresArr.find(s => s.studentId === studentId)?.autoScore || 0;
                const autoPosition = positionMap[studentId];
                // Only update if not manually edited
                if (!manualOverall[studentId]) {
                    newOverall[studentId] = {
                        ...(newOverall[studentId] || {}),
                        overallScore: autoScore,
                        position: autoPosition ? `${autoPosition}${autoPosition === 1 ? 'st' : autoPosition === 2 ? 'nd' : autoPosition === 3 ? 'rd' : 'th'}` : ''
                    };
                }
            });
            setOverall(newOverall);
        }
        // eslint-disable-next-line
    }, [results, caScores, students, subjects]);

    // Add new subject to tray
    const handleAddSubject = () => {
  const subject = newSubject.trim();
  if (subject && !subjects.includes(subject)) {
    setSubjects(prevSubjects => [...prevSubjects, subject]);
    setNewSubject('');
    setResults(prevResults => {
      if (!students || !students.length) return prevResults;
      const updatedResults = { ...prevResults };
      students.forEach(student => {
        updatedResults[student._id] = { ...(prevResults[student._id] || {}) };
        // Initialize all expected fields for the new subject
        [
          `${subject}_project`,
          `${subject}_cat1`,
          `${subject}_cat2`,
          `${subject}_exam`,
          `${subject}_maxScore`,
          `${subject}_minScore`,
          `${subject}_grade`,
          `${subject}_remark`
        ].forEach(field => {
          if (!(field in updatedResults[student._id])) {
            updatedResults[student._id][field] = '';
          }
        });
      });
      return updatedResults;
    });
    setCaScores(prevCaScores => {
      if (!students || !students.length) return prevCaScores;
      const updatedCaScores = { ...prevCaScores };
      students.forEach(student => {
        updatedCaScores[student._id] = { ...(prevCaScores[student._id] || {}) };
        if (!(subject in updatedCaScores[student._id])) {
          updatedCaScores[student._id][subject] = '';
        }
      });
      return updatedCaScores;
    });
  }
};

    // Remove subject from tray
    const handleRemoveSubject = (subject) => {
        setSubjects(subjects.filter(s => s !== subject));
    };

    const keyRatingFields = [
      'handwriting', 'punctuality', 'initiative', 'obedience', 'honesty',
      'neatness', 'attentiveness', 'respect', 'attitude', 'creativity'
    ];

    // Handle result input change
    const handleResultChange = (studentId, field, value) => {
      setResults(prev => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [field]: keyRatingFields.includes(field) && value !== '' ? Number(value) : value
        }
      }));
    };

    // Handle overall score and position change (manual edit)
    const handleOverallChange = (studentId, field, value) => {
        setOverall(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [field]: value
            }
        }));
        if (field === 'overallScore') {
            setManualOverall(prev => ({ ...prev, [studentId]: true }));
        }
    };

    // Submit results for all students
    const handleSubmitResults = async () => {
        setIsSubmitting(true);
        setSuccessMsg('');
        setErrorMsg('');
        let allSuccess = true;
        let failedStudents = [];
        let emptySubjects = [];

        try {
            for (const student of students) {
                let studentSuccess = true;
                for (const subject of subjects) {
                    const score = results?.[student._id]?.[subject];
                    if (score !== undefined && score !== '') {
                        const res = await fetch(`${API_BASE_URL}/api/results/set`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                studentId: student._id,
                                teacherId: teacherData._id,
                                className: teacherData.className,
                                term: selectedTerm,
                                subject,
                                score: Number(score),
                                remarks: ''
                            })
                        });
                        if (!res.ok) {
                            studentSuccess = false;
                            allSuccess = false;
                        }
                    }
                    // Push C/A score (moved inside subject loop)
                    const caScore = caScores?.[student._id]?.[subject];
                    if (caScore !== undefined && caScore !== '') {
                        await fetch(`${API_BASE_URL}/api/results/set`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                studentId: student._id,
                                teacherId: teacherData._id,
                                className: teacherData.className,
                                term: selectedTerm,
                                subject: `${subject} C/A`,
                                score: Number(caScore),
                                remarks: ''
                            })
                        });
                    }
                }
                // Save overall score and position
                const overallScore = overall?.[student._id]?.overallScore;
                const position = overall?.[student._id]?.position;
                if (overallScore || position) {
                    const res = await fetch(`${API_BASE_URL}/api/results/set`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentId: student._id,
                            teacherId: teacherData._id,
                            className: teacherData.className,
                            term: selectedTerm,
                            subject: 'Overall',
                            score: Number(overallScore) || 0,
                            remarks: `Position: ${position || ''}`
                        })
                    });
                    if (!res.ok) {
                        studentSuccess = false;
                        allSuccess = false;
                    }
                }
                if (!studentSuccess) {
                    failedStudents.push(student.name || student._id);
                }
            }
            if (emptySubjects.length > 0) {
              setErrorMsg(`Please enter at least one field for: ${emptySubjects.join(', ')} before saving/pushing.`);
              setIsSubmitting(false);
              return;
            }
            if (allSuccess) {
                setSuccessMsg('Results have been successfully pushed to students.');
            } else {
                setErrorMsg(`Failed to push results for: ${failedStudents.join(', ')}. Please try again.`);
            }
        } catch (err) {
            setErrorMsg('Failed to push results. Please try again.');
        }
        setIsSubmitting(false);
    };

    // Push individual student result
    const handlePushIndividualResult = async (studentId) => {
  if (resultsPushed[studentId]) return; // Prevent double push
  setIsSubmitting(true);
  setSuccessMsg('');
  setErrorMsg('');
  let success = true;
  try {
    for (const subject of subjects) {
      const score = results?.[studentId]?.[subject];
      if (score !== undefined && score !== '') {
        const res = await fetch(`${API_BASE_URL}/api/results/set`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            teacherId: teacherData._id,
            className: teacherData.className,
            term: selectedTerm,
            subject,
            score: Number(score),
            remarks: '',
            isPush: true
          })
        });
        if (!res.ok) success = false;
      }
      const caScore = caScores?.[studentId]?.[subject];
      if (caScore !== undefined && caScore !== '') {
        await fetch(`${API_BASE_URL}/api/results/set`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            teacherId: teacherData._id,
            className: teacherData.className,
            term: selectedTerm,
            subject: `${subject} C/A`,
            score: Number(caScore),
            remarks: '',
            isPush: true
          })
        });
      }
    }
    const overallScore = overall?.[studentId]?.overallScore;
    const position = overall?.[studentId]?.position;
    if (overallScore || position) {
      const res = await fetch(`${API_BASE_URL}/api/results/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          teacherId: teacherData._id,
          className: teacherData.className,
          term: selectedTerm,
          subject: 'Overall',
          score: Number(overallScore) || 0,
          remarks: `Position: ${position || ''}`,
          isPush: true
        })
      });
      if (!res.ok) {
        success = false;
      }
    }
    if (success) {
      setResultsPushed(prev => ({ ...prev, [studentId]: true }));
      setSuccessMsg('Student result has been successfully pushed.');
      setIsLoadingResults(true); // Show spinner while fetching
      fetch(`${API_BASE_URL}/api/results/class/${encodeURIComponent(teacherData.className)}/${encodeURIComponent(selectedTerm)}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setTeacherResults(Array.isArray(data) ? data : []);
        })
        .finally(() => setIsLoadingResults(false));

      // --- ADD THIS: Re-fetch pushed status for the student ---
      fetch(`${API_BASE_URL}/api/results/student/${studentId}/pushed?className=${encodeURIComponent(teacherData.className)}&term=${encodeURIComponent(selectedTerm)}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(pushedResults => {
          setResultsPushed(prev => ({
            ...prev,
            [studentId]: Array.isArray(pushedResults) && pushedResults.length > 0
          }));
        });
      // --- END ADD ---
    } else {
      setErrorMsg('Failed to update student result. Please try again.');
    }
  } catch (err) {
    setErrorMsg('Failed to update student result. Please try again.');
  }
  setIsSubmitting(false);
  setShowPushConfirm(false);
  setPendingPushStudentId(null);
};

    // Load saved result data for selected student
    useEffect(() => {
      if (selectedStudent) {
        const key = `resultPortal_${teacherData?.className}_${selectedTerm}_${selectedStudent._id}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          setResults(prev => ({
            ...prev,
            [selectedStudent._id]: parsed.results || {},
          }));
          setCaScores(prev => ({
            ...prev,
            [selectedStudent._id]: parsed.caScores || {},
          }));
          setOverall(prev => ({
            ...prev,
            [selectedStudent._id]: parsed.overall || {},
          }));
        }
      }
      // Optionally, clear on class/term change
    }, [selectedStudent, teacherData, selectedTerm]);

    // Save result data for selected student to localStorage
    useEffect(() => {
      if (selectedStudent) {
        localStorage.setItem(
          `resultPortal_${teacherData?.className}_${selectedTerm}_${selectedStudent._id}`,
          JSON.stringify({
            results: results[selectedStudent._id] || {},
            caScores: caScores[selectedStudent._id] || {},
            overall: overall[selectedStudent._id] || {},
            subjects,
          })
        );
      }
    }, [results, caScores, overall, subjects, selectedStudent, teacherData, selectedTerm]);

    // Autosave result data for selected student to backend (debounced)
    useEffect(() => {
      if (selectedStudent) {
        const timeout = setTimeout(() => {
          const payload = {
            studentId: selectedStudent._id,
            teacherId: teacherData?._id,
            className: teacherData?.className,
            term: selectedTerm,
            subjects,
            caScores: caScores[selectedStudent._id] || {},
            ...results[selectedStudent._id],
            ...overall[selectedStudent._id],
          };
          // Only autosave if there is some data to save
          if (
            Object.keys(results[selectedStudent._id] || {}).length > 0 ||
            Object.keys(caScores[selectedStudent._id] || {}).length > 0 ||
            Object.keys(overall[selectedStudent._id] || {}).length > 0
          ) {
            fetch(`${API_BASE_URL}/api/results/save-all`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            // DO NOT setResultsPushed here!
          }
        }, 17000); // 17 seconds debounce

        return () => clearTimeout(timeout);
      }
    }, [results, caScores, overall, subjects, selectedStudent, teacherData, selectedTerm]);

    // Term selection before entering main page
    if (!selectedTerm) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="bg-card border border-border rounded-xl shadow-lg p-8 w-full max-w-md text-center">
                    <h2 className="font-heading text-2xl font-bold text-primary mb-4">Select Term</h2>
                    <select
                        className="w-full border rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring"
                        value={selectedTerm}
                        onChange={e => setSelectedTerm(e.target.value)}
                    >
                        <option value="">Choose a term</option>
                        {terms.map(term => (
                            <option key={term.value} value={term.value}>{term.label}</option>
                        ))}
                    </select>
                    <Button
                        variant="default"
                        disabled={!selectedTerm}
                        onClick={() => {}}
                        className="w-full"
                    >
                        <Icon name="ArrowRight" size={16} className="mr-2" />
                        Proceed
                    </Button>
                </div>
            </div>
        );
    }

    // If a student is selected, show the result entry page for that student
    if (selectedStudent) {
        // Only set read-only if result has been pushed (not after save)
        const isReadOnly = resultsPushed[selectedStudent._id] === true;

        return (
            <main className="pt-20 pb-10 bg-background min-h-screen">
          <div className="max-w-3xl mx-auto px-2 sm:px-4">
            <Button variant="outline" onClick={() => setSelectedStudent(null)} className="mb-4">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Student List
            </Button>
            <h2 className="font-heading text-2xl font-bold text-primary mb-2">
              Enter Result for {selectedStudent.name}
            </h2>
            <div className="bg-card border border-border rounded-xl shadow-lg p-6">
              {/* Feedback message area */}
              {(successMsg || errorMsg) && (
                <div
                  className={`mb-4 px-4 py-2 rounded-lg font-medium text-center transition-all ${
                    successMsg
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}
                >
                  {successMsg || errorMsg}
                  <button
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setSuccessMsg('');
                      setErrorMsg('');
                    }}
                    aria-label="Dismiss"
                  >
                    &times;
                  </button>
                </div>
              )}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!isReadOnly) handlePushIndividualResult(selectedStudent._id);
                }}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse mb-6">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Subject</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Project (10%)</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">1st C.A.T (20%)</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">2nd C.A.T (20%)</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Exam (50%)</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Total (100%)</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Max Score</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Min Score</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Grade</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map(subject => {
                        // Calculate total automatically
                        const project = Number(results?.[selectedStudent._id]?.[`${subject}_project`] || 0);
                        const cat1 = Number(results?.[selectedStudent._id]?.[`${subject}_cat1`] || 0);
                        const cat2 = Number(results?.[selectedStudent._id]?.[`${subject}_cat2`] || 0);
                        const exam = Number(results?.[selectedStudent._id]?.[`${subject}_exam`] || 0);
                        const total = project + cat1 + cat2 + exam;

                        return (
                          <tr key={subject}>
                            <td className="px-2 py-2">{subject}</td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                className="w-16 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_project`] || ''}
                                onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, `${subject}_project`, e.target.value)}
                                placeholder="Project"
                                readOnly={isReadOnly}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                className="w-16 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_cat1`] || ''}
                                onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, `${subject}_cat1`, e.target.value)}
                                placeholder="1st C.A.T"
                                readOnly={isReadOnly}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                className="w-16 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_cat2`] || ''}
                                onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, `${subject}_cat2`, e.target.value)}
                                placeholder="2nd C.A.T"
                                readOnly={isReadOnly}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                max="50"
                                className="w-16 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_exam`] || ''}
                                onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, `${subject}_exam`, e.target.value)}
                                placeholder="Exam"
                                readOnly={isReadOnly}
                              />
                            </td>
                            <td className="px-2 py-2 font-bold text-primary">
                              {total}
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-16 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_maxScore`] || ''}
                                onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, `${subject}_maxScore`, e.target.value)}
                                placeholder="Max"
                                readOnly={isReadOnly}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-16 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_minScore`] || ''}
                                onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, `${subject}_minScore`, e.target.value)}
                                placeholder="Min"
                                readOnly={isReadOnly}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                className="w-16 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_grade`] || ''}
                                onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, `${subject}_grade`, e.target.value)}
                                placeholder="Grade"
                                readOnly={isReadOnly}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                className="w-24 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_remark`] || ''}
                                onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, `${subject}_remark`, e.target.value)}
                                placeholder="Remark"
                                readOnly={isReadOnly}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Subject Tray (Add/Remove Subjects) */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Subjects</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {subjects.map(subject => (
                      <span key={subject} className="flex items-center bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm font-medium">
                        {subject}
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveSubject(subject)}
                          title="Remove subject"
                          disabled={isReadOnly} // <-- Disable remove button
                          style={isReadOnly ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-40"
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      placeholder="Add subject"
                      disabled={isReadOnly} // <-- Disable input
                    />
                    <Button
                      variant="default"
                      type="button"
                      onClick={handleAddSubject}
                      disabled={!newSubject.trim() || isReadOnly} // <-- Disable add button
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Key Rating Section - Responsive & Professional */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Key Rating</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {[
                      'handwriting', 'punctuality', 'initiative', 'obedience', 'honesty',
                      'neatness', 'attentiveness', 'respect', 'attitude', 'creativity'
                    ].map(key => (
                      <div key={key} className="flex flex-col items-start bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <label className="text-sm font-medium capitalize mb-1">{key}</label>
                        <select
                          className="border rounded px-2 py-1 w-full"
                          value={results?.[selectedStudent._id]?.[key] || ''}
                          onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, key, e.target.value)}
                          disabled={isReadOnly} // <-- add this
                        >
                          <option value="">Not marked</option>
                          <option value="5">5-Excellent</option>
                          <option value="4">4-Very Good</option>
                          <option value="3">3-Satisfactory</option>
                          <option value="2">2-Poor</option>
                          <option value="1">1-Very Poor</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                    <span>5-EXCELLENT</span>
                    <span>4-VERY GOOD</span>
                    <span>3-SATISFACTORY</span>
                    <span>2-POOR</span>
                    <span>1-VERY POOR</span>
                  </div>
                </div>

                {/* Teacher's Comment, Signature, Head Teacher's Remark */}
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="font-semibold">Deans Remark:</label>
                        <textarea
                            className="border rounded px-2 py-1 w-full"
                            rows={2}
                            value={results?.[selectedStudent._id]?.teacherComment || ''}
                            onChange={e => handleResultChange(selectedStudent._id, 'teacherComment', e.target.value)}
                            placeholder="Deans Remark"
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Signature & Date:</label>
                        <input
                            type="text"
                            className="border rounded px-2 py-1 w-full"
                            value={results?.[selectedStudent._id]?.signatureDate || ''}
                            onChange={e => handleResultChange(selectedStudent._id, 'signatureDate', e.target.value)}
                            placeholder="Signature & Date"
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Rectors Remark:</label>
                        <textarea
                            className="border rounded px-2 py-1 w-full"
                            rows={2}
                            value={results?.[selectedStudent._id]?.headTeacherRemark || ''}
                            onChange={e => handleResultChange(selectedStudent._id, 'headTeacherRemark', e.target.value)}
                            placeholder="Rectors Remark"
                            readOnly={isReadOnly}
                        />
                    </div>
                </div>
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold">Academic Season:</label>
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-full"
                      value={results?.[selectedStudent._id]?.academicYear || ''}
                      onChange={e => handleResultChange(selectedStudent._id, 'academicYear', e.target.value)}
                      placeholder="Academic Season"
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">No. of Times School Opened:</label>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full"
                      value={results?.[selectedStudent._id]?.schoolOpened || ''}
                      onChange={e => handleResultChange(selectedStudent._id, 'schoolOpened', e.target.value)}
                      placeholder="School Opened"
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">No. of Time Present:</label>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full"
                      value={results?.[selectedStudent._id]?.present || ''}
                      onChange={e => handleResultChange(selectedStudent._id, 'present', e.target.value)}
                      placeholder="Present"
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">No. of Time Absent:</label>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full"
                      value={results?.[selectedStudent._id]?.absent || ''}
                      onChange={e => handleResultChange(selectedStudent._id, 'absent', e.target.value)}
                      placeholder="Absent"
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Total Score:</label>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full"
                      value={results?.[selectedStudent._id]?.totalScore || ''}
                      onChange={e => handleResultChange(selectedStudent._id, 'totalScore', e.target.value)}
                      placeholder="Total Score"
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Project Defence:</label>
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-full"
                      value={results?.[selectedStudent._id]?.projectDefence || ''}
                      onChange={e => handleResultChange(selectedStudent._id, 'projectDefence', e.target.value)}
                      placeholder="Project Defence"
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Over-all Score:</label>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full"
                      value={results?.[selectedStudent._id]?.overallScore || ''}
                      onChange={e => handleResultChange(selectedStudent._id, 'overallScore', e.target.value)}
                      placeholder="Over-all Score"
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Average:</label>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full"
                      value={results?.[selectedStudent._id]?.average || ''}
                      onChange={e => handleResultChange(selectedStudent._id, 'average', e.target.value)}
                      placeholder="Average"
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Next Term Begins:</label>
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-full"
                      value={results?.[selectedStudent._id]?.nextTerm || ''}
                      onChange={e => handleResultChange(selectedStudent._id, 'nextTerm', e.target.value)}
                      placeholder="Next Term Begins"
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                    {/* 2. In your Save button handler, replace the payload logic with this: */}
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={isSubmitting}
                      className="w-full"
                      onClick={async () => {
                        setSuccessMsg('');
                        setErrorMsg('');
                        setIsSubmitting(true);

                        // Use the new payload builder here:
                        const payload = buildSaveAllPayload(selectedStudent._id);

                        try {
                          const res = await fetch(`${API_BASE_URL}/api/results/save-all`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                          });
                          const data = await res.json();
                          if (data.success) {
                            setSuccessMsg('Saved!');
                          } else {
                            setErrorMsg('Failed to save result. Please try again.');
                          }
                        } catch (err) {
                          setErrorMsg('Failed to save result. Please try again.');
                        }
                        setIsSubmitting(false);
                      }}
                    >
                      <Icon name="Save" size={16} className="mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="primary"
                      type="button"
                      disabled={isSubmitting || isReadOnly || resultsPushed[selectedStudent._id]}
                      className="w-full"
                      onClick={() => {
                        setPendingPushStudentId(selectedStudent._id);
                        setShowPushConfirm(true);
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <TbFidgetSpinner className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Icon name="Send" size={16} className="mr-2" />
                          {resultsPushed[selectedStudent._id] ? "Already Pushed" : "Save & Push Result"}
                        </>
                      )}
                    </Button>
                    {isReadOnly && (
                      <div className="mt-4 text-warning text-center font-semibold">
                        Results have been submitted for admin verification.<br />
                        You cannot modify again.
                      </div>
                    )}
                  </div>
              </form>
              {/* Move the modal here, inside the result setter */}
              {showPushConfirm && (
                <Modal
                  isOpen={showPushConfirm}
                  onClose={() => setShowPushConfirm(false)}
                  title="Confirm Push"
                >
                  <div>
                    <p>Are you sure you want to push this student's result? This will submit the result for admin verification and make it read-only.</p>
                    <div className="flex gap-4 mt-4">
                      <Button
                        variant="primary"
                        onClick={() => handlePushIndividualResult(pendingPushStudentId)}
                        disabled={isSubmitting}
                      >
                        Yes, Push Result
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setShowPushConfirm(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
          </div>
        </main>
    );
    }

    // Otherwise, show the student list
    return (
        <>
            <RoleBasedHeader
                userRole="teacher"
                userName={teacherData?.name || 'Teacher'}
                isCollapsed={false}
            />
            <main className="pt-20 pb-10 bg-background min-h-screen">
                <div className="max-w-5xl mx-auto px-2 sm:px-4">
                    <div className="mb-8">
                        <h1 className="font-heading text-3xl font-bold text-primary mb-2">
                            Result Portal - {terms.find(t => t.value === selectedTerm)?.label}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Click a student to enter their result.
                        </p>
                    </div>
                    {isLoadingStudents ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <TbFidgetSpinner className="animate-spin text-5xl text-primary mb-2" />
                            <span className="text-primary font-medium">Loading students...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {students.map(student => (
                                <div
                                    key={student._id}
                                    className="bg-card border border-border rounded-lg shadow p-4 flex flex-col items-center cursor-pointer hover:bg-primary/10 transition"
                                    onClick={() => setSelectedStudent(student)}
                                >
                                    <span className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-white border-2 border-primary shadow mb-2">
                                        {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                                    </span>
                                    <span className="font-body font-medium text-foreground">{student.name}</span>
                                    <span className="text-xs text-muted-foreground">{student.className}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            {/* Feedback message area for student list */}
            {(successMsg || errorMsg) && (
              <div
                className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg font-medium text-center shadow-lg z-50 transition-all ${
                  successMsg
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}
                style={{ minWidth: '280px', maxWidth: '90vw' }}
              >
                {successMsg || errorMsg}
                <button
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setSuccessMsg('');
                    setErrorMsg('');
                  }}
                  aria-label="Dismiss"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Confirmation Modal */}
            {showPushConfirm && (
              <Modal
                isOpen={showPushConfirm}
                onClose={() => setShowPushConfirm(false)}
                title="Confirm Push"
              >
                <div>
                  <p>Are you sure you want to push this student's result? This will submit the result for admin verification and make it read-only.</p>
                  <div className="flex gap-4 mt-4">
                    <Button
                      variant="primary"
                      onClick={() => handlePushIndividualResult(pendingPushStudentId)}
                      disabled={isSubmitting}
                    >
                      Yes, Push Result
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowPushConfirm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Modal>
            )}
        </>
    );
};

export default ResultPortal;