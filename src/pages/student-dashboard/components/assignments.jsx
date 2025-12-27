import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom"; // Add this import

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

function normalizeClassKey(className) {
  if (!className) return "";
  const match = className.trim().toUpperCase().match(/^(JSS[1-3]|SS[1-3])/);
  return match ? match[0] : className.trim().toUpperCase();
}

function getStudentClass() {
  const storedData = window.localStorage.getItem('studentData');
  if (storedData) {
    const studentData = JSON.parse(storedData);
    const rawClass =
      studentData.gradeLevel ||
      studentData.personal?.gradeLevel ||
      studentData.academic?.intendedClass ||
      "";
    return normalizeClassKey(rawClass);
  }
  return normalizeClassKey(window.localStorage.getItem("studentClass") || "JSS1");
}

function generateAssignmentPDF(classKey, assignments) {
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(18);
  doc.text(`Holiday Assignment (${classKey})`, 15, y);
  y += 10;
  doc.setFontSize(12);
  doc.text(
    "You are advised to do your assignment in a 2A exercise book and please do well to do your assignment and submit it on resumption.",
    15,
    y
  );
  y += 12;

  assignments.forEach((subject, idx) => {
    doc.setFontSize(15);
    doc.text(`${subject.subject}`, 15, y);
    y += 8;
    doc.setFontSize(12);
    subject.questions.forEach((q, i) => {
      // Split long questions to avoid overflow
      const lines = doc.splitTextToSize(`${i + 1}. ${q}`, 170);
      lines.forEach(line => {
        doc.text(line, 20, y);
        y += 7;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    });
    y += 5;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save(`Holiday_Assignment_${classKey}.pdf`);
}

const Assignments = () => {
  const classKey = getStudentClass();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Add this hook

  useEffect(() => {
    console.log(`[ASSIGNMENT][FRONTEND] Fetching assignments for classKey:`, classKey);
    if (!classKey) {
      setAssignments([]);
      setLoading(false);
      console.warn("[ASSIGNMENT][FRONTEND] No classKey found, skipping fetch.");
      return;
    }
    setLoading(true);
    fetch(`${API_BASE_URL}/api/assignment/class/${classKey}`)
      .then(res => {
        console.log(`[ASSIGNMENT][FRONTEND] Response status:`, res.status);
        return res.json();
      })
      .then(data => {
        console.log(`[ASSIGNMENT][FRONTEND] Received assignments:`, data);
        setAssignments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[ASSIGNMENT][FRONTEND] Error fetching assignments:", err);
        setAssignments([]);
        setLoading(false);
      });
  }, [classKey]);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-4 sm:p-6 mt-6 sm:mt-10">
      {/* Back button */}
      <button
        className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold"
        onClick={() => navigate('/student-dashboard')}
      >
        ← Back to Dashboard
      </button>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary">Holiday Assignment ({classKey || "Unknown"})</h2>
        <button
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 font-semibold"
          onClick={() => generateAssignmentPDF(classKey, assignments)}
          disabled={!assignments.length}
        >
          Download as PDF
        </button>
      </div>
      {/* Instruction above assignments */}
      <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-yellow-900 font-medium text-base">
        You are advised to do your assignment in a <span className="font-bold">2A exercise book</span> and please do well to do your assignment and submit it on resumption.
      </div>
      <div id="assignment-section">
        {!classKey ? (
          <div className="text-center text-muted-foreground py-8">
            Unable to determine your class. Please contact admin.
          </div>
        ) : loading ? (
          <div className="text-center text-muted-foreground py-8">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No assignments available for your class.
          </div>
        ) : (
          assignments.map((subject, idx) => (
            <div key={subject.subject + idx} className="mb-6">
              <h3 className="text-lg font-semibold text-secondary mb-2">{subject.subject}</h3>
              <ul className="list-disc list-inside text-base text-gray-700">
                {subject.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Assignments;