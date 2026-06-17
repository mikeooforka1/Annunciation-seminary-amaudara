import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TiArrowBackOutline } from "react-icons/ti";
import { FixedSizeList as List } from 'react-window';
import { addToQueue, getQueue, clearQueue } from '../../../utils/offlineQueue';
import { loadOfflineState, saveOfflineState } from '../../../utils/offlineQueue';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ✅ localStorage utility functions for persisting subject order
const STORAGE_KEY_PREFIX = 'spreadsheet_subject_order_';

const saveSubjectOrderToStorage = (classId, term, order) => {
  if (!classId || !term) return;
  const key = `${STORAGE_KEY_PREFIX}${classId}_${term}`;
  try {
    localStorage.setItem(key, JSON.stringify(order));
  } catch (err) {
    console.error('Failed to save subject order to localStorage:', err);
  }
};

const getSubjectOrderFromStorage = (classId, term) => {
  if (!classId || !term) return null;
  const key = `${STORAGE_KEY_PREFIX}${classId}_${term}`;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Failed to load subject order from localStorage:', err);
    return null;
  }
};

const clearSubjectOrderFromStorage = (classId, term) => {
  if (!classId || !term) return;
  const key = `${STORAGE_KEY_PREFIX}${classId}_${term}`;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to clear subject order from localStorage:', err);
  }
};

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
  const [saving, setSaving] = useState(false);
  const [confirmRemoveSubject, setConfirmRemoveSubject] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(null);
  const [editedStudents, setEditedStudents] = useState(new Set());
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(null);
  const [selectedStudentForDelete, setSelectedStudentForDelete] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const saveQueue = React.useRef({});
  const [subjectsOrder, setSubjectsOrder] = useState([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [wasOffline, setWasOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [hasShownOnlineModal, setHasShownOnlineModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showSyncRetryModal, setShowSyncRetryModal] = useState(false);
  const [syncRetryProgress, setSyncRetryProgress] = useState(0);
  const [syncRetryMessage, setSyncRetryMessage] = useState("");

  // --- New state for 3-dot dropdown ---
  const [openDropdownSubject, setOpenDropdownSubject] = useState(null);
  const [showAddSubjectAllModal, setShowAddSubjectAllModal] = useState(false);
  const [showAddSubjectIndividualModal, setShowAddSubjectIndividualModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [addSubjectStudentSearch, setAddSubjectStudentSearch] = useState('');
  const [selectedStudentForAdd, setSelectedStudentForAdd] = useState(null);
  const [showAddSubjectIndividualConfirm, setShowAddSubjectIndividualConfirm] = useState(false);
  const [addSubjectLoading, setAddSubjectLoading] = useState(false);
  const [addSubjectForSubject, setAddSubjectForSubject] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const [resultStatusMap, setResultStatusMap] = useState(location.state?.verifiedStudents || {});

  // ✅ Drag & Drop states for subject reordering
  const [draggedSubject, setDraggedSubject] = useState(null);
  const [dragOverSubject, setDragOverSubject] = useState(null);

  // ✅ Fetch students only (term-independent) - triggered when class changes
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/class/${selectedClass}/all/students`);
      let studentData = await res.json();
      studentData = Array.isArray(studentData)
        ? [...studentData].sort((a, b) =>
            (a.name || a.fullName || a.username || '').localeCompare(
              b.name || b.fullName || b.username || ''
            )
          )
        : [];
      setStudents(studentData);
    } catch (err) {
      setStudents([]);
    }
  };

  // ✅ Fetch results only (term-dependent) - triggered when term or students change
  const fetchResults = async (studentList) => {
    try {
      const fetches = studentList.map(student =>
        fetch(`${API_BASE_URL}/api/results/student/${student._id}/pushed?className=${selectedClass}&term=${selectedTerm}`)
          .then(res => res.json())
          .then(results => ({ studentId: student._id, results }))
      );

      const resultsArr = await Promise.all(fetches);
      const allSubjectsSet = new Set();
      const allSubjectsOrdered = [];
      const map = {};
      const editMap = {};
      const statusMap = {};

      resultsArr.forEach(({ studentId, results }) => {
        map[studentId] = {};
        editMap[studentId] = {};
        const subjects = [];

        results.forEach(r => {
          if (r.subject && r.subject !== "Overall") {
            subjects.push(r.subject);
            map[studentId][r.subject] = r;
            editMap[studentId][r.subject] = {
              cat: r.firstCatScore || "",
              exam: r.examScore || "",
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

        // Build status map from the fetched results
        const subjectResults = results.filter(r => r.subject && r.subject !== "Overall");
        let isReviewed = false;
        let isVerified = false;
        let isPending = false;

        if (subjectResults.length > 0) {
          isReviewed = subjectResults.every(r => r.reviewed === true && r.pending === false);
          isVerified = subjectResults.every(r => r.verified === true && r.pending === false);
          isPending = subjectResults.some(r => r.pending === true);
        }

        if (isVerified) {
          statusMap[studentId] = 'verified';
        } else if (isReviewed) {
          statusMap[studentId] = 'reviewed';
        } else {
          statusMap[studentId] = 'pending';
        }
      });

      Object.keys(editMap).forEach(studentId => {
        const studentSubjects = Object.keys(editMap[studentId]).filter(s => s !== "_overall" && s !== "subjects" && editMap[studentId][s] && !editMap[studentId][s].notOffering);
        allSubjectsOrdered.forEach(subject => {
          if (!studentSubjects.includes(subject)) {
            editMap[studentId][subject] = { notOffering: true };
          }
        });
      });

      // ✅ Load saved subject order from localStorage and apply it
      const savedOrder = getSubjectOrderFromStorage(selectedClass, selectedTerm);
      let finalOrder = allSubjectsOrdered;

      if (savedOrder && savedOrder.length > 0) {
        // Merge: keep saved order for existing subjects, add new subjects at the end
        const orderedSubjects = [];
        const addedSubjects = new Set();

        // First, add subjects in the saved order (if they still exist)
        savedOrder.forEach(subject => {
          if (allSubjectsOrdered.includes(subject)) {
            orderedSubjects.push(subject);
            addedSubjects.add(subject);
          }
        });

        // Then, add any new subjects that weren't in the saved order
        allSubjectsOrdered.forEach(subject => {
          if (!addedSubjects.has(subject)) {
            orderedSubjects.push(subject);
          }
        });

        finalOrder = orderedSubjects;
      }

      setSubjects(allSubjectsOrdered);
      setSubjectsOrder(finalOrder);
      setResultsMap(map);
      setEditResults(editMap);
      setResultStatusMap(statusMap);
      setLoading(false);
    } catch (err) {
      setSubjects([]);
      setSubjectsOrder([]);
      setResultsMap({});
      setEditResults({});
      setResultStatusMap({});
      setLoading(false);
    }
  };

  // ✅ FIRST useEffect: Fetch students when class changes (no term filter)
  useEffect(() => {
    let didSetFromState = false;

    if (
      location.state?.students &&
      location.state?.editResults &&
      location.state?.verifiedStudents
    ) {
      // Use pre-loaded data from verify page
      setStudents(location.state.students);

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

      // ✅ Load saved subject order from localStorage and apply it
      const savedOrder = getSubjectOrderFromStorage(selectedClass, selectedTerm);
      let finalSubjectsOrder = allSubjectsOrdered;

      if (savedOrder && savedOrder.length > 0) {
        // Merge: keep saved order for existing subjects, add new subjects at the end
        const orderedSubjects = [];
        const addedSubjects = new Set();

        // First, add subjects in the saved order (if they still exist)
        savedOrder.forEach(subject => {
          if (allSubjectsOrdered.includes(subject)) {
            orderedSubjects.push(subject);
            addedSubjects.add(subject);
          }
        });

        // Then, add any new subjects that weren't in the saved order
        allSubjectsOrdered.forEach(subject => {
          if (!addedSubjects.has(subject)) {
            orderedSubjects.push(subject);
          }
        });

        finalSubjectsOrder = orderedSubjects;
      }

      setSubjects(allSubjectsOrdered);
      setSubjectsOrder(finalSubjectsOrder);

      const fixedEditResults = {};
      location.state.students.forEach(student => {
        const result = location.state.editResults[student._id] || {};
        fixedEditResults[student._id] = {};

        if (Array.isArray(result.subjects)) {
          fixedEditResults[student._id].subjects = [...result.subjects];
          result.subjects.forEach(subject => {
            fixedEditResults[student._id][subject] = { ...result[subject] };
          });
        }

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
      return;
    }

    if (!selectedClass) return;

    // ✅ Only fetch students if not from location.state
    if (!didSetFromState) {
      setLoading(true);
      fetchData();
    }
  }, [selectedClass, location.state]);  // ✅ REMOVED selectedTerm - only fetch when class changes

  // ✅ SECOND useEffect: Fetch results when term changes (or students changes)
  useEffect(() => {
    if (!navigator.onLine) return;
    if (!selectedClass || !selectedTerm) return;
    if (students.length === 0) return;

    setLoading(true);
    fetchResults(students);
  }, [selectedClass, selectedTerm, students]);  // ✅ Fetches results when term changes

  const handleInputChange = (studentId, subject, field, value) => {
    setEditResults(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      if (!updated[studentId][subject]) updated[studentId][subject] = {};

      let newValue = value;
      if (field === "cat") {
        newValue = value === "" ? "" : Math.max(0, Math.min(Number(value), 30));
        updated[studentId][subject][field] = newValue;
        updated[studentId][subject]["cat1"] = newValue;
      } else if (field === "exam") {
        newValue = value === "" ? "" : Math.max(0, Math.min(Number(value), 70));
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

      saveStudentResults(studentId, updated);

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
      saveStudentResults(studentId, updated);
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

  const handleRemoveSubjectAll = async (subject) => {
    const subjectResultIds = [];
    Object.keys(editResults).forEach(studentId => {
      const subjObj = editResults[studentId]?.[subject];
      if (subjObj && subjObj._id) {
        subjectResultIds.push(subjObj._id);
      }
    });

    const newSubjects = subjects.filter(s => s !== subject);
    const newSubjectsOrder = subjectsOrder.filter(s => s !== subject);

    setEditResults(prevResults => {
      const updatedResults = { ...prevResults };
      Object.keys(updatedResults).forEach(studentId => {
        if (updatedResults[studentId]) {
          const copy = { ...updatedResults[studentId] };
          delete copy[subject];
          Object.keys(copy).forEach(key => {
            if (key.startsWith(`${subject}_`)) {
              delete copy[key];
            }
          });
          if (Array.isArray(copy.subjects)) {
            copy.subjects = copy.subjects.filter(s => s !== subject);
          }
          updatedResults[studentId] = copy;
        }
      });

      // Save offline state after update
      saveOfflineState({
        students,
        editResults: updatedResults,
        subjects: newSubjects,
        subjectsOrder: newSubjectsOrder
      });

      return updatedResults;
    });

    setSubjects(newSubjects);
    setSubjectsOrder(newSubjectsOrder);

    // ✅ Save to localStorage when subject is removed
    saveSubjectOrderToStorage(selectedClass, selectedTerm, newSubjectsOrder);

    if (navigator.onLine) {
      for (const resultId of subjectResultIds) {
        try {
          await fetch(`${API_BASE_URL}/api/results/delete/${resultId}`, {
            method: 'DELETE'
          });
        } catch (err) {}
      }
    } else {
      // Queue each delete for syncing later
      for (const resultId of subjectResultIds) {
        await addToQueue({
          type: 'deleteResult',
          resultId
        });
      }
    }
  };

  const handleRemoveSubjectIndividual = async (studentId, subject) => {
    const subjObj = editResults[studentId]?.[subject];
    const resultId = subjObj?._id;

    setEditResults(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      updated[studentId] = { ...updated[studentId] };
      updated[studentId][subject] = { ...updated[studentId][subject], notOffering: true };
      if (Array.isArray(updated[studentId].subjects)) {
        updated[studentId].subjects = updated[studentId].subjects.filter(s => s !== subject);
      }

      // Save offline state after update
      saveOfflineState({
        students,
        editResults: updated,
        subjects,
        subjectsOrder
      });

      return updated;
    });

    if (resultId) {
      if (navigator.onLine) {
        try {
          await fetch(`${API_BASE_URL}/api/results/delete/${resultId}`, {
            method: 'DELETE'
          });
        } catch (err) {}
      } else {
        await addToQueue({
          type: 'deleteResult',
          resultId
        });
      }
    }
  };

  // --- Add Subject for All Students ---
  const handleAddSubjectAll = async () => {
    const subject = newSubjectName.trim();
    if (!subject) return;
    if (subjects.includes(subject)) {
      alert(`Subject "${subject}" already exists.`);
      return;
    }
    setAddSubjectLoading(true);

    const updatedSubjects = [...subjects, subject];
    const updatedSubjectsOrder = [...subjectsOrder, subject];

    // Update local state immediately
    setEditResults(prev => {
      const updated = { ...prev };
      students.forEach(student => {
        if (!updated[student._id]) updated[student._id] = {};
        updated[student._id] = { ...updated[student._id] };
        updated[student._id][subject] = {
          cat: "",
          exam: "",
          grade: "",
          remark: "",
          _id: null,
          notOffering: false
        };
        if (Array.isArray(updated[student._id].subjects)) {
          if (!updated[student._id].subjects.includes(subject)) {
            updated[student._id].subjects = [...updated[student._id].subjects, subject];
          }
        } else {
          updated[student._id].subjects = [subject];
        }
      });

      saveOfflineState({
        students,
        editResults: updated,
        subjects: updatedSubjects,
        subjectsOrder: updatedSubjectsOrder
      });

      return updated;
    });

    setSubjects(updatedSubjects);
    setSubjectsOrder(updatedSubjectsOrder);

    // ✅ Save to localStorage when subject is added
    saveSubjectOrderToStorage(selectedClass, selectedTerm, updatedSubjectsOrder);

    if (navigator.onLine) {
      try {
        const setRes = await fetch(`${API_BASE_URL}/api/class-subjects/set`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            className: selectedClass,
            term: selectedTerm,
            subjects: updatedSubjects
          }),
        });
        if (!setRes.ok) {
          const err = await setRes.json();
          alert(`Failed to update class subjects: ${err.error || 'Unknown error'}`);
          setAddSubjectLoading(false);
          return;
        }

        let failCount = 0;
        for (const student of students) {
          const addRes = await fetch(`${API_BASE_URL}/api/class-subjects/add-subject-individual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId: student._id,
              className: selectedClass,
              term: selectedTerm,
              subject
            }),
          });
          if (!addRes.ok) {
            const errData = await addRes.json().catch(() => ({}));
            if (errData.error && !errData.error.includes('already exists')) {
              failCount++;
              console.error(`Failed to add subject for student ${student._id}:`, errData.error);
            }
          }
        }

        if (failCount > 0) {
          alert(`Subject added but failed for ${failCount} student(s). Check console for details.`);
        }

        // Refresh to get _id values from backend
        setLoading(true);
        await fetchData();
      } catch (err) {
        console.error('Error adding subject for all:', err);
        alert('An error occurred while adding the subject.');
      }
    } else {
      // Queue for syncing later
      await addToQueue({
        type: 'addSubjectAll',
        className: selectedClass,
        term: selectedTerm,
        subject,
        studentIds: students.map(s => s._id)
      });
    }

    setNewSubjectName('');
    setShowAddSubjectAllModal(false);
    setOpenDropdownSubject(null);
    setAddSubjectLoading(false);
  };


