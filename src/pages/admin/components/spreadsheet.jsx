import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TiArrowBackOutline } from "react-icons/ti";
import { FixedSizeList as List } from 'react-window';

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

  useEffect(() => {
    // If students and editResults are passed from verify page, use them directly
    if (location.state?.students && location.state?.editResults) {
      setStudents(location.state.students);
      setEditResults(location.state.editResults);

      // Build global subject list from all students' subjects (in order, no duplicates)
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
      return;
    }

    // ...fallback: fetch as before if not passed from verify page...
    if (!selectedClass || !selectedTerm) return;
    setLoading(true);

    // 1. Fetch students
    fetch(`${API_BASE_URL}/api/user/class/${selectedClass}/all/students?term=${selectedTerm}`)
      .then(res => res.json())
      .then(studentData => {
        setStudents(studentData);

        // 2. Fetch pushed results for each student (like verify page)
        const fetches = studentData.map(student =>
          fetch(`${API_BASE_URL}/api/results/student/${student._id}/pushed?className=${selectedClass}&term=${selectedTerm}`)
            .then(res => res.json())
            .then(results => ({ studentId: student._id, results }))
        );

        Promise.all(fetches).then(resultsArr => {
          // Build per-student subject arrays and a unique, ordered subject list for the spreadsheet
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
                // Add to global subject list in order of first appearance
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

            // For this student, mark as notOffering any subject in allSubjectsOrdered not in their subjects
            allSubjectsOrdered.forEach(subject => {
              if (!subjects.includes(subject)) {
                editMap[studentId][subject] = { notOffering: true };
              }
            });

            // If new subjects were added after this student's loop, check again
            // (for students processed before all subjects were discovered)
          });

          // After all students, ensure every student has notOffering for any subject not in their list
          Object.keys(editMap).forEach(studentId => {
            const studentSubjects = Object.keys(editMap[studentId]).filter(s => s !== "_overall" && !editMap[studentId][s].notOffering);
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
        });
      })
      .catch(() => {
        setStudents([]);
        setSubjects([]);
        setResultsMap({});
        setEditResults({});
        setLoading(false);
      });
  }, [selectedClass, selectedTerm, location.state]);

  // Handle input change for scores and key ratings
  const handleInputChange = (studentId, subject, field, value) => {
    setEditResults(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      if (!updated[studentId][subject]) updated[studentId][subject] = {};
      updated[studentId][subject][field] = value;

      // Auto-calculate grade and remark if cat or exam changes
      if (field === "cat" || field === "exam") {
        const cat = Number(updated[studentId][subject].cat ?? 0);
        const exam = Number(updated[studentId][subject].exam ?? 0);
        const total = cat + exam;
        updated[studentId][subject].grade = getGrade(total);
        updated[studentId][subject].remark = getRemark(updated[studentId][subject].grade);
      }
      return updated;
    });
  };

  // Handle key rating change
  const handleKeyRatingChange = (studentId, field, value) => {
    setEditResults(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      if (!updated[studentId]._overall) updated[studentId]._overall = {};
      updated[studentId]._overall[field] = value;
      return updated;
    });
  };

  // Remove subject for all students
  const handleRemoveSubjectAll = (subject) => {
    setSubjects(prev => prev.filter(s => s !== subject));
    setEditResults(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(studentId => {
        delete updated[studentId][subject];
      });
      return updated;
    });
  };

  // Remove subject for individual student
  const handleRemoveSubjectIndividual = (studentId, subject) => {
    setEditResults(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      if (!updated[studentId][subject]) updated[studentId][subject] = {};
      updated[studentId][subject].notOffering = true;
      return updated;
    });
  };

  // Save all changes
  const handleSaveAll = async () => {
    setSaving(true); // Start saving state
    for (const studentId of Object.keys(editResults)) {
      for (const subject of subjects) {
        const subjEdit = editResults[studentId][subject];
        if (subjEdit && !subjEdit.notOffering && subjEdit._id) {
          await fetch(`${API_BASE_URL}/api/results/update/${subjEdit._id}`, {
            method: 'PUT',
            body: JSON.stringify({
              firstCatScore: Number(subjEdit.cat ?? 0),
              examScore: Number(subjEdit.exam ?? 0),
              grade: subjEdit.grade ?? "",
              remark: subjEdit.remark ?? ""
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
            creativity: overall.creativity
          }),
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    setSaving(false); // End saving state
    alert("All changes saved!");
  };

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

  return (
    <div className="p-4">
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
                {subjects.map(subject => (
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
                  <th className="border px-2 py-1 bg-gray-100">Student Name</th>
                  {subjects.map(subject => (
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
                {students.map(student => {
                  const studentResults = resultsMap[student._id] || {};
                  const overall = studentResults._overall || {};
                  // Helper to get label for key rating
                  const getKeyRatingLabel = val => {
                    val = Number(val);
                    if (val === 5) return 'EXCELLENT';
                    if (val === 4) return 'VERY GOOD';
                    if (val === 3) return 'SATISFACTORY';
                    if (val === 2) return 'POOR';
                    if (val === 1) return 'VERY POOR';
                    return '';
                  };
                  return (
                    <tr key={student._id}>
                      <td className="border px-2 py-1">{student.name || student.fullName || student.username}</td>
                      {subjects.map(subject => {
                        const subjEdit = editResults[student._id]?.[subject];
                        if (subjEdit?.notOffering) {
                          // Show a single cell with "Not Offering" spanning 5 columns now
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
                        return (
                          <React.Fragment key={subject}>
                            <td>
                              <input
                                type="number"
                                value={subjEdit?.cat ?? ""}
                                onChange={e => handleInputChange(student._id, subject, "cat", e.target.value)}
                                className="w-16 border rounded px-1"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={subjEdit?.exam ?? ""}
                                onChange={e => handleInputChange(student._id, subject, "exam", e.target.value)}
                                className="w-16 border rounded px-1"
                              />
                            </td>
                            <td>{Number(subjEdit?.cat ?? 0) + Number(subjEdit?.exam ?? 0)}</td>
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
    </div>
  );
};

export default Spreadsheet;