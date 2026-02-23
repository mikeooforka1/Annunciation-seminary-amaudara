import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TiArrowBackOutline } from "react-icons/ti";
import { FixedSizeList as List } from 'react-window';
import { addToQueue, getQueue, clearQueue } from '../../../utils/offlineQueue';
import { loadOfflineState, saveOfflineState } from '../../../utils/offlineQueue';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Spreadsheet = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedClass = location.state?.selectedClass || "";
  const selectedTerm = location.state?.selectedTerm || "";
  const [students, setStudents] = useState(location.state?.students || []);
  const [editResults, setEditResults] = useState(location.state?.editResults || {});
  const [subjects, setSubjects] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // Add this line
  const [confirmRemoveSubject, setConfirmRemoveSubject] = useState(null); // subject name to confirm
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(null); // { type, subject }
  const [editedStudents, setEditedStudents] = useState(new Set());
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(null); // { subject }
  const [selectedStudentForDelete, setSelectedStudentForDelete] = useState(null);
  const [studentSearch, setStudentSearch] = useState(""); // For filtering students
  const saveQueue = React.useRef({}); // { [studentId]: Promise } to serialize saves per student
  const [subjectsOrder, setSubjectsOrder] = useState([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [wasOffline, setWasOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [hasShownOnlineModal, setHasShownOnlineModal] = useState(false);

   const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/class/${selectedClass}/all/students?term=${selectedTerm}`);
        let studentData = await res.json();
        studentData = Array.isArray(studentData)
          ? [...studentData].sort((a, b) =>
              (a.name || a.fullName || a.username || '').localeCompare(
                b.name || b.fullName || b.username || ''
              )
            )
          : [];
        setStudents(studentData);

        const fetches = studentData.map(student =>
          fetch(`${API_BASE_URL}/api/results/student/${student._id}/pushed?className=${selectedClass}&term=${selectedTerm}`)
            .then(res => res.json())
            .then(results => ({ studentId: student._id, results }))
        );

        const resultsArr = await Promise.all(fetches);
        const allSubjectsSet = new Set();
        const allSubjectsOrdered = [];
        const map = {};
        const editMap = {};

        resultsArr.forEach(({ studentId, results }) => {
          map[studentId] = {};
          editMap[studentId] = {};
          const subjects = [];

          results.forEach(r => {
            if (r.subject && r.subject !== "Overall") {
              subjects.push(r.subject);
              map[studentId][r.subject] = r;
              editMap[studentId][r.subject] = {
                cat: r.firstCatScore ?? "",
                exam: r.examScore ?? "",
                grade: r.grade ?? "",
                remark: r.remark ?? "",
                _id: r._id,
                notOffering: false
              };
              if (!allSubjectsSet.has(r.subject)) {
                allSubjectsSet.add(r.subject);
                allSubjectsOrdered.push(r.subject);
              }
            } else if (r.subject === "Overall") {
              map[studentId]._overall = r;
              editMap[studentId]._overall = {
                ...r,
                handwriting: r.handwriting ?? "",
                punctuality: r.punctuality ?? "",
                initiative: r.initiative ?? "",
                obedience: r.obedience ?? "",
                honesty: r.honesty ?? "",
                neatness: r.neatness ?? "",
                attentiveness: r.attentiveness ?? "",
                respect: r.respect ?? "",
                attitude: r.attitude ?? "",
                creativity: r.creativity ?? ""
              };
            }
          });

          editMap[studentId].subjects = subjects;

          allSubjectsOrdered.forEach(subject => {
            if (!subjects.includes(subject)) {
              editMap[studentId][subject] = { notOffering: true };
            }
          });
        });

        Object.keys(editMap).forEach(studentId => {
          const studentSubjects = Object.keys(editMap[studentId]).filter(s => s !== "_overall" && editMap[studentId][s] && !editMap[studentId][s].notOffering);
          allSubjectsOrdered.forEach(subject => {
            if (!studentSubjects.includes(subject)) {
              editMap[studentId][subject] = { notOffering: true };
            }
          });
        });

        setSubjects(allSubjectsOrdered);
        setResultsMap(map);
        setEditResults(editMap);
        setLoading(false);
      } catch (err) {
        setStudents([]);
        setSubjects([]);
        setResultsMap({});
        setEditResults({});
        setLoading(false);
      }
    };


  useEffect(() => {
    let didSetFromState = false;

    // 1. If data is passed from verify page, use it for instant load
    if (
      location.state?.students &&
      location.state?.editResults &&
      location.state?.verifiedStudents
    ) {
      setStudents(location.state.students);

      // Build subject list from all students' subjects (in order, no duplicates)
      const allSubjectsOrdered = [];
      const allSubjectsSet = new Set();
      location.state.students.forEach(student => {
        const studentSubjects = location.state.editResults[student._id]?.subjects || [];
        studentSubjects.forEach(subject => {
          if (!allSubjectsSet.has(subject)) {
            allSubjectsSet.add(subject);
            allSubjectsOrdered.push(subject);
          }
        });
      });
      setSubjects(allSubjectsOrdered);
      setSubjectsOrder(allSubjectsOrdered); // <-- Save the initial order

      // Map all fields for each student exactly as in verify page
      const fixedEditResults = {};
      location.state.students.forEach(student => {
        const result = location.state.editResults[student._id] || {};
        fixedEditResults[student._id] = {};

        // Copy all subject results
        if (Array.isArray(result.subjects)) {
          fixedEditResults[student._id].subjects = [...result.subjects];
          result.subjects.forEach(subject => {
            fixedEditResults[student._id][subject] = { ...result[subject] };
          });
        }

        // Copy all meta/key fields (including key ratings, position, average, etc.)
        [
          "_overallId", "position", "average", "schoolOpened", "present", "absent",
          "teacherComment", "headTeacherRemark", "academicYear", "nextTerm",
          "handwriting", "punctuality", "initiative", "obedience", "honesty",
          "neatness", "attentiveness", "respect", "attitude", "creativity"
        ].forEach(field => {
          if (result[field] !== undefined) {
            fixedEditResults[student._id][field] = result[field];
          }
        });

        // For spreadsheet compatibility, also nest key ratings/meta under _overall
        fixedEditResults[student._id]._overall = {
          handwriting: result.handwriting ?? "",
          punctuality: result.punctuality ?? "",
          initiative: result.initiative ?? "",
          obedience: result.obedience ?? "",
          honesty: result.honesty ?? "",
          neatness: result.neatness ?? "",
          attentiveness: result.attentiveness ?? "",
          respect: result.respect ?? "",
          attitude: result.attitude ?? "",
          creativity: result.creativity ?? "",
          average: result.average ?? "",
          position: result.position ?? "",
          teacherComment: result.teacherComment ?? "",
          headTeacherRemark: result.headTeacherRemark ?? "",
          academicYear: result.academicYear ?? "",
          nextTerm: result.nextTerm ?? "",
          _id: result._overallId ?? ""
        };
      });
      setEditResults(fixedEditResults);
      didSetFromState = true;
    }

    // 2. If offline, load from IndexedDB and skip backend fetch
    if (!navigator.onLine) {
      (async () => {
        const offlineState = await loadOfflineState();
        if (offlineState) {
          setStudents(offlineState.students || []);
          setEditResults(offlineState.editResults || {});
          setSubjects(offlineState.subjects || []);
          setSubjectsOrder(offlineState.subjectsOrder || []);
        }
      })();
      return; // <-- Prevent backend fetch
    }

    // 3. Always fetch latest from backend for sustainability (on page load, refresh, or after save)
    if (!selectedClass || !selectedTerm) return;
    setLoading(true);

   
    // Always fetch from backend for sustainability
    fetchData();
  }, [selectedClass, selectedTerm, location.state]);

  // Handle input change for scores and key ratings
  const handleInputChange = (studentId, subject, field, value) => {
    setEditResults(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      if (!updated[studentId][subject]) updated[studentId][subject] = {};

      // Clamp CAT and Exam scores
      let newValue = value;
      if (field === "cat") {
        newValue = Math.max(0, Math.min(Number(value), 30));
        updated[studentId][subject][field] = newValue;
        updated[studentId][subject]["cat1"] = newValue;
      } else if (field === "exam") {
        newValue = Math.max(0, Math.min(Number(value), 70));
        updated[studentId][subject][field] = newValue;
      } else {
        updated[studentId][subject][field] = value;
      }

      if (field === "cat" || field === "exam") {
        const cat = Number(updated[studentId][subject].cat ?? updated[studentId][subject].cat1 ?? 0);
        const exam = Number(updated[studentId][subject].exam ?? 0);
        const total = cat + exam;
        updated[studentId][subject].grade = getGrade(total);
        updated[studentId][subject].remark = getRemark(updated[studentId][subject].grade);
      }

      // Always queue/save the action for offline persistence
      saveStudentResults(studentId, updated);

      // Always save offline state for persistence (even online)
      saveOfflineState({
        students,
        editResults: updated,
        subjects,
        subjectsOrder
      });

      return updated;
    });
    setEditedStudents(prev => new Set(prev).add(studentId));
  };

  const handleKeyRatingChange = (studentId, field, value) => {
    setEditResults(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      if (!updated[studentId]._overall) updated[studentId]._overall = {};
      updated[studentId]._overall[field] = value;
      // Save with the latest state
      saveStudentResults(studentId, updated);
      // Save offline state for persistence
      saveOfflineState({
        students,
        editResults: updated,
        subjects,
        subjectsOrder
      });
      return updated;
    });
    setEditedStudents(prev => new Set(prev).add(studentId));
  };

  // Remove subject for all students
  const handleRemoveSubjectAll = async (subject) => {
    // 1. Collect all subject result IDs to delete
    const subjectResultIds = [];
    Object.keys(editResults).forEach(studentId => {
      const subjObj = editResults[studentId]?.[subject];
      if (subjObj && subjObj._id) {
        subjectResultIds.push(subjObj._id);
      }
    });

    // 2. Update local state for all students (remove subject from subjects array and object)
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

    setSubjects(prev => prev.filter(s => s !== subject));
    setSubjectsOrder(prev => prev.filter(s => s !== subject));

    // 3. Call backend API to delete subject results for all students
    for (const resultId of subjectResultIds) {
      try {
        await fetch(`${API_BASE_URL}/api/results/delete/${resultId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        // Optionally handle error
      }
    }
  };

  // Remove subject for individual student
  const handleRemoveSubjectIndividual = async (studentId, subject) => {
    // 1. Mark notOffering in local state
    setEditResults(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      if (!updated[studentId][subject]) updated[studentId][subject] = {};
      updated[studentId][subject].notOffering = true;
      // Remove subject from subjects array if present
      if (Array.isArray(updated[studentId].subjects)) {
        updated[studentId].subjects = updated[studentId].subjects.filter(s => s !== subject);
      }
      return updated;
    });

    // 2. Call backend API to delete subject for this student (same as verify page)
    const subjObj = editResults[studentId]?.[subject];
    if (subjObj && subjObj._id) {
      try {
        await fetch(`${API_BASE_URL}/api/results/delete/${subjObj._id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        // Optionally handle error
      }
    }
  };
  
const fetchUpdatedResultsForEdited = async () => {
  const updatedEditResults = { ...editResults };
  for (const studentId of editedStudents) {
    const res = await fetch(`${API_BASE_URL}/api/results/student/${studentId}/pushed?className=${selectedClass}&term=${selectedTerm}`);
    const results = await res.json();
    const studentResult = {};
    const subjects = [];
    results.forEach(r => {
      if (r.subject && r.subject !== "Overall") {
        subjects.push(r.subject);
        studentResult[r.subject] = {
          cat: r.firstCatScore ?? "",
          exam: r.examScore ?? "",
          grade: r.grade ?? "",
          remark: r.remark ?? "",
          _id: r._id,
          notOffering: false
        };
      } else if (r.subject === "Overall") {
        studentResult._overall = {
          ...r,
          handwriting: r.handwriting ?? "",
          punctuality: r.punctuality ?? "",
          initiative: r.initiative ?? "",
          obedience: r.obedience ?? "",
          honesty: r.honesty ?? "",
          neatness: r.neatness ?? "",
          attentiveness: r.attentiveness ?? "",
          respect: r.respect ?? "",
          attitude: r.attitude ?? "",
          creativity: r.creativity ?? ""
        };
      }
    });
    studentResult.subjects = subjects;
    updatedEditResults[studentId] = studentResult;
  }
  setEditResults(updatedEditResults);
};
async function saveStudentResults(studentId, nextEditResults = null) {
  const results = nextEditResults || editResults;
  const action = {
    type: 'saveStudentResults',
    studentId,
    results,
    subjects,
  };

  if (!navigator.onLine) {
    await addToQueue(action);
    return;
  }

  // Online: save directly to backend, do NOT add to queue
  saveQueue.current[studentId] = (saveQueue.current[studentId] || Promise.resolve()).then(async () => {
    for (const subject of subjects) {
      const subjEdit = results[studentId]?.[subject];
      if (subjEdit && !subjEdit.notOffering && subjEdit._id) {
        await fetch(`${API_BASE_URL}/api/results/update/${subjEdit._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            firstCatScore: Number(subjEdit.cat ?? 0),
            examScore: Number(subjEdit.exam ?? 0),
            grade: subjEdit.grade ?? "",
            remark: subjEdit.remark ?? "",
            reviewed: false,
            pending: true,
            verified: false
          }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    const overall = results[studentId]?._overall;
    if (overall && overall._id) {
      await fetch(`${API_BASE_URL}/api/results/update/${overall._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          handwriting: overall.handwriting,
          punctuality: overall.punctuality,
          initiative: overall.initiative,
          obedience: overall.obedience,
          honesty: overall.honesty,
          neatness: overall.neatness,
          attentiveness: overall.attentiveness,
          respect: overall.respect,
          attitude: overall.attitude,
          creativity: overall.creativity,
          reviewed: false,
          pending: true,
          verified: false
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Clear queue after successful online save to prevent stale items
    await clearQueue();
  }).catch(() => {});
}

  // Save all changes
  const handleSaveAll = async () => {
    setSaving(true);
    for (const studentId of editedStudents) { // Only loop through edited students
      for (const subject of subjects) {
        const subjEdit = editResults[studentId][subject];
        if (subjEdit && !subjEdit.notOffering && subjEdit._id) {
          await fetch(`${API_BASE_URL}/api/results/update/${subjEdit._id}`, {
            method: 'PUT',
            body: JSON.stringify({
              firstCatScore: Number(subjEdit.cat ?? 0),
              examScore: Number(subjEdit.exam ?? 0),
              grade: subjEdit.grade ?? "",
              remark: subjEdit.remark ?? "",
              reviewed: false,
              pending: true,
              verified: false
            }),
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      // Save key ratings/meta
      const overall = editResults[studentId]._overall;
      if (overall && overall._id) {
        await fetch(`${API_BASE_URL}/api/results/update/${overall._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            handwriting: overall.handwriting,
            punctuality: overall.punctuality,
            initiative: overall.initiative,
            obedience: overall.obedience,
            honesty: overall.honesty,
            neatness: overall.neatness,
            attentiveness: overall.attentiveness,
            respect: overall.respect,
            attitude: overall.attitude,
            creativity: overall.creativity,
            reviewed: false,
            pending: true,
            verified: false
          }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    setSaving(false);
    await fetchUpdatedResultsForEdited(); // <-- Sync UI with backend
    setEditedStudents(new Set());
    alert("All changes saved!");
  };

 useEffect(() => {
  async function checkUnsyncedQueue() {
    const queue = await getQueue();
    const hasUnsyncedChanges = queue && queue.length > 0;

    if (hasUnsyncedChanges && navigator.onLine) {
      // Only show sync modal if there are actual unsynced changes
      setSyncMessage("Unsynced offline changes detected. Syncing to online database...");
      setShowSyncModal(true);
      setSyncing(true);

      let synced = false;
      for (const action of queue) {
        if (action.type === 'saveStudentResults') {
          for (const subject of action.subjects) {
            const subjEdit = action.results[action.studentId]?.[subject];
            if (subjEdit && !subjEdit.notOffering && subjEdit._id) {
              await fetch(`${API_BASE_URL}/api/results/update/${subjEdit._id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  firstCatScore: Number(subjEdit.cat ?? 0),
                  examScore: Number(subjEdit.exam ?? 0),
                  grade: subjEdit.grade ?? "",
                  remark: subjEdit.remark ?? "",
                  reviewed: false,
                  pending: true,
                  verified: false
                }),
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
          const overall = action.results[action.studentId]?._overall;
          if (overall && overall._id) {
            await fetch(`${API_BASE_URL}/api/results/update/${overall._id}`, {
              method: 'PUT',
              body: JSON.stringify({
                handwriting: overall.handwriting,
                punctuality: overall.punctuality,
                initiative: overall.initiative,
                obedience: overall.obedience,
                honesty: overall.honesty,
                neatness: overall.neatness,
                attentiveness: overall.attentiveness,
                respect: overall.respect,
                attitude: overall.attitude,
                creativity: overall.creativity,
                reviewed: false,
                pending: true,
                verified: false
              }),
              headers: { 'Content-Type': 'application/json' }
            });
          }
          synced = true;
        }
      }
      if (synced) {
        await clearQueue();
        setSyncMessage("Offline changes have been synced to the online database.");
        await fetchData(); // Refresh UI with latest data
      }
      setSyncing(false);
      setWasOffline(false);
    } else if (navigator.onLine && !hasUnsyncedChanges) {
      // No unsynced changes — do nothing, no modal
      setShowSyncModal(false);
      setSyncing(false);
    }
  }

  if (navigator.onLine) {
    checkUnsyncedQueue();
  }

  window.addEventListener('online', checkUnsyncedQueue);

  return () => window.removeEventListener('online', checkUnsyncedQueue);
}, []);


useEffect(() => {
  function handleOffline() {
    setSyncMessage("You are now working offline. Changes will sync when online.");
    setShowSyncModal(true);
    setWasOffline(true);
  }

  window.addEventListener('offline', handleOffline);

  // Show modal if page loads offline
  if (!navigator.onLine) {
    setWasOffline(true); // <-- Ensure wasOffline is set!
    handleOffline();
  }

  return () => {
    window.removeEventListener('offline', handleOffline);
  };
}, []);
useEffect(() => {
  function handleBeforeInstallPrompt(e) {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowInstallBtn(true);
  }
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
}, []);


  // --- Add: Live position & average calculation for all students (same as verify-result.jsx) ---
  useEffect(() => {
    if (students.length > 0) {
      // 1. Calculate each student's total C.A.T + Exam for all their subjects
      const studentTotals = students.map(student => {
        const studentId = student._id;
        let totalScore = 0;
        let subjectCount = 0;
        const result = editResults[studentId];
        if (result) {
          Object.keys(result).forEach(subject => {
            if (subject === "_overall") return;
            const subjEdit = result[subject];
            if (subjEdit && !subjEdit.notOffering) {
              const cat = Number(subjEdit.cat ?? 0);
              const exam = Number(subjEdit.exam ?? 0);
              // Only count if at least one score is entered
              if (cat !== 0 || exam !== 0) {
                totalScore += cat + exam;
                subjectCount += 1;
              }
            }
          });
        }
        // If no subjects have scores, fallback to subjects.length
        if (subjectCount === 0 && result) {
          subjectCount = Object.keys(result).filter(
            s => s !== "_overall" && result[s] && !result[s].notOffering
          ).length;
        }
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

      // 4. Update average, position, and remarks for each student
      setEditResults(prev => {
        let changed = false;
        const updated = { ...prev };
        students.forEach(student => {
          const studentId = student._id;
          const autoAverage = studentTotals.find(s => s.studentId === studentId)?.average || 0;
          const autoPosition = positionMap[studentId]
            ? `${positionMap[studentId]}${positionMap[studentId] === 1 ? 'st' : positionMap[studentId] === 2 ? 'nd' : positionMap[studentId] === 3 ? 'rd' : 'th'}`
            : '';
          if (!updated[studentId]) updated[studentId] = {};
          // Only update if not manually set
          if (
            updated[studentId]._overall?.manualPosition !== true
          ) {
            if (!updated[studentId]._overall) updated[studentId]._overall = {};
            updated[studentId]._overall.average = autoAverage;
            updated[studentId]._overall.position = autoPosition;
            // Update remarks using same logic as verify-result.jsx
            updated[studentId]._overall.teacherComment = getDeansRemark(autoAverage);
            updated[studentId]._overall.headTeacherRemark = getRectorsRemark(autoAverage);
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
    }
  }, [students, editResults, subjects]);
  // --- End Add ---

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
  function getRectorsRemark(average) {
    if (average >= 70) return "Excellent result, keep it up";
    if (average >= 65) return "Very good result";
    if (average >= 60) return "Good performance";
    if (average >= 50) return "Average result, work harder";
    return "Below average";
  }
  function getDeansRemark(average) {
    if (average >= 70) return "Exceptional result, sustain this excellence";
    if (average >= 65) return "High quality performance";
    if (average >= 60) return "Competent work";
    if (average >= 50) return "Middle-of-the road, strive for more";
    return "Not meeting the required benchmark";
  }

  const resultStatusMap = location.state?.verifiedStudents || {};

  // Add this:
  const anyReviewedOrVerified = students.some(
    s => resultStatusMap[s._id] === 'reviewed' || resultStatusMap[s._id] === 'verified'
  );


  return (
    <div className="p-4">
      {/* Online/Offline Status Indicator */}
      <div className="flex items-center mb-4">
        <span
          style={{
            display: "inline-block",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: navigator.onLine ? "#22c55e" : "#f87171",
            marginRight: 8,
            border: "1px solid #222"
          }}
        ></span>
        <span className="font-bold" style={{ color: navigator.onLine ? "#22c55e" : "#f87171" }}>
          {navigator.onLine ? "Online" : "Offline"}
        </span>
      </div>
      {/* Back Button */}
      <button
        className="flex items-center mb-4 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-semibold"
        onClick={() =>
          navigate("/admin", {
            state: {
              showSection: "verify",
              selectedClass,
              selectedTerm,
            },
          })
        }
      >
        <TiArrowBackOutline className="mr-2" size={20} />
        Back to Student List
      </button>

      <h2 className="text-xl font-bold mb-4">
        Spreadsheet View for {selectedClass.toUpperCase()}
        {selectedTerm && ` (${selectedTerm.charAt(0).toUpperCase() + selectedTerm.slice(1)} Term)`}
      </h2>

      {/* Show message if any student is reviewed or verified */}
      {anyReviewedOrVerified && (
        <div className="mb-4 p-2 rounded bg-yellow-100 text-yellow-800 font-semibold text-center">
          You cannot modify results here after review or verification. You can do that individually in the main page.
        </div>
      )}

      {/* Save Changes button OUTSIDE the scrollable table */}
      <button
        className="mb-4 px-4 py-2 bg-primary text-white rounded"
        onClick={handleSaveAll}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {loading && (
        <div>
          <table className="min-w-max border border-gray-300">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-gray-100">Student Name</th>
                {subjectsOrder.map(subject => (
                  <React.Fragment key={subject}>
                    <th className="border px-2 py-1 bg-gray-100 relative" style={{ minWidth: 90 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {subject} CAT
                        <button
                          type="button"
                          title="Remove subject for all students"
                          onClick={() => setConfirmRemoveSubject(subject)}
                          style={{
                            fontWeight: "bold",
                            background: "none",
                            border: "none",
                            cursor: anyReviewedOrVerified ? "not-allowed" : "pointer",
                            color: "#c41414", // black for visibility
                            fontSize: "1.1em",
                            marginLeft: 4,
                            padding: 0,
                            lineHeight: 1,
                            position: "relative",
                            top: 0,
                            right: 0,
                            width: 22,
                            height: 22,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            transition: "background 0.2s"
                          }}
                          className={
                            anyReviewedOrVerified
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-200 focus:bg-gray-300 active:bg-gray-400"
                          }
                          disabled={anyReviewedOrVerified}
                        >
                          &times;
                        </button>
                      </span>
                    </th>
                    <th className="border px-2 py-1 bg-gray-100">{subject} Exam</th>
                    <th className="border px-2 py-1 bg-gray-100">{subject} Total</th>
                    <th className="border px-2 py-1 bg-gray-100">{subject} Grade</th>
                    <th className="border px-2 py-1 bg-gray-100">{subject} Remark</th>
                  </React.Fragment>
                ))}
                <th className="border px-2 py-1 bg-gray-100">Average</th>
                <th className="border px-2 py-1 bg-gray-100">Position</th>
                <th>Handwriting</th>
                <th>Punctuality</th>
                <th>Initiative</th>
                <th>Obedience</th>
                <th>Honesty</th>
                <th>Neatness</th>
                <th>Attentiveness</th>
                <th>Respect</th>
                <th>Attitude</th>
                <th>Creativity</th>
                <th className="border px-2 py-1 bg-gray-100">Deans Remark</th>
                <th className="border px-2 py-1 bg-gray-100">Rectors Remark</th>
                <th className="border px-2 py-1 bg-gray-100">Academic Session</th>
                <th className="border px-2 py-1 bg-gray-100">Next Term Begins</th>
                <th className="border px-2 py-1 bg-gray-100">Rector's Signature</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={subjects.length * 5 + 16}>
                    <div className="animate-pulse h-6 bg-gray-200 rounded my-2"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>Loading students and results...</div>
        </div>
      )}
      {!loading && selectedClass && (
        <div
          style={{
            width: "100%",
            minHeight: 300,
            maxHeight: "70vh",
            overflowX: "auto",
            overflowY: "auto",
            position: "relative"
          }}
        >
          <div style={{ minWidth: "1200px" }}>
            <table className="min-w-max border border-gray-300">

<thead>
  <tr>
    <th className="border px-2 py-1 bg-gray-100">Status</th>
    <th className="border px-2 py-1 bg-gray-100">Student Name</th>
    {subjectsOrder.map(subject => (
      <React.Fragment key={subject}>
        <th className="border px-2 py-1 bg-gray-100 relative" style={{ minWidth: 90 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {subject} CAT
            <button
              type="button"
              title="Remove subject for all students"
              onClick={() => setConfirmRemoveSubject(subject)}
              style={{
                fontWeight: "bold",
                background: "none",
                border: "none",
                cursor: anyReviewedOrVerified ? "not-allowed" : "pointer",
                color: "#a51818", // black for visibility
                fontSize: "1.1em",
                marginLeft: 4,
                padding: 0,
                lineHeight: 1,
                position: "relative",
                top: 0,
                right: 0,
                width: 22,
                height: 22,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                transition: "background 0.2s"
              }}
              className={
                anyReviewedOrVerified
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-200 focus:bg-gray-300 active:bg-gray-400"
              }
              disabled={anyReviewedOrVerified}
            >
              &times;
            </button>
          </span>
        </th>
        <th className="border px-2 py-1 bg-gray-100">{subject} Exam</th>
        <th className="border px-2 py-1 bg-gray-100">{subject} Total</th>
        <th className="border px-2 py-1 bg-gray-100">{subject} Grade</th>
        <th className="border px-2 py-1 bg-gray-100">{subject} Remark</th>
      </React.Fragment>
    ))}
    <th className="border px-2 py-1 bg-gray-100">Average</th>
    <th className="border px-2 py-1 bg-gray-100">Position</th>
    <th>Handwriting</th>
    <th>Punctuality</th>
    <th>Initiative</th>
    <th>Obedience</th>
    <th>Honesty</th>
    <th>Neatness</th>
    <th>Attentiveness</th>
    <th>Respect</th>
    <th>Attitude</th>
    <th>Creativity</th>
    <th className="border px-2 py-1 bg-gray-100">Deans Remark</th>
    <th className="border px-2 py-1 bg-gray-100">Rectors Remark</th>
    <th className="border px-2 py-1 bg-gray-100">Academic Session</th>
    <th className="border px-2 py-1 bg-gray-100">Next Term Begins</th>
    <th className="border px-2 py-1 bg-gray-100">Rector's Signature</th>
  </tr>
</thead>
              <tbody>
                {students.map(student => {
                  const studentResults = editResults[student._id] || {};
                  const overall = studentResults._overall || {};
                  function getKeyRatingLabel(val) {
  val = Number(val);
  if (val === 5) return 'EXCELLENT';
  if (val === 4) return 'VERY GOOD';
  if (val === 3) return 'SATISFACTORY';
  if (val === 2) return 'POOR';
  if (val === 1) return 'VERY POOR';
  return '';
}
                  const studentSubjects = Array.isArray(studentResults.subjects) ? studentResults.subjects : [];
                  const isLocked = resultStatusMap[student._id] === 'reviewed' || resultStatusMap[student._id] === 'verified';
                  return (
                    <tr key={student._id}>
                      {/* Status column */}
                      <td className="border px-2 py-1">
                        {resultStatusMap[student._id] === 'verified' ? (
                          <span className="text-success font-semibold">Verified</span>
                        ) : resultStatusMap[student._id] === 'reviewed' ? (
                          <span className="text-info font-semibold">Reviewed</span>
                        ) : (
                          <span className="text-warning font-semibold">Pending</span>
                        )}
                      </td>
                      {/* Student Name column */}
                      <td className="border px-2 py-1">{student.name || student.fullName || student.username}</td>
                      {subjectsOrder.map(subject => {
                        if (!studentSubjects.includes(subject)) {
                          return (
                            <td
                              key={subject}
                              colSpan={5}
                              className="text-center bg-gray-50 font-bold"
                              style={{ color: "#111", fontWeight: 700 }}
                            >
                              Not Offering
                            </td>
                          );
                        }
                        const subjEdit = editResults[student._id]?.[subject];
                        return (
                          <React.Fragment key={subject}>
                            <td>
                              <input
                                type="number"
                                value={subjEdit?.cat ?? subjEdit?.cat1 ?? ""}
                                onChange={e => handleInputChange(student._id, subject, "cat", e.target.value)}
                                className="w-16 border rounded px-1"
                                disabled={isLocked}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={subjEdit?.exam ?? ""}
                                onChange={e => handleInputChange(student._id, subject, "exam", e.target.value)}
                                className="w-16 border rounded px-1"
                                disabled={isLocked}
                              />
                            </td>
                            <td>{Number(subjEdit?.cat ?? subjEdit?.cat1 ?? 0) + Number(subjEdit?.exam ?? 0)}</td>
                            <td>{subjEdit?.grade ?? ""}</td>
                            <td>{subjEdit?.remark ?? ""}</td>
                          </React.Fragment>
                        );
                      })}
                      <td className="border px-2 py-1">{editResults[student._id]?._overall?.average ?? ""}</td>
                      <td className="border px-2 py-1">{editResults[student._id]?._overall?.position ?? ""}</td>
                      {/* --- Key Rating fields with boxes --- */}
                      {[
                        "handwriting", "punctuality", "initiative", "obedience", "honesty",
                        "neatness", "attentiveness", "respect", "attitude", "creativity"
                      ].map(key => (
                        <td key={key} className="border px-2 py-1">
                          <div className="flex flex-col items-center">
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={editResults[student._id]?._overall?.[key] ?? ""}
                              onChange={e => handleKeyRatingChange(student._id, key, e.target.value)}
                              className="w-12 border rounded px-1"
                              disabled={isLocked}
                            />
                            <span className="text-xs text-muted-foreground mt-1">
                              {getKeyRatingLabel(overall[key])}
                            </span>
                          </div>
                        </td>
                      ))}
                      <td className="border px-2 py-1">
                        {editResults[student._id]?._overall?.teacherComment ?? ""}
                      </td>
                      <td className="border px-2 py-1">
                        {editResults[student._id]?._overall?.headTeacherRemark ?? ""}
                      </td>
                      <td className="border px-2 py-1">{overall.academicYear ?? "2025/2026"}</td>
                      <td className="border px-2 py-1">{overall.nextTerm ?? "18/01/2026"}</td>
                      <td className="border px-2 py-1">
                        <img
                          src="/assets/images/rector-signature.jpg"
                          alt="Rector's Signature"
                          style={{ height: 32, background: "#fff", borderRadius: 4, border: "1px solid #eee", padding: 2 }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
      </table>
    </div>
  </div>
)}

{/* Confirmation Modals */}
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
          Remove for Individual Student
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

{showDeleteConfirmModal && showDeleteConfirmModal.type === 'individual' && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
      <h3 className="font-bold text-lg mb-4">Select Student</h3>
      <p className="mb-4">
        Choose the student for whom you want to remove the subject <br />
        <span className="font-bold text-primary">{showDeleteConfirmModal.subject}</span>
      </p>
      {/* Search bar for filtering students */}
      <input
        type="text"
        placeholder="Search student by name..."
        value={studentSearch}
        onChange={e => setStudentSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded"
      />
      <div className="flex flex-col gap-2 mt-6 max-h-60 overflow-y-auto">
        {students
          .filter(student =>
            (student.name || student.fullName || student.username || "")
              .toLowerCase()
              .includes(studentSearch.toLowerCase())
          )
          .map(student => (
            <button
              key={student._id}
              className="px-4 py-2 bg-info text-white rounded hover:bg-info/80 transition"
              onClick={() => {
                setSelectedStudentForDelete(student._id);
                setShowStudentSelectModal({ subject: showDeleteConfirmModal.subject });
                setShowDeleteConfirmModal(null);
                setConfirmRemoveSubject(null);
              }}
            >
              {student.name || student.fullName || student.username}
            </button>
          ))}
        <button
          className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
          onClick={() => {
            setShowDeleteConfirmModal(null);
            setConfirmRemoveSubject(null);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showStudentSelectModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
      <h3 className="font-bold text-lg mb-4">Confirm Individual Subject Removal</h3>
      <p className="mb-4">
        Are you sure you want to remove the subject <span className="text-primary font-bold">{showStudentSelectModal.subject}</span> for <br />
        <span className="font-bold">{students.find(s => s._id === selectedStudentForDelete)?.name || 'Selected Student'}</span>?
      </p>
      <div className="flex justify-center gap-4 mt-6">
        <button
          className="px-4 py-2 bg-danger text-white rounded hover:bg-danger/80 transition"
          onClick={async () => {
            await handleRemoveSubjectIndividual(selectedStudentForDelete, showStudentSelectModal.subject);
            setShowStudentSelectModal(null);
            setSelectedStudentForDelete(null);
          }}
        >
          Yes, Remove
        </button>
        <button
          className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
          onClick={() => {
            setShowStudentSelectModal(null);
            setSelectedStudentForDelete(null);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showDeleteConfirmModal && showDeleteConfirmModal.type === 'all' && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
      <h3 className="font-bold text-lg mb-4">
        Confirm General Subject Removal
      </h3>
      <p className="mb-4">
        Are you <span className="font-semibold text-red-600">sure</span> you want to{" "}
        <span className="font-bold">
          remove the subject <span className="text-primary">{showDeleteConfirmModal.subject}</span>
        </span>{" "}
        for all students?
      </p>
      <div className="flex justify-center gap-4 mt-6">
        <button
          className="px-4 py-2 bg-warning text-white rounded hover:opacity-90 transition"
          onClick={async () => {
            await handleRemoveSubjectAll(showDeleteConfirmModal.subject);
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

{showSyncModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
      <h3 className="font-bold text-lg mb-4">Sync Status</h3>
      <p className="mb-4">{syncMessage}</p>
      {syncing && (
        <div className="flex justify-center mb-4">
          <svg
            style={{ width: 32, height: 32, margin: "auto", display: "block" }}
            viewBox="0 0 50 50"
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#2563eb"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      )}
      {!syncing && (
        <button
          className="px-4 py-2 bg-primary text-white rounded"
          onClick={() => setShowSyncModal(false)}
        >
          OK
        </button>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default Spreadsheet;
