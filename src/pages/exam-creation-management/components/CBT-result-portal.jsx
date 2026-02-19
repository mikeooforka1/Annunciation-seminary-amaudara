import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CBTResultPortal = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);
  const [teacherClass, setTeacherClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [editResults, setEditResults] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [subjectsOrder, setSubjectsOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedStudents, setEditedStudents] = useState(new Set());
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [subjectInputError, setSubjectInputError] = useState("");
  const saveQueue = useRef({});
  const academicYear = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
  const sessionDate = new Date().toLocaleDateString();
  const sessionDay = new Date().toLocaleString('en-US', { weekday: 'long' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Get teacher class from localStorage (like spreadsheet)
  useEffect(() => {
    const stored = localStorage.getItem('teacherData');
    if (stored) {
      const parsed = JSON.parse(stored);
      setTeacherData(parsed);
      if (parsed.className) setTeacherClass(parsed.className);
    }
  }, []);

  
   

  // Always show subject modal first on page landing, even if subjects are saved
  useEffect(() => {
    if (teacherClass && selectedTerm) {
      setShowSubjectModal(true);
    }
  }, [teacherClass, selectedTerm]);

  // Always show subject modal when term is selected, and fetch subjects
  useEffect(() => {
  const saved = localStorage.getItem('cbtPortalState');
  if (!saved && teacherClass && selectedTerm) {
    setSubjects([]);
    setSubjectsOrder([]);
    setShowSubjectModal(true);

    // Fetch CBT subjects from backend
    fetch(`${API_BASE_URL}/api/class-subjects/cbt/${encodeURIComponent(teacherClass)}?term=${encodeURIComponent(selectedTerm)}`)
      .then(res => res.json())
      .then(subjects => {
        if (Array.isArray(subjects) && subjects.length > 0) {
          setSubjects(subjects);
          setSubjectsOrder(subjects);
        }
      });
  }
}, [teacherClass, selectedTerm]);

  // Fetch students and results ONLY if subjects exist and modal is closed
  useEffect(() => {
    if (!teacherClass || !selectedTerm || subjects.length === 0 || showSubjectModal) return;
    setLoading(true);

    const fetchStudentsAndResults = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/user/class/${encodeURIComponent(teacherClass)}/${selectedTerm}/students`
        );
        if (!res.ok) throw new Error("Failed to fetch students");
        let studentData = await res.json();
        studentData = Array.isArray(studentData)
          ? [...studentData].sort((a, b) =>
              (a.name || a.fullName || a.username || '').localeCompare(
                b.name || b.fullName || b.username || ''
              )
            )
          : [];
        setStudents(studentData);

        // Fetch ALL results (draft and pushed) for each student
        const fetches = studentData.map(student =>
          fetch(`${API_BASE_URL}/api/cbt-results/draft/${student._id}?className=${teacherClass}&term=${selectedTerm}`)
            .then(res => res.json())
            .then(results => ({ studentId: student._id, results }))
        );

        const resultsArr = await Promise.all(fetches);
        const allSubjectsOrdered = [...subjects];
        const editMap = {};

        resultsArr.forEach(({ studentId, results }) => {
          editMap[studentId] = {};
          results.forEach(r => {
            if (r.subject && r.subject !== "Overall") {
              editMap[studentId][r.subject] = {
                exam: r.score ?? "",
                grade: r.grade ?? "",
                remark: r.remark ?? "",
                _id: r._id,
                notOffering: false
              };
            }
          });
        });

        setSubjectsOrder(allSubjectsOrdered);
        setEditResults(editMap);
        setLoading(false);
      } catch (err) {
        setStudents([]);
        setEditResults({});
        setLoading(false);
      }
    };

    fetchStudentsAndResults();
  }, [teacherClass, selectedTerm, subjects, showSubjectModal]);

  // Add subject in modal (POST to CBT endpoint)
  const handleAddSubject = async () => {
    const subject = newSubject.trim();
    if (!subject) {
      setSubjectInputError("Subject cannot be empty.");
      return;
    }
    if (subjects.includes(subject)) {
      setSubjectInputError("Subject already exists.");
      return;
    }
    const updatedSubjects = [...subjects, subject];
    setSubjectLoading(true);
    await fetch(`${API_BASE_URL}/api/class-subjects/cbt/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: teacherClass,
        term: selectedTerm,
        subjects: updatedSubjects
      }),
    });
    setSubjects(updatedSubjects);
    setSubjectsOrder(updatedSubjects);
    setNewSubject("");
    setSubjectInputError("");
    setSubjectLoading(false);
  };

  // Remove subject in modal (POST to CBT endpoint)
  const handleRemoveSubject = async (subject) => {
    const updatedSubjects = subjects.filter(s => s !== subject);
    setSubjectLoading(true);
    await fetch(`${API_BASE_URL}/api/class-subjects/cbt/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: teacherClass,
        term: selectedTerm,
        subjects: updatedSubjects
      }),
    });
    setSubjects(updatedSubjects);
    setSubjectsOrder(updatedSubjects);
    setSubjectLoading(false);
  };

  // Handle input change for CBT exam score
  const handleInputChange = (studentId, subject, field, value) => {
    setEditResults(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      if (!updated[studentId][subject]) updated[studentId][subject] = {};
      updated[studentId][subject][field] = value;

      if (field === "exam") {
        const score = Number(value);
        updated[studentId][subject].grade = getGrade(score);
        updated[studentId][subject].remark = getRemark(updated[studentId][subject].grade);
      }
      saveStudentResults(studentId, updated);
      return updated;
    });
    setEditedStudents(prev => new Set(prev).add(studentId));
  };

  // Save logic (same as spreadsheet)
  const saveStudentResults = async (studentId, nextEditResults = null) => {
    const results = nextEditResults || editResults;
    if (!saveQueue.current[studentId]) saveQueue.current[studentId] = Promise.resolve();

    saveQueue.current[studentId] = saveQueue.current[studentId].then(async () => {
      // Move these inside so they're always up-to-date
      const academicYear = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
      const sessionDate = new Date().toLocaleDateString();
      const sessionDay = new Date().toLocaleString('en-US', { weekday: 'long' });

      const studentResults = results[studentId] || {};
      const resultsArr = subjects.map(subject => {
        const subjEdit = studentResults[subject] || {};
        return {
          subject,
          score: Number(subjEdit.exam ?? 0),
          grade: subjEdit.grade ?? "",
          remark: subjEdit.remark ?? "",
          session: academicYear,
          sessionDate,
          sessionDay
        };
      });
      // API call on every input change
      await fetch(`${API_BASE_URL}/api/cbt-results/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          teacherId: teacherData?._id,
          className: teacherClass,
          term: selectedTerm,
          results: resultsArr
        }),
      });
    }).catch(() => {});
  };

  // Push results to students
  const handlePushResults = async () => {
  setSaving(true);
  try {
    const academicYear = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
    const sessionDate = new Date().toLocaleDateString();
    const sessionDay = new Date().toLocaleString('en-US', { weekday: 'long' });

    for (const studentId of editedStudents) {
      const studentResults = editResults[studentId];
      const resultsArr = subjects.map(subject => {
        const subjEdit = studentResults[subject] || {};
        return {
          subject,
          score: Number(subjEdit.exam ?? 0),
          grade: subjEdit.grade ?? "",
          remark: subjEdit.remark ?? "",
          session: academicYear,
          sessionDate,
          sessionDay
        };
      });
      await fetch(`${API_BASE_URL}/api/cbt-results/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          teacherId: teacherData?._id,
          className: teacherClass,
          term: selectedTerm,
          results: resultsArr
        }),
      });
    }
    alert("CBT results pushed to students!");
  } catch (err) {
    alert("Failed to push CBT results.");
  }
  setSaving(false);
};

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

  useEffect(() => {
    const saved = localStorage.getItem('cbtPortalState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudents(parsed.students || []);
        setEditResults(parsed.editResults || {});
        setEditedStudents(new Set(parsed.editedStudents || []));
        setSubjects(parsed.subjects || []);
        setSubjectsOrder(parsed.subjectsOrder || []);
        setSelectedTerm(parsed.selectedTerm || "");
        setShowSubjectModal(parsed.subjects?.length ? false : true);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!showSubjectModal && subjects.length > 0) {
      localStorage.setItem('cbtPortalState', JSON.stringify({
        students,
        editResults,
        editedStudents: Array.from(editedStudents),
        subjects,
        subjectsOrder,
        selectedTerm,
      }));
    }
  }, [students, editResults, editedStudents, subjects, subjectsOrder, selectedTerm, showSubjectModal]);

  return (
    <div className="p-4">
      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
            <h3 className="font-bold text-lg mb-4">Set Subjects for {teacherClass} ({selectedTerm} Term)</h3>
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 justify-center mb-2">
                {subjects.map(subject => (
                  <span key={subject} className="flex items-center bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm font-medium">
                    {subject}
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveSubject(subject)}
                      disabled={subjectLoading}
                      title="Remove subject"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-40"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="Add subject"
                  disabled={subjectLoading}
                />
                <button
                  className="px-3 py-1 bg-primary text-white rounded flex items-center justify-center"
                  onClick={handleAddSubject}
                  disabled={subjectLoading}
                >
                  {subjectLoading ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
              {subjectInputError && (
                <div className="text-red-600 text-sm mt-2">{subjectInputError}</div>
              )}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => setShowSubjectModal(false)}
              disabled={subjects.length === 0}
            >
              Done
            </button>
            {subjects.length === 0 && (
              <div className="text-xs text-red-500 mt-2">You must add at least one subject to proceed.</div>
            )}
          </div>
        </div>
      )}

      {/* Select Term */}
      <div className="mb-4 flex items-center gap-4">
        <span className="font-semibold">Class:</span>
        <span className="px-3 py-1 rounded bg-primary/10 text-primary font-bold">{teacherClass || "Loading..."}</span>
        <span className="font-semibold ml-6">Term:</span>
        <select
          className="border rounded px-2 py-1"
          value={selectedTerm}
          onChange={e => setSelectedTerm(e.target.value)}
        >
          <option value="">Select Term</option>
          <option value="first">First Term</option>
          <option value="second">Second Term</option>
          <option value="third">Third Term</option>
        </select>
      </div>

      {/* Push Results Button */}
      {!showSubjectModal && subjects.length > 0 && (
        <button
          className="mb-4 px-4 py-2 bg-primary text-white rounded"
          onClick={() => setShowConfirmModal(true)}
          disabled={saving}
        >
          {saving ? "Pushing..." : "Push Results to Students"}
        </button>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
            <h3 className="font-bold text-lg mb-4 text-primary">Confirm Push</h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to push these CBT results to students? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-primary text-white rounded"
                onClick={async () => {
                  setShowConfirmModal(false);
                  await handlePushResults();
                }}
                disabled={saving}
              >
                {saving ? "Pushing..." : "Yes, Push Results"}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear State Button */}
      <div className="mb-4 flex justify-end">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded shadow"
          onClick={() => setShowClearConfirm(true)}
        >
          Clear State
        </button>
      </div>

      {/* Clear State Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
            <h3 className="font-bold text-lg mb-4 text-red-600">Confirm Clear State</h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to clear all CBT result data? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => {
                  setStudents([]);
                  setEditResults({});
                  setEditedStudents(new Set());
                  setSubjects([]);
                  setSubjectsOrder([]);
                  setSelectedTerm("");
                  setShowSubjectModal(false);
                  setNewSubject("");
                  setSubjectInputError("");
                  localStorage.removeItem('cbtPortalState');
                  setShowClearConfirm(false);
                }}
                disabled={saving}
              >
                Yes, Clear State
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!showSubjectModal && subjects.length > 0 && (loading ? (
        <div>Loading students and results...</div>
      ) : (
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
          <div style={{ minWidth: "900px" }}>
            <table className="min-w-max border border-gray-300">
            <thead>
  <tr>
    <th className="border px-2 py-1 bg-gray-100">Student Name</th>
    {subjects.map(subject => (
      <React.Fragment key={subject}>
        <th className="border px-2 py-1 bg-gray-100">{subject} Exam</th>
        <th className="border px-2 py-1 bg-gray-100">{subject} Grade</th>
        <th className="border px-2 py-1 bg-gray-100">{subject} Remark</th>
      </React.Fragment>
    ))}
    <th className="border px-2 py-1 bg-gray-100">Session</th>
    <th className="border px-2 py-1 bg-gray-100">Date</th>
    <th className="border px-2 py-1 bg-gray-100">Day</th>
    <th className="border px-2 py-1 bg-gray-100">Rector's Signature</th>
  </tr>
</thead>
           <tbody>
  {students.map(student => {
    const studentResults = editResults[student._id] || {};
    return (
      <tr key={student._id}>
        <td className="border px-2 py-1">{student.name || student.fullName || student.username}</td>
        {subjects.map(subject => {
          const subjEdit = editResults[student._id]?.[subject];
          return (
            <React.Fragment key={subject}>
              <td>
                <input
                  type="number"
                  value={subjEdit?.exam ?? ""}
                  onChange={e => handleInputChange(student._id, subject, "exam", e.target.value)}
                  className="w-16 border rounded px-1"
                />
              </td>
              <td>{subjEdit?.grade ?? ""}</td>
              <td>{subjEdit?.remark ?? ""}</td>
            </React.Fragment>
          );
        })}
        <td className="border px-2 py-1">{academicYear}</td>
        <td className="border px-2 py-1">{sessionDate}</td>
        <td className="border px-2 py-1">{sessionDay}</td>
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
      ))}
    </div>
  );
};

export default CBTResultPortal;