// Add this function inside the Spreadsheet component
const handleExportPDF = async () => {
  setIsExportingPDF(true);
  try {
    const response = await fetch(`${API_BASE_URL}/api/results/export-results-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: selectedClass,
        term: selectedTerm,
        studentIds: students.map(s => s._id)
      })
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedClass}_${selectedTerm}_Results.pdf`;
    a.click();
    
    setIsExportingPDF(false);
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export PDF');
    setIsExportingPDF(false);
  }
};
  // --- Add Subject for Individual Student ---
  const handleAddSubjectIndividual = async () => {
    const subject = addSubjectForSubject || newSubjectName.trim();
    if (!subject || !selectedStudentForAdd) return;
    setAddSubjectLoading(true);

    const needsNewSubjectColumn = !subjects.includes(subject);
    const updatedSubjects = needsNewSubjectColumn ? [...subjects, subject] : subjects;
    const updatedSubjectsOrder = needsNewSubjectColumn ? [...subjectsOrder, subject] : subjectsOrder;

    // Update local state immediately
    setEditResults(prev => {
      const updated = { ...prev };
      if (!updated[selectedStudentForAdd]) updated[selectedStudentForAdd] = {};
      updated[selectedStudentForAdd] = { ...updated[selectedStudentForAdd] };
      updated[selectedStudentForAdd][subject] = {
        cat: "",
        exam: "",
        grade: "",
        remark: "",
        _id: null,
        notOffering: false
      };
      if (Array.isArray(updated[selectedStudentForAdd].subjects)) {
        if (!updated[selectedStudentForAdd].subjects.includes(subject)) {
          updated[selectedStudentForAdd].subjects = [...updated[selectedStudentForAdd].subjects, subject];
        }
      } else {
        updated[selectedStudentForAdd].subjects = [subject];
      }

      // If new subject column, mark all other students as notOffering
      if (needsNewSubjectColumn) {
        students.forEach(student => {
          if (student._id !== selectedStudentForAdd) {
            if (!updated[student._id]) updated[student._id] = {};
            updated[student._id] = { ...updated[student._id] };
            if (!updated[student._id][subject]) {
              updated[student._id][subject] = { notOffering: true };
            }
          }
        });
      }

      // Save offline state after update
      saveOfflineState({
        students,
        editResults: updated,
        subjects: updatedSubjects,
        subjectsOrder: updatedSubjectsOrder
      });

      return updated;
    });

    if (needsNewSubjectColumn) {
      setSubjects(updatedSubjects);
      setSubjectsOrder(updatedSubjectsOrder);
      // ✅ Save to localStorage when new subject is added for individual
      saveSubjectOrderToStorage(selectedClass, selectedTerm, updatedSubjectsOrder);
    }

    if (navigator.onLine) {
      try {
        if (needsNewSubjectColumn) {
          const setRes = await fetch(`${API_BASE_URL}/api/class-subjects/set`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              className: selectedClass,
              term: selectedTerm,
              subjects: updatedSubjects
            }),
          });
          if (!setRes.ok) {
            const err = await setRes.json();
            alert(`Failed to update class subjects: ${err.error || 'Unknown error'}`);
            setAddSubjectLoading(false);
            return;
          }
        }

        const addRes = await fetch(`${API_BASE_URL}/api/class-subjects/add-subject-individual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selectedStudentForAdd,
            className: selectedClass,
            term: selectedTerm,
            subject
          }),
        });

        if (!addRes.ok) {
          const errData = await addRes.json().catch(() => ({}));
          alert(`Failed to add subject: ${errData.error || 'Unknown error'}`);
          setAddSubjectLoading(false);
          return;
        }

        // Refresh to get _id values from backend
        setLoading(true);
        await fetchData();
      } catch (err) {
        console.error('Error adding subject for individual:', err);
        alert('An error occurred while adding the subject.');
      }
    } else {
      // Queue for syncing later
      await addToQueue({
        type: 'addSubjectIndividual',
        className: selectedClass,
        term: selectedTerm,
        subject,
        studentId: selectedStudentForAdd,
        needsNewSubjectColumn,
        allSubjects: updatedSubjects
      });
    }

    setNewSubjectName('');
    setSelectedStudentForAdd(null);
    setShowAddSubjectIndividualConfirm(false);
    setShowAddSubjectIndividualModal(false);
    setAddSubjectForSubject(null);
    setOpenDropdownSubject(null);
    setAddSubjectLoading(false);
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
            cat: r.firstCatScore || "",
            exam: r.examScore || "",
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

    saveQueue.current[studentId] = (saveQueue.current[studentId] || Promise.resolve()).then(async () => {
      for (const subject of subjects) {
        const subjEdit = results[studentId]?.[subject];
        if (subjEdit && !subjEdit.notOffering && subjEdit._id) {
          await fetch(`${API_BASE_URL}/api/results/update/${subjEdit._id}`, {
            method: 'PUT',
            body: JSON.stringify({
              firstCatScore: Number(subjEdit.cat ?? subjEdit.cat1 ?? 0),
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
      await clearQueue();
    }).catch(() => {});
  }

  const handleSaveAll = async () => {
    setSaving(true);
    for (const studentId of editedStudents) {
      for (const subject of subjects) {
        const subjEdit = editResults[studentId][subject];
        if (subjEdit && !subjEdit.notOffering && subjEdit._id) {
          await fetch(`${API_BASE_URL}/api/results/update/${subjEdit._id}`, {
            method: 'PUT',
            body: JSON.stringify({
              firstCatScore: Number(subjEdit.cat ?? subjEdit.cat1 ?? 0),
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
    await fetchUpdatedResultsForEdited();
    setEditedStudents(new Set());
    alert("All changes saved!");
  };

  useEffect(() => {
  async function syncQueuedActions(queue) {
    setSyncProgress(0);
   // Collect subjects added offline so we can sync their scores after
    const addedSubjects = [];
    const total = queue.length;
    let done = 0;
    let syncFailed = false;

    for (const action of queue) {
      try {
        if (action.type === 'saveStudentResults') {
          for (const subject of action.subjects) {
            const subjEdit = action.results[action.studentId]?.[subject];
            if (subjEdit && !subjEdit.notOffering && subjEdit._id) {
              await fetch(`${API_BASE_URL}/api/results/update/${subjEdit._id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  firstCatScore: Number(subjEdit.cat ?? subjEdit.cat1 ?? 0),
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
        } else if (action.type === 'deleteResult') {
          await fetch(`${API_BASE_URL}/api/results/delete/${action.resultId}`, {
            method: 'DELETE'
          });
        } else if (action.type === 'addSubjectAll') {
          const currentSubjectsRes = await fetch(`${API_BASE_URL}/api/class-subjects/${action.className}?term=${action.term}`);
          const currentSubjects = await currentSubjectsRes.json();
          if (!currentSubjects.includes(action.subject)) {
            await fetch(`${API_BASE_URL}/api/class-subjects/set`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                className: action.className,
                term: action.term,
                subjects: [...currentSubjects, action.subject]
              }),
            });
          }
          for (const studentId of action.studentIds) {
            await fetch(`${API_BASE_URL}/api/class-subjects/add-subject-individual`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId,
                className: action.className,
                term: action.term,
                subject: action.subject
              }),
            }).catch(() => {});
          }
          // Track for score sync
          addedSubjects.push({
            subject: action.subject,
            studentIds: action.studentIds,
            className: action.className,
            term: action.term
          });
        } else if (action.type === 'addSubjectIndividual') {
          if (action.needsNewSubjectColumn) {
            const currentSubjectsRes = await fetch(`${API_BASE_URL}/api/class-subjects/${action.className}?term=${action.term}`);
            const currentSubjects = await currentSubjectsRes.json();
            if (!currentSubjects.includes(action.subject)) {
              await fetch(`${API_BASE_URL}/api/class-subjects/set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  className: action.className,
                  term: action.term,
                  subjects: [...currentSubjects, action.subject]
                }),
              });
            }
          }
          await fetch(`${API_BASE_URL}/api/class-subjects/add-subject-individual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId: action.studentId,
              className: action.className,
              term: action.term,
              subject: action.subject
            }),
          }).catch(() => {});
          // Track for score sync
          addedSubjects.push({
            subject: action.subject,
            studentIds: [action.studentId],
            className: action.className,
            term: action.term
          });
        }
      } catch (err) {
        syncFailed = true;
        console.error('Error syncing queued action:', err);
        break;
      }
      done++;
      setSyncProgress(Math.round((done / total) * 100));
    }

    // After all add-subject actions, sync offline scores for newly added subjects
    if (addedSubjects.length > 0) {
      const offlineState = await loadOfflineState();
      const offlineEditResults = offlineState?.editResults || editResults;

      for (const added of addedSubjects) {
        for (const studentId of added.studentIds) {
          const offlineSubjEdit = offlineEditResults[studentId]?.[added.subject];
          if (
            offlineSubjEdit &&
            !offlineSubjEdit.notOffering &&
            (Number(offlineSubjEdit.cat ?? offlineSubjEdit.cat1 ?? 0) !== 0 ||
             Number(offlineSubjEdit.exam ?? 0) !== 0)
          ) {
            try {
              const resArr = await fetch(
                `${API_BASE_URL}/api/results/student/${studentId}/pushed?className=${added.className}&term=${added.term}`
              ).then(r => r.json());

              const matchingResult = resArr.find(r => r.subject === added.subject);
              if (matchingResult && matchingResult._id) {
                const cat = Number(offlineSubjEdit.cat ?? offlineSubjEdit.cat1 ?? 0);
                const exam = Number(offlineSubjEdit.exam ?? 0);
                const total = cat + exam;
                await fetch(`${API_BASE_URL}/api/results/update/${matchingResult._id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    firstCatScore: cat,
                    examScore: exam,
                    grade: getGrade(total),
                    remark: getRemark(getGrade(total)),
                    reviewed: false,
                    pending: true,
                    verified: false
                  }),
                  headers: { 'Content-Type': 'application/json' }
                });
              }
            } catch (err) {
              console.error(`Error syncing scores for ${added.subject} / ${studentId}:`, err);
            }
          }
        }
      }
    }

    if (!syncFailed) {
      await clearQueue();
      setSyncMessage("Offline changes have been synced to the online database.");
      await fetchData();
      setSyncing(false);
      setWasOffline(false);
      setShowSyncRetryModal(false);
    } else {
      setSyncMessage("Sync interrupted due to connection issues. Your changes are safe and will sync automatically when the connection is restored.");
      setSyncing(false);
      setShowSyncRetryModal(true);
      setSyncRetryProgress(syncProgress);
      setSyncRetryMessage("Sync failed due to poor or lost connection. Progress: " + syncProgress + "%. Retrying when connection is restored...");
      // Do NOT clear the queue, so it will retry on next connection
    }
  }

  async function checkUnsyncedQueue() {
    const queue = await getQueue();
    const hasUnsyncedChanges = queue && queue.length > 0;

    if (hasUnsyncedChanges && navigator.onLine) {
      setSyncMessage("Unsynced offline changes detected. Syncing to online database...");
      setShowSyncModal(true);
      setSyncing(true);

      await syncQueuedActions(queue);
    } else if (navigator.onLine && !hasUnsyncedChanges) {
      setShowSyncModal(false);
      setSyncing(false);
      setShowSyncRetryModal(false);
    }
  }

  if (navigator.onLine) {
    checkUnsyncedQueue();
  }

  window.addEventListener('online', checkUnsyncedQueue);

  return () => window.removeEventListener('online', checkUnsyncedQueue);
}, []);

// ...existing code...

  useEffect(() => {
    function handleOffline() {
      setSyncMessage("You are now working offline. Changes will sync when online.");
      setShowSyncModal(true);
      setWasOffline(true);
    }

    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setWasOffline(true);
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

  useEffect(() => {
    if (students.length > 0) {
      const studentTotals = students.map(student => {
        const studentId = student._id;
        let totalScore = 0;
        let subjectCount = 0;
        const result = editResults[student._id];
        if (result) {
          subjectsOrder.forEach(subject => {
            const subjEdit = result[subject];
            if (subjEdit && !subjEdit.notOffering) {
              const cat = Number(subjEdit.cat ?? subjEdit.cat1 ?? 0);
              const exam = Number(subjEdit.exam ?? 0);
              if (cat !== 0 || exam !== 0) {
                totalScore += cat + exam;
                subjectCount += 1;
              }
            }
          });
        }
        if (subjectCount === 0 && result) {
          subjectCount = subjectsOrder.filter(
            s => result[s] && !result[s].notOffering
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

      const sorted = [...studentTotals].sort((a, b) => b.average - a.average);

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
          if (
            updated[studentId]._overall?.manualPosition !== true
          ) {
            if (!updated[studentId]._overall) updated[studentId]._overall = {};
            updated[studentId] = { ...updated[studentId] };
            updated[studentId]._overall = { ...updated[studentId]._overall };
            updated[studentId]._overall.average = autoAverage;
            updated[studentId]._overall.position = autoPosition;
            updated[studentId]._overall.teacherComment = getDeansRemark(autoAverage);
            updated[studentId]._overall.headTeacherRemark = getRectorsRemark(autoAverage);
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
    }
  }, [students, editResults, subjectsOrder]);

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

  // ✅ Drag & Drop Handlers for Subject Reordering
  const handleDragStart = (subject) => {
    setDraggedSubject(subject);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (subject) => {
    if (draggedSubject && draggedSubject !== subject) {
      setDragOverSubject(subject);
    }
  };

  const handleDragLeave = () => {
    setDragOverSubject(null);
  };

  const handleDropSubject = (targetSubject) => {
    if (!draggedSubject || draggedSubject === targetSubject) {
      setDraggedSubject(null);
      setDragOverSubject(null);
      return;
    }

    // Reorder subjects in subjectsOrder
    const draggedIndex = subjectsOrder.indexOf(draggedSubject);
    const targetIndex = subjectsOrder.indexOf(targetSubject);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedSubject(null);
      setDragOverSubject(null);
      return;
    }

    const newOrder = [...subjectsOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSubject);

    setSubjectsOrder(newOrder);
    setDraggedSubject(null);
    setDragOverSubject(null);

    // ✅ Save to localStorage for persistence across page refresh/navigation
    saveSubjectOrderToStorage(selectedClass, selectedTerm, newOrder);

    // Also save to offline state
    saveOfflineState({
      students,
      editResults,
      subjects,
      subjectsOrder: newOrder
    });
  };
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

  const anyReviewedOrVerified = students.some(
    s => resultStatusMap[s._id] === 'reviewed' || resultStatusMap[s._id] === 'verified'
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (openDropdownSubject && !e.target.closest('.subject-dropdown')) {
        setOpenDropdownSubject(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownSubject]);

  const [resetLoading, setResetLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showOfflineResetModal, setShowOfflineResetModal] = useState(false);

  // --- Reset All Results to Pending ---
  const handleResetToPending = async () => {
    setShowResetConfirmModal(false);
    setResetLoading(true);

    try {
      // Use the new batch endpoint for efficiency
      await fetch(`${API_BASE_URL}/api/results/reset-all-to-pending`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: selectedClass,
          term: selectedTerm
        })
      });

      // Update the local status map immediately
      const updatedStatusMap = {};
      students.forEach(student => {
        updatedStatusMap[student._id] = 'pending';
      });
      setResultStatusMap(updatedStatusMap);

      alert('All results have been reset to pending. You can now edit.');

      // Refresh data to reflect changes - reload editResults from backend
      setLoading(true);
      await fetchData();
      await fetchResults(students);
    } catch (err) {
      console.error('Error resetting to pending:', err);
      alert('An error occurred while resetting results.');
    }

    setResetLoading(false);
  };
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

      {anyReviewedOrVerified && (
  <div className="mb-4 p-2 rounded bg-yellow-100 text-yellow-800 font-semibold text-center">
    You cannot modify results here after review or verification. You can do that individually in the main page.
    <br />
    <button
      className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
      onClick={() => {
        if (!navigator.onLine) {
          setShowOfflineResetModal(true);
        } else {
          setShowResetModal(true);
        }
      }}
      disabled={resetLoading}
    >
      {resetLoading ? 'Resetting...' : '🔄 Reset All to Pending (Enable Editing)'}
    </button>
  </div>
)}

{/* Updated button code */}
<button
  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ml-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
  onClick={handleExportPDF}
  disabled={isExportingPDF || loading}
  title={isExportingPDF ? "Exporting PDF..." : "Export spreadsheet to PDF"}
>
  {isExportingPDF ? (
    <>
      <span className="inline-block animate-spin mr-2">⏳</span>
      Exporting...
    </>
  ) : (
    "📄 Export to PDF"
  )}
</button> 
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
                    <th className="border px-2 py-1 bg-gray-100">{subject} CAT</th>
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
  <div id="printable-table">
    <div
      style={{
        width: "100%",
        minHeight: 300,
        height: "calc(100vh - 220px)",
        overflowX: "auto",
        overflowY: "auto",
        position: "relative"
      }}
    >
      <div style={{ minWidth: "1200px" }}>
        <table className="min-w-max border border-gray-300">
                           <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  <th className="border px-2 py-1 bg-gray-100" style={{ position: "sticky", left: 0, zIndex: 20 }}>Status</th>
                  <th className="border px-2 py-1 bg-gray-100" style={{ position: "sticky", left: 60, zIndex: 20 }}>Student Name</th>
                  {subjectsOrder.map(subject => (
                    <React.Fragment key={subject}>
                      <th 
                        className={`border px-2 py-1 bg-gray-100 relative subject-dropdown cursor-move transition-all ${
                          dragOverSubject === subject ? 'border-l-4 border-l-blue-500' : ''
                        }`}
                        style={{ minWidth: 90 }}
                        draggable
                        onDragStart={() => handleDragStart(subject)}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(subject)}
                        onDragLeave={handleDragLeave}
                        onDrop={() => handleDropSubject(subject)}
                        title="Drag to reorder subjects"
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {subject} CAT
                          <button
                            type="button"
                            title="Subject options"
                            className="subject-dropdown-trigger"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownSubject(openDropdownSubject === subject ? null : subject);
                            }}
                            disabled={anyReviewedOrVerified}
                          >
                            ⋮
                          </button>
                          {openDropdownSubject === subject && (
                            <div
                              className="subject-dropdown"
                              style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                zIndex: 100,
                                background: "#fff",
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                minWidth: 180,
                                padding: "4px 0"
                              }}
                            >
                              <button
                                type="button"
                                className="subject-dropdown-btn add-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewSubjectName('');
                                  setShowAddSubjectAllModal(true);
                                  setOpenDropdownSubject(null);
                                }}
                              >
                                ➕ Add Subject
                              </button>
                              {students.some(student => {
                                const studentSubjects = editResults[student._id]?.subjects || [];
                                return !studentSubjects.includes(subject);
                              }) && (
                                <button
                                  type="button"
                                  className="subject-dropdown-btn add-individual-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAddSubjectForSubject(subject);
                                    setAddSubjectStudentSearch('');
                                    setSelectedStudentForAdd(null);
                                    setShowAddSubjectIndividualModal(true);
                                    setOpenDropdownSubject(null);
                                  }}
                                >
                                  ➕ Add "{subject}" for Individual
                                </button>
                              )}
                              <button
                                type="button"
                                className="subject-dropdown-btn delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmRemoveSubject(subject);
                                  setOpenDropdownSubject(null);
                                }}
                              >
                                🗑️ Delete Subject
                              </button>
                            </div>
                          )}
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
                      <td className="border px-2 py-1" style={{ position: "sticky", left: 0, zIndex: 19, backgroundColor: "#fff" }}>
                        {resultStatusMap[student._id] === 'verified' ? (
                          <span className="text-success font-semibold">Verified</span>
                        ) : resultStatusMap[student._id] === 'reviewed' ? (
                          <span className="text-info font-semibold">Reviewed</span>
                        ) : (
                          <span className="text-warning font-semibold">Pending</span>
                        )}
                      </td>
                      <td className="border px-2 py-1" style={{ position: "sticky", left: 60, zIndex: 19, backgroundColor: "#fff" }}>
                        {student.name || student.fullName || student.username}
                      </td>
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
                      {([
                        "handwriting", "punctuality", "initiative", "obedience", "honesty",
                        "neatness", "attentiveness", "respect", "attitude", "creativity"
                      ]).map(key => (
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
  </div>
)}

      {/* --- Add Subject for All Modal --- */}
      {showAddSubjectAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-lg mb-4">Add New Subject</h3>
            <p className="mb-2">Enter the new subject name to add for all students.</p>
            <input
              type="text"
              placeholder="Enter new subject name"
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded"
            />
            <div className="flex flex-col gap-2 mt-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
                onClick={handleAddSubjectAll}
                disabled={!newSubjectName.trim() || addSubjectLoading}
              >
                {addSubjectLoading ? "Adding..." : "Add for All Students"}
              </button>
              <button
                className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
                onClick={() => {
                  setShowAddSubjectAllModal(false);
                  setNewSubjectName('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Add Subject for Individual: Select Student Modal --- */}
      {showAddSubjectIndividualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-lg mb-4">Select Student</h3>
            <p className="mb-4">
              Choose the student for whom you want to add the subject <br />
              <span className="font-bold text-primary">{addSubjectForSubject || newSubjectName}</span>
            </p>
            <input
              type="text"
              placeholder="Search student by name..."
              value={addSubjectStudentSearch}
              onChange={e => setAddSubjectStudentSearch(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded"
            />
            <div className="flex flex-col gap-2 mt-2 max-h-60 overflow-y-auto">
              {students
                .filter(student => {
                  const subjectToAdd = addSubjectForSubject || newSubjectName.trim();
                  const studentSubjects = editResults[student._id]?.subjects || [];
                  return !studentSubjects.includes(subjectToAdd);
                })
                .filter(student =>
                  (student.name || student.fullName || student.username || "")
                    .toLowerCase()
                    .includes(addSubjectStudentSearch.toLowerCase())
                )
                .map(student => (
                  <button
                    key={student._id}
                    className="px-4 py-2 bg-info text-white rounded hover:bg-info/80 transition"
                    onClick={() => {
                      setSelectedStudentForAdd(student._id);
                      setShowAddSubjectIndividualModal(false);
                      setShowAddSubjectIndividualConfirm(true);
                    }}
                  >
                    {student.name || student.fullName || student.username}
                  </button>
                ))}
              {students
                .filter(student => {
                  const subjectToAdd = addSubjectForSubject || newSubjectName.trim();
                  const studentSubjects = editResults[student._id]?.subjects || [];
                  return !studentSubjects.includes(subjectToAdd);
                })
                .filter(student =>
                  (student.name || student.fullName || student.username || "")
                    .toLowerCase()
                    .includes(addSubjectStudentSearch.toLowerCase())
                ).length === 0 && (
                <p className="text-gray-500 italic py-2">All students already offer this subject.</p>
              )}
              <button
                className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
                onClick={() => {
                  setShowAddSubjectIndividualModal(false);
                  setNewSubjectName('');
                  setAddSubjectForSubject(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Add Subject for Individual: Confirm Modal --- */}
      {showAddSubjectIndividualConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-lg mb-4">Confirm Add Subject</h3>
            <p className="mb-4">
              Are you sure you want to add the subject <span className="text-primary font-bold">{addSubjectForSubject || newSubjectName}</span> for <br />
              <span className="font-bold">{students.find(s => s._id === selectedStudentForAdd)?.name || students.find(s => s._id === selectedStudentForAdd)?.fullName || students.find(s => s._id === selectedStudentForAdd)?.username || 'Selected Student'}</span>?
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={handleAddSubjectIndividual}
                disabled={addSubjectLoading}
              >
                {addSubjectLoading ? "Adding..." : "Yes, Add"}
              </button>
              <button
                className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
                onClick={() => {
                  setShowAddSubjectIndividualConfirm(false);
                  setSelectedStudentForAdd(null);
                  setNewSubjectName('');
                  setAddSubjectForSubject(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Subject Modals (existing logic, unchanged) --- */}
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
        <div className="flex flex-col items-center mb-4 w-full">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${syncProgress}%` }}
            ></div>
          </div>
          <span className="text-sm">{syncProgress}%</span>
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
 {/* --- Reset to Pending: First Confirmation Modal --- */}
  {showResetModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h3 className="font-bold text-lg mb-4 text-red-600">⚠️ Reset All Results</h3>
        <p className="mb-4">
          Are you sure you want to reset <span className="font-bold">all results</span> back to <span className="font-bold text-yellow-600">Pending</span>?
          <br /><br />
          This will <span className="font-semibold text-red-600">remove</span> all reviewed and verified statuses for <span className="font-bold">{selectedClass.toUpperCase()}</span>.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
            onClick={() => {
              setShowResetModal(false);
              setShowResetConfirmModal(true);
            }}
          >
            Yes, Continue
          </button>
          <button
            className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
            onClick={() => setShowResetModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* --- Reset to Pending: Second (Final) Confirmation Modal --- */}
  {showResetConfirmModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h3 className="font-bold text-lg mb-4 text-red-700">🔴 Final Confirmation</h3>
        <p className="mb-4">
          This action <span className="font-bold text-red-600">cannot be undone</span>.
          <br /><br />
          All <span className="font-bold">reviewed</span> and <span className="font-bold">verified</span> results for <span className="font-bold">{selectedClass.toUpperCase()}</span> will be set back to <span className="font-bold text-yellow-600">Pending</span>.
          <br /><br />
          Are you <span className="font-bold text-red-600">absolutely sure</span>?
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition font-semibold"
            onClick={handleResetToPending}
            disabled={resetLoading}
          >
            {resetLoading ? 'Resetting...' : 'Yes, Reset All to Pending'}
          </button>
          <button
            className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 transition"
            onClick={() => setShowResetConfirmModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* --- Reset to Pending: Offline Not Allowed Modal --- */}
  {showOfflineResetModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h3 className="font-bold text-lg mb-4 text-red-600">Not Available Offline</h3>
        <p className="mb-4">
          Resetting all results to pending is <span className="font-bold text-red-600">only available online</span> for safety and data integrity.
          <br /><br />
          Please connect to the internet and try again.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
          onClick={() => setShowOfflineResetModal(false)}
        >
          OK
        </button>
      </div>
    </div>
  )}
  {showSyncRetryModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
      <h3 className="font-bold text-lg mb-4 text-red-600">Sync Failed</h3>
      <p className="mb-4">{syncRetryMessage}</p>
      <div className="flex flex-col items-center mb-4 w-full">
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-red-600 h-4 rounded-full transition-all"
            style={{ width: `${syncRetryProgress}%` }}
          ></div>
        </div>
        <span className="text-sm">{syncRetryProgress}%</span>
      </div>
      <p className="mb-2 text-gray-700">
        The sync will retry automatically when your connection improves.
      </p>
      <button
        className="px-4 py-2 bg-primary text-white rounded"
        onClick={() => setShowSyncRetryModal(false)}
      >
        OK
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default Spreadsheet;