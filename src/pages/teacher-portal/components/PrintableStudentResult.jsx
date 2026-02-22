// src/components/PrintableStudentResult.jsx
import React from 'react';
import ResultsTable from '../../results-analytics-portal/components/ResultsTable';

const boldStyle = { fontWeight: 900 };
const bolderStyle = { fontWeight: 700 };

const PrintableStudentResult = ({ student, results, overallResult, className, term, totalStudentsInClass }) => (
  <div
    id={`result-print-section-${student?._id || student?.id || student?.name || 'unknown'}`}
    className="printable-student-result bg-white border rounded-lg shadow p-6 m-4"
    style={{
      width: '100%',
      maxWidth: '900px',
      minHeight: '90vh',
      margin: '0 auto',
      display: 'block',
      background: '#fff',
      fontWeight: 700, // Make all text bolder by default
      fontSize: '1.08rem', // Slightly larger for print clarity
    }}
  >
    {/* HEADER */}
    <header className="mb-4 w-full" style={boldStyle}>
      <div className="flex flex-col items-center w-full">
        <img src="/assets/images/school_logo-1754996036714.jpg" alt="School Logo" style={{ width: 80, borderRadius: '50%' }} />
        <h1
          className="text-2xl text-center w-full"
          style={{ ...boldStyle, fontSize: '2.1rem', letterSpacing: '1px', marginBottom: 2 }}
        >
          ANNUNCIATION SEMINARY AMAUDARA
        </h1>
        <div className="text-sm text-center w-full" style={boldStyle}>RENOVARE FACIEM TERRA</div>
        <div className="text-xs text-center w-full" style={{ ...boldStyle, color: '#fff' }}>
          Website: <a href="https://annunciationseminaryamaudara.online" className="text-blue-600 underline" style={{ ...boldStyle, color: '#fff' }}>www.annunciationseminaryamaudara.online</a>
        </div>
      </div>
      {/* STUDENT INFO SECTION - MAKE THIS BIGGER AND BOLDER */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-4 px-2 w-full"
        style={{
          fontSize: '1.35rem', // Larger font
          fontWeight: 900,      // Extra bold
          letterSpacing: '0.5px',
          marginBottom: '8px',
          color: '#fff',        // <-- Make font color white
           // Optional: add shadow for print contrast
        }}
      >
        <div style={{color: '#fff'}}><span style={{color: '#fff'}}>Name:</span> <span style={{color: '#fff'}}>{student?.name || 'N/A'}</span></div>
        <div style={{color: '#fff'}}><span style={{color: '#fff'}}>Position:</span> <span style={{color: '#fff'}}>{overallResult?.position || 'N/A'}{totalStudentsInClass ? ` out of ${totalStudentsInClass}` : ''}</span></div>
        <div style={{color: '#fff'}}><span style={{color: '#fff'}}>Class:</span> <span style={{color: '#fff'}}>{className || 'N/A'}</span></div>
        <div style={{color: '#fff'}}><span style={{color: '#fff'}}>Term:</span> <span style={{color: '#fff'}}>{term || 'N/A'}</span></div>
      </div>
      <div
        className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 px-2 w-full"
        style={{
          fontSize: '1.25rem', // Larger font
          fontWeight: 900,      // Extra bold
          letterSpacing: '0.5px',
          marginBottom: '8px',
          color: '#fff',        // <-- Make font color white
           // Optional: add shadow for print contrast
        }}
      >
        <div style={{color: '#fff'}}><span style={{color: '#fff'}}>Academic Session:</span> <span style={{color: '#fff'}}>{overallResult?.academicYear || '____'}</span></div>
        <div style={{color: '#fff'}}><span style={{color: '#fff'}}>Average:</span> <span style={{color: '#fff'}}>{overallResult?.average || '____'}</span></div>
      </div>
      <div
        className="mt-2 px-2 w-full"
        style={{
          fontSize: '1.25rem', // Larger font
          fontWeight: 900,      // Extra bold
          letterSpacing: '0.5px',
          marginBottom: '8px',
          color: '#fff',        // <-- Make font color white
          // Optional: add shadow for print contrast
        }}
      >
        <span style={{color: '#fff'}}>Next Term Begins:</span> <span style={{color: '#fff'}}>{overallResult?.nextTerm || '____'}</span>
      </div>
      <hr style={{ margin: '16px auto', borderTop: '2px solid #222' }} />
    </header>

    {/* SUBHEADING */}
    <section style={{ marginBottom: '24px', textAlign: 'center', ...boldStyle }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        COGNITIVE DOMAIN [PERFORMANCE IN SUBJECTS]
      </h2>
    </section>

    {/* RESULTS TABLE */}
    <div className="results-table mb-8 overflow-x-auto" style={{ position: 'relative', zIndex: 1, ...bolderStyle }}>
      <ResultsTable results={results} />
    </div>

    {/* KEY RATING SECTION */}
    <div className="key-rating-section" style={{ position: 'relative', zIndex: 1, ...bolderStyle }}>
      <h3 className="font-bold text-lg mb-2 text-center" style={boldStyle}>Key Rating</h3>
      <div className="flex flex-wrap justify-center gap-2 text-sm mb-4" style={bolderStyle}>
        <span>5-EXCELLENT</span>
        <span>4-VERY GOOD</span>
        <span>3-SATISFACTORY</span>
        <span>2-POOR</span>
        <span>1-VERY POOR</span>
      </div>
      <div className="w-full">
        <table className="w-full table-fixed border border-gray-300 rounded-lg mb-4" style={bolderStyle}>
          <thead>
            <tr className="bg-gray-100">
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal" style={boldStyle}>Handwriting</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal" style={boldStyle}>Punctuality</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal" style={boldStyle}>Initiative</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal" style={boldStyle}>Obedience</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal" style={boldStyle}>Honesty</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal" style={boldStyle}>Neatness</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal" style={boldStyle}>Attentiveness</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal" style={boldStyle}>Respect</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal" style={boldStyle}>Attitude</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal" style={boldStyle}>Creativity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {([
                'handwriting', 'punctuality', 'initiative', 'obedience', 'honesty',
                'neatness', 'attentiveness', 'respect', 'attitude', 'creativity'
              ]).map(key => {
                const value = overallResult?.[key];
                let label = '';
                if (value === 5) label = 'Excellent';
                else if (value === 4) label = 'Very Good';
                else if (value === 3) label = 'Satisfactory';
                else if (value === 2) label = 'Poor';
                else if (value === 1) label = 'Very Poor';
                return (
                  <td className="px-1 py-1 text-center break-words whitespace-normal" key={key} style={bolderStyle}>
                    {value
                      ? <span style={boldStyle}>{value} - {label}</span>
                      : <span className="text-gray-400" style={bolderStyle}>Not marked</span>
                    }
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* COMMENTS SECTION */}
    <div
      className="comments-section grid grid-cols-1 md:grid-cols-3 gap-4 justify-between mt-4 w-full"
      style={{ position: 'relative', zIndex: 1, ...bolderStyle }}
    >
      <div className="flex flex-col">
        <label className="mb-1" style={boldStyle}>Deans Remark:</label>
        <div className="border rounded px-2 py-1 min-h-[32px]" style={bolderStyle}>{overallResult?.teacherComment || '_________________________'}</div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <label className="mb-1" style={boldStyle}>Rector's Signature:</label>
        <div className="flex items-center mt-2 justify-center">
          <img
            src="/assets/images/rector-signature.jpg"
            alt="Rector's Signature"
            className="h-16 object-contain"
            style={{ background: '#fff', borderRadius: '4px', border: '1px solid #eee', padding: '4px' }}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <label className="mb-1" style={boldStyle}>Rectors Remark:</label>
        <div className="border rounded px-2 py-1 min-h-[32px]" style={bolderStyle}>{overallResult?.headTeacherRemark || '_________________________'}</div>
      </div>
    </div>
  </div>
);

export default PrintableStudentResult;