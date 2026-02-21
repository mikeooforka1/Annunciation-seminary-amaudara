// src/pages/teacher-portal/PrintAllResults.jsx
import React, { useState, useEffect } from 'react';
import PrintableStudentResult from './components/PrintableStudentResult';
import printJS from 'print-js';
import html2canvas from 'html2canvas'; // Add this import

const PrintAllResults = () => {
  const [results, setResults] = useState([]);
  const [className, setClassName] = useState('');
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [printing, setPrinting] = useState(false);
  const [showPrintSuccessModal, setShowPrintSuccessModal] = useState(false);
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [showNoResultsModal, setShowNoResultsModal] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Auto-select teacher's class from localStorage on mount
  useEffect(() => {
    const teacherData = localStorage.getItem('teacherData');
    if (teacherData) {
      const parsed = JSON.parse(teacherData);
      if (parsed.className) setClassName(parsed.className);
      if (parsed.term) setTerm(parsed.term);
    }
  }, []);

  useEffect(() => {
    if (className) {
      fetch(`${API_BASE_URL}/api/user/class/${className}/students`)
        .then(res => res.json())
        .then(data => setStudents(data));
    }
  }, [className]);

  const fetchResults = () => {
    if (!className || !term) {
      alert("Please select both class and term.");
      return;
    }
    setLoading(true);
    fetch(`${API_BASE_URL}/api/results/class/${className}/${term}`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched results:", data);
        setResults(data);
        setLoading(false);
      });
  };

  // Group results by studentId
  function groupResultsByStudent(results) {
    const grouped = {};
    results.forEach(res => {
      if (!grouped[res.studentId]) grouped[res.studentId] = [];
      grouped[res.studentId].push(res);
    });
    return grouped;
  }

  // Dummy function to get student info (replace with real data if available)
  function getStudentInfo(studentId) {
    const student = students.find(s => s._id === studentId);
    return student ? { name: student.name } : { name: studentId };
  }

  // Grouped results
  const groupedResults = groupResultsByStudent(results);
  const studentIds = Object.keys(groupedResults);

  // Helper to chunk array into pairs
  function chunkArray(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  // For each student, you may want to extract their "Overall" result for header info
  function getOverallResult(studentResults) {
    return studentResults.find(r => r.subject === 'Overall');
  }

  const handlePrintResult = async () => {
    if (results.length === 0) {
      setShowNoResultsModal(true);
      return;
    }
    setPrinting(true);

    // Prompt user to select a folder
    const dirHandle = await getDirectoryHandle();
    if (!dirHandle) {
      setPrinting(false);
      return;
    }

    // Set the folder name (use .name property)
    setSelectedFolderName(dirHandle.name || '');

    for (const studentId of studentIds) {
      const sectionId = `result-print-section-${studentId}`;
      const printSection = document.getElementById(sectionId);
      if (!printSection) continue;

      // Make sure styles are set for printing (similar to student page)
      const tableContainer = printSection.querySelector('.results-table-responsive');
      if (tableContainer) {
        tableContainer.style.overflow = 'visible';
        tableContainer.style.width = '100%';
        tableContainer.style.background = '#fff';
        tableContainer.style.opacity = '1';
      }
      const table = printSection.querySelector('table');
      if (table) {
        table.style.background = '#fff';
        table.style.opacity = '1';
        table.style.color = '#222';
      }
      const ths = printSection.querySelectorAll('.results-table-responsive th');
      const tds = printSection.querySelectorAll('.results-table-responsive td');
      ths.forEach(th => {
        th.style.background = '#fff';
        th.style.opacity = '1';
        th.style.color = '#222';
      });
      tds.forEach(td => {
        td.style.style = '#fff';
        td.style.opacity = '1';
        td.style.color = '#222';
      });

      // Use html2canvas to capture the section as an image
      const canvas = await html2canvas(printSection, {
        backgroundColor: '#fff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Save as PNG in the selected folder
      const student = getStudentInfo(studentId);
      const fileName = `result-${(student.name || studentId).replace(/\s+/g, '_')}.png`;
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(await (await fetch(canvas.toDataURL('image/png')).then(res => res.blob())));
      await writable.close();

      await new Promise(res => setTimeout(res, 500));
    }
    setPrinting(false);
    setShowPrintSuccessModal(true);
  };

  async function getDirectoryHandle() {
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await window.showDirectoryPicker();
        return dirHandle;
      } catch (err) {
        alert("Folder selection was cancelled.");
        return null;
      }
    } else {
      alert("Your browser does not support folder selection. Please use Chrome or Edge on desktop.");
      return null;
    }
  }

  return (
    <div>
      {/* Style to ensure tables are visible for html2canvas */}
      <style>
        {`
          [id^="result-print-section-"] .results-table,
          [id^="result-print-section-"] .results-table-responsive,
          [id^="result-print-section-"] table,
          [id^="result-print-section-"] th,
          [id^="result-print-section-"] td {
            background: #fff !important;
            opacity: 1 !important;
            color: #222 !important;
          }
        `}
      </style>
      {/* Class/Term selectors */}
      <select value={className} onChange={e => setClassName(e.target.value)}>
        <option value="">Select Class</option>
        <option value={className}>{className}</option>
        {/* Add more options if needed */}
      </select>
      <select value={term} onChange={e => setTerm(e.target.value)}>
        <option value="">Select Term</option>
        <option value="first">First Term</option>
        <option value="second">Second Term</option>
        <option value="third">Third Term</option>
      </select>
      <button onClick={fetchResults} disabled={!className || !term || loading}>
        {loading ? "Loading..." : "Fetch Results"}
      </button>
      <button
        onClick={handlePrintResult}
        disabled={loading || printing}
        style={{ position: "relative", minWidth: 120 }}
      >
        {printing ? (
          <>
            <span
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                marginRight: 8,
                width: 18,
                height: 18,
              }}
            >
              <svg
                viewBox="0 0 50 50"
                style={{
                  width: 18,
                  height: 18,
                  display: "block",
                  animation: "spin 1s linear infinite",
                }}
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
            </span>
            Printing...
          </>
        ) : (
          "Print All"
        )}
      </button>

      <style>
        {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {loading && (
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <span>Loading results, please wait...</span>
        </div>
      )}

      <div id="print-section" className="asa-print-section">
        {studentIds.map(studentId => {
          const studentResults = groupedResults[studentId];
          const overallResult = getOverallResult(studentResults);
          const studentObj = students.find(s => s._id === studentId) || { _id: studentId, name: studentId }; // <-- Fix here
          return (
            <PrintableStudentResult
              key={studentId}
              student={studentObj} // <-- Pass full object
              results={studentResults}
              overallResult={overallResult}
              className={className}
              term={term}
            />
          );
        })}
      </div>

      {showPrintSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "32px 24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
              minWidth: "320px",
              textAlign: "center"
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Success!</h2>
            <p style={{ marginBottom: 24 }}>
              All results have been successfully printed to the folder:
              <br />
              <span style={{ fontWeight: "bold", color: "#2563eb" }}>{selectedFolderName || "Selected Folder"}</span>
            </p>
            <button
              onClick={() => setShowPrintSuccessModal(false)}
              style={{
                padding: "8px 24px",
                borderRadius: "4px",
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showNoResultsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "32px 24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
              minWidth: "320px",
              textAlign: "center"
            }}
          >
            <h2 style={{ marginBottom: 16, color: "#b91c1c" }}>No Results</h2>
            <p style={{ marginBottom: 24 }}>
              No result to be printed. Please fetch them from the database first.
            </p>
            <button
              onClick={() => setShowNoResultsModal(false)}
              style={{
                padding: "8px 24px",
                borderRadius: "4px",
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintAllResults;