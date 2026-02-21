// src/components/PrintableStudentResult.jsx
import React from 'react';
import ResultsTable from '../../results-analytics-portal/components/ResultsTable';

const PrintableStudentResult = ({ student, results, overallResult, className, term, totalStudentsInClass }) => (
  <div
    id={`result-print-section-${student?._id || student?.id || student?.name || 'unknown'}`} // <-- Add this line
    className="printable-student-result bg-white border rounded-lg shadow p-6 m-4"
    style={{
      width: '100%',
      maxWidth: '900px',
      minHeight: '90vh',
      margin: '0 auto',
      display: 'block',
      background: '#fff'
    }}
  >
    {/* HEADER */}
    <header className="mb-4 w-full">
      <div className="flex flex-col items-center w-full">
        <img src="/assets/images/school_logo-1754996036714.jpg" alt="School Logo" style={{ width: 80, borderRadius: '50%' }} />
        <h1 className="font-extrabold text-2xl text-center w-full">ANNUNCIATION SEMINARY AMAUDARA</h1>
        <div className="text-sm text-center w-full font-extrabold">RENOVARE FACIEM TERRA</div>
        <div className="text-xs text-center w-full font-extrabold">Isiala Ngwa South, Owerrinta Abia State</div>
        <div className="text-xs text-center w-full font-extrabold">
          Website: <a href="https://annunciationseminaryamaudara.online" className="text-blue-600 underline font-extrabold">www.annunciationseminaryamaudara.online</a>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-4 text-xs px-2 w-full">
        <div className="text-white font-extrabold">
          <span className="font-extrabold">Name:</span> <span className="font-extrabold">{student?.name || 'N/A'}</span>
        </div>
        <div className="text-white font-extrabold">
          <span className="font-extrabold">Position:</span> <span className="font-extrabold">{overallResult?.position || 'N/A'}{totalStudentsInClass ? ` out of ${totalStudentsInClass}` : ''}</span>
        </div>
        <div className="text-white font-extrabold">
          <span className="font-extrabold">Class:</span> <span className="font-extrabold">{className || 'N/A'}</span>
        </div>
        <div className="text-white font-extrabold">
          <span className="font-extrabold">Term:</span> <span className="font-extrabold">{term || 'N/A'}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-xs px-2 w-full">
        <div className="text-white font-extrabold">
          <span className="font-extrabold">Academic Session:</span> <span className="font-extrabold">{overallResult?.academicYear || '____'}</span>
        </div>
        <div className="text-white font-extrabold">
          <span className="font-extrabold">Average:</span> <span className="font-extrabold">{overallResult?.average || '____'}</span>
        </div>
      </div>
      <div className="mt-2 text-xs px-2 w-full text-white font-extrabold">
        <span className="font-extrabold">Next Term Begins:</span> <span className="font-extrabold">{overallResult?.nextTerm || '____'}</span>
      </div>
      <hr style={{ margin: '16px auto', borderTop: '1px solid #ccc' }} />
    </header>

    {/* SUBHEADING */}
    <section style={{ marginBottom: '24px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        COGNITIVE DOMAIN [PERFORMANCE IN SUBJECTS]
      </h2>
    </section>

    {/* RESULTS TABLE */}
    <div className="results-table mb-8 overflow-x-auto" style={{ position: 'relative', zIndex: 1 }}>
      <ResultsTable results={results} />
    </div>

    {/* KEY RATING SECTION */}
    <div className="key-rating-section" style={{ position: 'relative', zIndex: 1 }}>
      <h3 className="font-bold text-lg mb-2 text-center">Key Rating</h3>
      <div className="flex flex-wrap justify-center gap-2 text-sm mb-4">
        <span>5-EXCELLENT</span>
        <span>4-VERY GOOD</span>
        <span>3-SATISFACTORY</span>
        <span>2-POOR</span>
        <span>1-VERY POOR</span>
      </div>
      <div className="w-full">
        <table className="w-full table-fixed border border-gray-300 rounded-lg mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal">Handwriting</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal">Punctuality</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal">Initiative</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal">Obedience</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal">Honesty</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal">Neatness</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal">Attentiveness</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal">Respect</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal">Attitude</th>
              <th className="px-1 py-1 text-xs font-semibold text-center break-words whitespace-normal">Creativity</th>
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
                  <td className="px-1 py-1 text-center break-words whitespace-normal" key={key}>
                    {value
                      ? <span className="font-bold">{value} - {label}</span>
                      : <span className="text-gray-400">Not marked</span>
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
      style={{ position: 'relative', zIndex: 1 }}
    >
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Deans Remark:</label>
        <div className="border rounded px-2 py-1 min-h-[32px]">{overallResult?.teacherComment || '_________________________'}</div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <label className="font-semibold mb-1">Rector's Signature:</label>
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
        <label className="font-semibold mb-1">Rectors Remark:</label>
        <div className="border rounded px-2 py-1 min-h-[32px]">{overallResult?.headTeacherRemark || '_________________________'}</div>
      </div>
    </div>
  </div>
);

export default PrintableStudentResult;