// src/components/PrintableStudentResult.jsx
import React from 'react';
import ResultsTable from '../../results-analytics-portal/components/ResultsTable';

const PrintableStudentResult = ({ student, results, overallResult, className, term, totalStudentsInClass }) => (
  <div
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