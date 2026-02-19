// src/pages/teacher-portal/PrintAllResults.jsx
import React, { useState, useEffect } from 'react';
import PrintableStudentResult from './components/PrintableStudentResult';
import printJS from 'print-js';

const PrintAllResults = () => {
  const [results, setResults] = useState([]);
  const [className, setClassName] = useState('');
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

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

  const handlePrintResult = () => {
    printJS({
      printable: 'print-section',
      type: 'html',
      targetStyles: ['*'],
      style: `
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        .asa-print-section {
          width: 100vw !important;
          max-width: 100vw !important;
          min-width: 0 !important;
          margin: 0 !important;
          background: none !important;
          box-shadow: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .asa-print-section, .asa-print-section * {
          visibility: visible !important;
        }
        body * {
          visibility: hidden !important;
        }
        .printable-student-result {
          page-break-after: always;
          page-break-inside: avoid;
          break-after: always;
          break-inside: avoid;
          width: 100% !important;
          min-height: 95vh !important;
          margin: 0 auto !important;
          background: #fff !important;
        }
        .results-table, .results-table * {
          color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .asa-print-section > div {
          margin: 0 !important;
          padding: 0 !important;
        }
        .key-rating-section table {
          width: 100% !important;
          max-width: 100% !important;
          table-layout: fixed !important;
          font-size: 0.85em !important;
        }
        .key-rating-section th,
        .key-rating-section td {
          word-break: break-word !important;
          white-space: normal !important;
          padding: 2px 4px !important;
          font-size: 0.85em !important;
        }
      `
    });
  };

  return (
    <div>
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
      <button onClick={handlePrintResult} disabled={loading || results.length === 0}>
        Print All
      </button>

      {loading && (
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <span>Loading results, please wait...</span>
        </div>
      )}

      <div id="print-section" className="asa-print-section">
        {studentIds.map(studentId => {
          const studentResults = groupedResults[studentId];
          const overallResult = getOverallResult(studentResults);
          return (
            <PrintableStudentResult
              key={studentId}
              student={getStudentInfo(studentId)}
              results={studentResults}
              overallResult={overallResult}
              className={className}
              term={term}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PrintAllResults;