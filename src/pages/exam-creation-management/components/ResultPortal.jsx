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
const ResultPortal = () => {
    const [teacherData, setTeacherData] = useState(null);
    const [selectedTerm, setSelectedTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState(() => {
  const className = (typeof teacherData?.className === 'string' ? teacherData.className.toLowerCase() : '');
  if (className === 'ss3a') {
    return [
      'Maths',
      'Biology',
      'Geography',
      'Chemistry',
      'Livestock Management',
      'Computer',
      'CRS',
      'Igbo'
    ];
  }
  if (className === 'ss3b') {
    return [
      'Maths',
      'Lit-in-Eng',
      'Igbo',
      'Live Stock  Management',
      'CRS',
      'Computer',
      'Government'
    ];
  }
  if (className === 'ss2a') {
    return [
      'Maths',
      'CRS',
      'Igbo',
      'Latin',
      'French',
      'Physics',
      'Chemistry',
      'Biology',
      'Geography',
      'Computer'
    ];
  }
  if (className === 'ss2b') {
    return [
      'Maths',
      'CRS',
      'Igbo',
      'French',
      'Latin',
      'Computer',
      'Lit-in-Eng',
      'Government',
      'History',
      'Commerce',
      'Economics'
    ];
  }
  if (className === 'ss1' || className === 'ss1a' || className === 'ss1b') {
    return [
      'Maths',
      'Chemistry',
      'Physics',
      'Government',
      'Lit-in-Eng',
      'Latin',
      'CRS',
      'Computer',
      'Geography',
      'Igbo',
      'French'
    ];
  }
  if (className === 'jss3' || className === 'jss3a' || className === 'jss3b') {
    return [
      'English Language',
      'Maths',
      'Agric',
      'PHE',
      'Civic',
      'Igbo',
      'Social',
      'Computer',
      'Home Economics',
      'French',
      'CRS',
      'Music'
    ];
  }
  if (className === 'jss2' || className === 'jss2a' || className === 'jss2b') {
    return [
      'English Language',
      'Maths',
      'Agric',
      'PHE',
      'Social Studies',
      'Civic',
      'Basic Science',
      'Home Economics',
      'Basic Tech',
      'French',
      'CRS',
      'Music'
    ];
  }
  // Default to JSS1 subjects
  return [
    'English Language',
    'Mathematics',
    'Agric Science',
    'Civic Education',
    'Social Science',
    'Igbo Language',
    'Basic Science',
    'Home Economics',
    'Computer',
    'Basic Tech',
    'French',
    'CRS',
    'Music'
  ];
});
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
    const [dirtyStudents, setDirtyStudents] = useState({}); // <-- New state for tracking dirty students


    function buildSaveAllPayload(studentId, isPush = false) {
  // Calculate average if not set
  const studentResults = results[studentId] || {};
  const studentSubjects = subjects || [];
  let manualAverage = studentResults.average;
  let autoAverage = '';
  if (!manualAverage) {
    const subjectTotals = studentSubjects.map(subject => {
      const cat1 = Number(studentResults[`${subject}_cat1`] || 0);
      const exam = Number(studentResults[`${subject}_exam`] || 0);
      return cat1 + exam;
    });
    autoAverage =
      subjectTotals.length > 0
        ? (subjectTotals.reduce((a, b) => a + b, 0) / subjectTotals.length)
        : '';
    if (autoAverage !== '' && autoAverage > 100) autoAverage = 100;
    autoAverage = autoAverage !== '' ? Number(autoAverage).toFixed(1) : '';
  }

  return {
    studentId,
    teacherId: teacherData?._id,
    className: teacherData?.className,
    term: selectedTerm,
    subjects,
    caScores: caScores[studentId] || {},
    ...results[studentId],
    ...overall[studentId],
    average: manualAverage !== undefined && manualAverage !== null && manualAverage !== ''
      ? manualAverage
      : autoAverage,
    isPush,
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
    // ...existing code...

// Fetch and map student results when a student is selected
useEffect(() => {
  const fetchStudentResults = async () => {
    if (
      selectedStudent &&
      teacherData?.className &&
      selectedTerm &&
      isValidObjectId(selectedStudent._id)
    ) {
      try {
        // Fetch results for this student, class, and term
        const res = await fetch(
          `${API_BASE_URL}/api/results/student/${selectedStudent._id}/${selectedTerm}/${encodeURIComponent(teacherData.className)}`
        );
        if (!res.ok) throw new Error('Failed to fetch student results');
        const data = await res.json();

        // Map results to state
        const subjectResults = {};
        const overallResults = {};
        const caScoresResults = {};

        data.forEach(result => {
          if (result.subject === 'Overall') {
            overallResults[selectedStudent._id] = { ...result };
          } else if (result.subject && result.subject.endsWith('C/A')) {
            // CA scores
            const subjectName = result.subject.replace(' C/A', '');
            caScoresResults[selectedStudent._id] = {
              ...(caScoresResults[selectedStudent._id] || {}),
              [subjectName]: result.score
            };
          } else if (result.subject) {
            // Subject results
            Object.keys(result).forEach(key => {
              subjectResults[selectedStudent._id] = {
                ...(subjectResults[selectedStudent._id] || {}),
                [`${result.subject}_${key}`]: result[key]
              };
            });
          }
        });

        setResults(prev => ({
          ...prev,
          ...subjectResults
        }));
        setOverall(prev => ({
          ...prev,
          ...overallResults
        }));
        setCaScores(prev => ({
          ...prev,
          ...caScoresResults
        }));
      } catch (err) {
        // If error, clear fields for this student
        setResults(prev => ({ ...prev, [selectedStudent._id]: {} }));
        setOverall(prev => ({ ...prev, [selectedStudent._id]: {} }));
        setCaScores(prev => ({ ...prev, [selectedStudent._id]: {} }));
      }
    }
  };
  fetchStudentResults();
  // eslint-disable-next-line
}, [selectedStudent, teacherData, selectedTerm]);

// ...existing code...

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

    // Fetch all students registered under this class and term
useEffect(() => {
    const fetchStudents = async () => {
        setIsLoadingStudents(true);
        setStudents([]);
        if (teacherData?.className && selectedTerm) {
            try {
                // Use the backend route: /api/user/class/:className/:term/students
                const res = await fetch(
                    `${API_BASE_URL}/api/user/class/${encodeURIComponent(teacherData.className)}/${selectedTerm}/students`
                );
                if (!res.ok) throw new Error('Failed to fetch students');
                const data = await res.json();
                setStudents(Array.isArray(data) ? data : []);
            } catch (err) {
                setStudents([]);
            }
        }
        setIsLoadingStudents(false);
    };
    fetchStudents();
}, [teacherData, selectedTerm]);

    // Fetch teacher's results for the class and term
    useEffect(() => {
        if (teacherData?.className && selectedTerm) {
            setIsLoadingResults(true);
            console.log('Fetching results for class:', teacherData.className, 'term:', selectedTerm);
            fetch(`${API_BASE_URL}/api/results/class/${encodeURIComponent(teacherData.className)}/${encodeURIComponent(selectedTerm)}`, {
                credentials: 'include'
            })
                .then(res => {
                    console.log('Fetch response status:', res.status);
                    return res.json();
                })
                .then(data => {
                    console.log('Fetched data:', data);
                    setTeacherResults(Array.isArray(data) ? data : []);
                    // Merge previous state to preserve input
                    const newResults = { ...results };
                    const newCaScores = { ...caScores };
                    const newOverall = { ...overall };
                    students.forEach(student => {
                      console.log('Mapping for student:', student._id, student.name);
                      const studentData = data.filter(r => String(r.studentId) === String(student._id));
                      console.log('Student data:', studentData);
                      newResults[student._id] = { ...(results[student._id] || {}) };
                      newCaScores[student._id] = { ...(caScores[student._id] || {}) };
                      subjects.forEach(subject => {
                        // Find all result objects for this student/subject
                        const foundResults = data.filter(
                          r => String(r.studentId) === String(student._id) && r.subject === subject
                        );
                        console.log('Found results for subject:', subject, foundResults);
                        if (foundResults.length > 0) {
                          // Set all fields from backend for this subject
                          const r = foundResults[0];
                          const fieldMap = {
                            '_project': 'projectScore',
                            '_cat1': 'firstCatScore',
                            '_cat2': 'secondCatScore',
                            '_exam': 'examScore',
                            '_maxScore': 'maxScore',
                            '_minScore': 'minScore',
                            '_grade': 'grade',
                            '_remark': 'remark',
                            'overallScore': 'overallScore' // <-- add this line if you use fieldMap for mapping
                          };
                          [
                            '_project', '_cat1', '_cat2', '_exam', '_maxScore', '_minScore', '_grade', '_remark', 'overallScore'
                          ].forEach(suffix => {
                            const backendField = fieldMap[suffix];
                            if (r[backendField] !== undefined) {
                              newResults[student._id][subject + suffix] = r[backendField];
                              console.log('Set', subject + suffix, 'to', r[backendField]);
                            }
                          });
                          // Also set score if present
                          if (r.score !== undefined) {
                            newResults[student._id][subject] = r.score;
                            console.log('Set', subject, 'to', r.score);
                          }
                        }
                        // C/A scores
                        const foundCA = data.find(
                          r => String(r.studentId) === String(student._id) && r.subject === `${subject} C/A`
                        );
                        if (foundCA) {
                          newCaScores[student._id][subject] = foundCA.score;
                          console.log('Set CA for', subject, 'to', foundCA.score);
                        }
                      });
                      // Overall
                      const foundOverall = data.find(
                        r => String(r.studentId) === String(student._id) && r.subject === 'Overall'
                      );
                      if (foundOverall) {
                        console.log('Found overall:', foundOverall);
                        newOverall[student._id] = {
                          ...(overall[student._id] || {}),
                          overallScore: foundOverall.overallScore || foundOverall.score,
                          position: foundOverall.remarks?.replace('Position:', '').trim() || ''
                        };
                        console.log('Set overall for student:', student._id, newOverall[student._id]);
                      }
                    });
                    console.log('Final newResults:', newResults);
                    setResults(newResults);
                    setCaScores(newCaScores);
                    setOverall(newOverall);
                })
                .catch(err => {
                    console.log('Error fetching results:', err);
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
                    // Map subject fields
                    [
                        '_project',
                        '_cat1',
                        '_cat2',
                        '_exam',
                        '_maxScore',
                        '_minScore',
                        '_grade',
                        '_remark',
                        '_overallScore'
                    ].forEach(suffix => {
                        const key = `${subject}${suffix}`;
                        if (foundExam[suffix.replace('_', '')] !== undefined) {
                            newResults[student._id][key] = foundExam[suffix.replace('_', '')];
                        }
                    });
                    // Main subject score (total)
                    if (foundExam.score !== undefined) {
                        newResults[student._id][subject] = foundExam.score;
                    }
                }
                const foundCA = teacherResults.find(
                    r => r.studentId?.toString() === student._id && r.subject === `${subject} C/A`
                );
                if (foundCA && foundCA.score !== undefined) {
                    newCaScores[student._id][subject] = foundCA.score;
                }
            });

            // --- Add this block to map key rating and meta fields ---
            const foundMeta = teacherResults.find(
                r => String(r.studentId) === String(student._id) && r.subject === 'Overall'
            );
            if (foundMeta) {
                [
                    'handwriting', 'punctuality', 'initiative', 'obedience', 'honesty',
                    'neatness', 'attentiveness', 'respect', 'attitude', 'creativity',
                    'teacherComment', 'signatureDate', 'headTeacherRemark', 'academicYear',
                    'schoolOpened', 'present', 'absent', 'totalScore', 'projectDefence',
                    'average', 'nextTerm', 'overallScore'
                ].forEach(field => {
                    if (foundMeta[field] !== undefined) {
                        newResults[student._id][field] = foundMeta[field];
                    }
                });
                // --- Ensure overallScore is set in results for UI binding ---
                if (foundMeta.score !== undefined) {
                    newResults[student._id].overallScore = foundMeta.score;
                }
            }
            // --- End block ---
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
                // --- Ensure overallScore is also in results for UI binding ---
                if (!newResults[student._id]) newResults[student._id] = {};
                newResults[student._id].overallScore = found.score;
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
    `${subject}_remark`,
    `${subject}_overallScore`
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
          `${subject}_remark`,
          `${subject}_overallScore`
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
      setDirtyStudents(prev => ({ ...prev, [studentId]: true }));

      setResults(prev => {
        const updated = {
          ...prev,
          [studentId]: {
            ...(prev[studentId] || {}),
            [field]: value
          }
        };

        // Auto-calculate total, grade, and remark for the subject if any score field changes
        const [subject, part] = field.split('_');
        if (subjects.includes(subject)) {
          const cat1 = Number(updated[studentId][`${subject}_cat1`] || 0);
          const exam = Number(updated[studentId][`${subject}_exam`] || 0);
          const total = cat1 + exam;

          // Only auto-fill if user hasn't manually set total/grade/remark
          if (!updated[studentId][`${subject}_total_manual`]) {
            updated[studentId][`${subject}_total`] = total;
          }
          if (!updated[studentId][`${subject}_grade_manual`]) {
            updated[studentId][`${subject}_grade`] = getGrade(total);
          }
          if (!updated[studentId][`${subject}_remark_manual`]) {
            updated[studentId][`${subject}_remark`] = getRemark(getGrade(total));
          }
        }
        return updated;
      });
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
      // Always use buildSaveAllPayload to include average, C.A.T, Exam, etc.
      const savePayload = buildSaveAllPayload(student._id, false); // isPush: false for save
      const res = await fetch(`${API_BASE_URL}/api/results/save-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePayload),
      });
      if (!res.ok) {
        allSuccess = false;
        failedStudents.push(student.name);
      }
    }
    if (allSuccess) {
      setSuccessMsg('Results have been successfully saved for all students.');
    } else {
      setErrorMsg(`Failed to save results for: ${failedStudents.join(', ')}. Please try again.`);
    }
  } catch (err) {
    setErrorMsg('Failed to save results. Please try again.');
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
    // Always use buildSaveAllPayload to include average, C.A.T, Exam, etc.
    const savePayload = buildSaveAllPayload(studentId, true); // isPush: true for push
    const saveRes = await fetch(`${API_BASE_URL}/api/results/save-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savePayload),
    });
    if (!saveRes.ok) {
      throw new Error('Failed to save data before pushing');
    }

    for (const subject of subjects) {
      const score = results?.[studentId]?.[subject];
      if (score !== undefined && score !== '') {
        await fetch(`${API_BASE_URL}/api/results/set`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            teacherId: teacherData._id,
            className: teacherData.className,
            term: selectedTerm,
            subject,
            score: Number(score) || 0,
            isPush: true // Always true for push
          })
        });
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
            score: Number(caScore) || 0,
            isPush: true // Always true for push
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
          isPush: true // Always true for push
        })
      });
      if (!res.ok) {
        success = false;
      }
    }
    if (success) {
      setResultsPushed(prev => ({ ...prev, [studentId]: true }));
      setSuccessMsg('Student result has been successfully pushed.');
      // Update localStorage with current state after push (retains data even if pushed)
      localStorage.setItem(
        `resultPortal_${teacherData.className}_${selectedTerm}_${studentId}`,
        JSON.stringify({
          results: results[studentId] || {},
          caScores: caScores[studentId] || {},
          overall: overall[studentId] || {},
          subjects,
        })
      );
      // Clear dirty flag
      setDirtyStudents(prev => ({ ...prev, [studentId]: false }));
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
   // 3. Load subjects from localStorage for selected student
useEffect(() => {
  if (selectedStudent) {
    const key = `resultPortal_${teacherData?.className}_${selectedTerm}_${selectedStudent._id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
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
          }
        }, 17000); // 17 seconds debounce

        return () => clearTimeout(timeout);
      }
    }, [results, caScores, overall, subjects, selectedStudent, teacherData, selectedTerm]);

    // Add this helper function near the top of your file
function isValidObjectId(id) {
  return typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]+$/.test(id);
}

// --- REPLACE THIS BLOCK WITH THE NEW UPDATE ---
useEffect(() => {
  if (
    selectedStudent &&
    teacherData?.className &&
    selectedTerm &&
    isValidObjectId(selectedStudent._id)
  ) {
    fetch(
      `${API_BASE_URL}/api/results/student/${selectedStudent._id}/all?className=${teacherData.className}&term=${selectedTerm}`
    )
      .then(res => res.json())
      .then(backendData => {
        if (!backendData || backendData.length === 0) return;

        // Prepare new state objects, but always merge with previous state
        const prevResults = results[selectedStudent._id] || {};
        const prevOverall = overall[selectedStudent._id] || {};
        const prevCaScores = caScores[selectedStudent._id] || {};

        const newResults = { ...prevResults };
        const newOverall = { ...prevOverall };
        const newCaScores = { ...prevCaScores };

        backendData.forEach(item => {
          // Subject fields
          if (item.subject && item.subject !== 'Overall') {
            // Map all subject fields
            [
              '_project',
              '_cat1',
              '_cat2',
              '_exam',
              '_maxScore',
              '_minScore',
              '_grade',
              '_remark',
              '_overallScore'
            ].forEach(suffix => {
              const key = `${item.subject}${suffix}`;
              if (item[suffix.replace('_', '')] !== undefined) {
                newResults[key] = item[suffix.replace('_', '')];
              }
            });
            // Also map the main subject score (total)
            if (item.score !== undefined) {
              newResults[item.subject] = item.score;
            }
            // CA scores
            if (item.subject.endsWith('C/A') && item.score !== undefined) {
              const caSubject = item.subject.replace(' C/A', '');
              newCaScores[caSubject] = item.score;
            }
          }

          // Key Rating fields
          [
            'handwriting', 'punctuality', 'initiative', 'obedience', 'honesty',
            'neatness', 'attentiveness', 'respect', 'attitude', 'creativity'
          ].forEach(field => {
            if (item[field] !== undefined) {
              newResults[field] = item[field];
            }
          });

          // Meta fields
          if (item.teacherComment !== undefined) newResults.teacherComment = item.teacherComment;
          if (item.signatureDate !== undefined) newResults.signatureDate = item.signatureDate;
          if (item.headTeacherRemark !== undefined) newResults.headTeacherRemark = item.headTeacherRemark;
          if (item.academicYear !== undefined) newResults.academicYear = item.academicYear;
          if (item.schoolOpened !== undefined) newResults.schoolOpened = item.schoolOpened;
          if (item.present !== undefined) newResults.present = item.present;
          if (item.absent !== undefined) newResults.absent = item.absent;
          if (item.totalScore !== undefined) newResults.totalScore = item.totalScore;
          if (item.projectDefence !== undefined) newResults.projectDefence = item.projectDefence;
          if (item.average !== undefined) newResults.average = item.average;
          if (item.nextTerm !== undefined) newResults.nextTerm = item.nextTerm;

          // Over-all Score and Position
          if (item.subject === 'Overall') {
            if (item.score !== undefined) {
              newOverall.overallScore = item.score;
              // --- Also set in results for UI binding ---
              newResults.overallScore = item.score;
            }
            if (item.remarks && item.remarks.includes('Position:')) {
              newOverall.position = item.remarks.replace('Position:', '').trim();
            }
          }
        });

        // Only update if we have at least one result for this student
        if (Object.keys(newResults).length > 0) {
          setResults(prev => ({ ...prev, [selectedStudent._id]: newResults }));
        }
        if (Object.keys(newOverall).length > 0) {
          setOverall(prev => ({ ...prev, [selectedStudent._id]: newOverall }));
        }
        if (Object.keys(newCaScores).length > 0) {
          setCaScores(prev => ({ ...prev, [selectedStudent._id]: newCaScores }));
        }
      })
      .catch(err => {
        console.error('[ERROR] Error fetching backend data for student:', err);
        // Do not overwrite state on error
      });
  }
}, [selectedStudent, teacherData, selectedTerm, subjects]);
// --- END REPLACE ---



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

        // --- Position Calculation ---
    // Get all students' overall scores for this class/term
    const studentScores = students.map(s => {
      const overallScore = Number(overall[s._id]?.overallScore) || 0;
      // If you want to use average as a tiebreaker, get it here:
      const average = Number(results?.[s._id]?.average) || 0;
      return {
        _id: s._id,
        name: s.name,
        overallScore,
        average
      };
    });

    // Sort by overallScore DESC, then by average DESC
    studentScores.sort((a, b) => {
      if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
      return b.average - a.average;
    });

    // Assign positions (1st, 2nd, 3rd, 4th, ...), handling ties
    let lastScore = null;
    let lastAverage = null;
    let lastPosition = 0;
    let actualPosition = 1;
    const positions = {};
    studentScores.forEach((s, idx) => {
        if (
          s.overallScore === lastScore &&
          s.average === lastAverage
        ) {
          positions[s._id] = lastPosition; // Same score & average, same position
        } else {
          positions[s._id] = actualPosition;
          lastScore = s.overallScore;
          lastAverage = s.average;
          lastPosition = actualPosition;
        }
        actualPosition++;
      });
    
    // Get the auto-calculated position for the selected student
    const autoPosition = positions[selectedStudent._id] || '';

    // Use manual position if set, otherwise use auto
    const manualPosition = overall[selectedStudent._id]?.position;
    const positionValue =
      manualPosition !== undefined && manualPosition !== null && manualPosition !== ''
        ? manualPosition
        : autoPosition
          ? `${autoPosition}${autoPosition === 1 ? 'st' : autoPosition === 2 ? 'nd' : autoPosition === 3 ? 'rd' : 'th'}`
          : '';

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
              {/* --- Position and Average Box Fields --- */}
              <div className="mb-4 flex flex-wrap gap-4 items-center">
  <div>
    <label className="font-semibold">Position:</label>
    <input
      type="text"
      className="border rounded px-2 py-1 w-24 ml-2"
      value={positionValue}
      readOnly={isReadOnly}
      onChange={e =>
        handleOverallChange(selectedStudent._id, 'position', e.target.value)
      }
      title={
        manualPosition
          ? "Manually set. Clear to use auto-calculated position."
          : "Auto-calculated. You can override by typing."
      }
    />
    <small className="text-xs text-gray-500 ml-2">
      {manualPosition ? "Manual" : "Auto"}
    </small>
  </div>
  <div>
    <label className="font-semibold">Average:</label>
    {(() => {
      // Calculate average of subject totals
      const subjectTotals = subjects.map(subject => {
        const cat1 = Number(results?.[selectedStudent._id]?.[`${subject}_cat1`] || 0);
        const exam = Number(results?.[selectedStudent._id]?.[`${subject}_exam`] || 0);
        return cat1 + exam;
      });
      let autoAverage =
        subjectTotals.length > 0
          ? (subjectTotals.reduce((a, b) => a + b, 0) / subjectTotals.length)
          : '';
      // Clamp to 100
      if (autoAverage !== '' && autoAverage > 100) autoAverage = 100;
      autoAverage = autoAverage !== '' ? Number(autoAverage).toFixed(1) : '';
      // Use manual value if set, else auto
      const manualAverage = results?.[selectedStudent._id]?.average;
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
          onChange={e => handleResultChange(selectedStudent._id, 'average', e.target.value)}
          placeholder="Average"
          readOnly={isReadOnly}
          max={100}
          title={
            manualAverage !== undefined && manualAverage !== null && manualAverage !== ''
              ? 'Manual'
              : 'Auto-calculated'
          }
        />
      );
    })()}
  </div>
</div>
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
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">C.A.T (30%)</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Exam (70%)</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Total (100%)</th>
                        {/* Removed Max Score */}
                        {/* Removed Min Score */}
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Grade</th>
                        <th className="px-2 py-2 text-left font-semibold text-muted-foreground">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map(subject => {
                        // Only one C.A.T (cat1, 30) and Exam (70)
                        const cat1 = Number(results?.[selectedStudent._id]?.[`${subject}_cat1`] || 0);
                        const exam = Number(results?.[selectedStudent._id]?.[`${subject}_exam`] || 0);
                        const total = cat1 + exam;

                        return (
                          <tr key={subject}>
                            <td className="px-2 py-2">{subject}</td>
                            {/* Only one C.A.T */}
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                max="30"
                                className="w-16 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_cat1`] || ''}
                                onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, `${subject}_cat1`, e.target.value)}
                                placeholder="C.A.T"
                                readOnly={isReadOnly}
                              />
                            </td>
                            {/* Exam */}
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                max="70"
                                className="w-16 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_exam`] || ''}
                                onChange={e => !isReadOnly && handleResultChange(selectedStudent._id, `${subject}_exam`, e.target.value)}
                                placeholder="Exam"
                                readOnly={isReadOnly}
                              />
                            </td>
                            {/* Total */}
                            <td className="px-2 py-2 font-bold text-primary">
                              {total}
                            </td>
                            {/* Removed Max Score */}
                            {/* Removed Min Score */}
                            {/* Grade */}
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                className="w-16 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_grade`] || ''}
                                onChange={e => {
                                  handleResultChange(selectedStudent._id, `${subject}_grade`, e.target.value);
                                  setResults(prev => ({
                                    ...prev,
                                    [selectedStudent._id]: {
                                      ...(prev[selectedStudent._id] || {}),
                                      [`${subject}_grade_manual`]: true
                                    }
                                  }));
                                }}
                                placeholder="Grade"
                                readOnly={isReadOnly}
                              />
                            </td>
                            {/* Remark */}
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                className="w-24 border rounded-lg px-2 py-1"
                                value={results?.[selectedStudent._id]?.[`${subject}_remark`] || ''}
                                onChange={e => {
                                  handleResultChange(selectedStudent._id, `${subject}_remark`, e.target.value);
                                  setResults(prev => ({
                                    ...prev,
                                    [selectedStudent._id]: {
                                      ...(prev[selectedStudent._id] || {}),
                                      [`${subject}_remark_manual`]: true
                                    }
                                  }));
                                }}
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
    <label className="font-semibold">Rector's Signature:</label>
    <div className="flex items-center mt-2">
        <img
            src="/assets/images/rector-signature.jpg"
            alt="Rector's Signature"
            className="h-16 object-contain"
            style={{ background: '#fff', borderRadius: '4px', border: '1px solid #eee', padding: '4px' }}
        />
    </div>
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
                      disabled={isSubmitting || isReadOnly} // <-- Disable if already pushed
                      className="w-full"
                      onClick={async () => {
                        setSuccessMsg('');
                        setErrorMsg('');
                        setIsSubmitting(true);

                        // Always send isPush: false for draft save
                        const payload = buildSaveAllPayload(selectedStudent._id, false);

                        try {
                          const res = await fetch(`${API_BASE_URL}/api/results/save-all`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                          });
                          const data = await res.json();
                          if (data.success) {
                            setSuccessMsg('Result saved as draft.');
                            setDirtyStudents(prev => ({ ...prev, [selectedStudent._id]: false }));
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
    className="relative bg-card border border-border rounded-lg shadow p-4 flex flex-col items-center cursor-pointer hover:bg-primary/10 transition"
    onClick={() => setSelectedStudent(student)}
  >
    {/* Pushed badge */}
    {resultsPushed[student._id] && (
      <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
        Pushed
      </span>
    )}
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