import React, { useEffect, useState } from 'react';

const VerifyResult = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [verifiedStudents, setVerifiedStudents] = useState({});
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    // Replace with your API call
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => setClasses(data));
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      fetch(`/api/results?classId=${selectedClass}`)
        .then(res => res.json())
        .then(data => {
          setStudents(data);
          setLoading(false);
        });
    }
  }, [selectedClass]);

  const handleVerifyStudent = (studentId) => {
    // Replace with your API call
    fetch(`/api/verify-student-result`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(() => {
        setVerifiedStudents(prev => ({ ...prev, [studentId]: true }));
      });
  };

  const handleClassVerification = () => {
    // Replace with your API call
    fetch(`/api/verify-class-result`, {
      method: 'POST',
      body: JSON.stringify({ classId: selectedClass, token }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(() => {
        alert('Class results verified and sent to students!');
        setSelectedClass(null);
        setStudents([]);
        setVerifiedStudents({});
        setToken('');
      });
  };

  return (
    <div>
      <h2>Verify Results</h2>
      <div>
        <label>Select Class: </label>
        <select
          value={selectedClass || ''}
          onChange={e => setSelectedClass(e.target.value)}
        >
          <option value="">--Select--</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading students...</p>}

      {students.length > 0 && (
        <div>
          <h3>Students in {classes.find(c => c.id === selectedClass)?.name}</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Result</th>
                <th>Verify</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.result}</td>
                  <td>
                    {verifiedStudents[student.id] ? (
                      <span>Verified</span>
                    ) : (
                      <button onClick={() => handleVerifyStudent(student.id)}>
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Object.keys(verifiedStudents).length === students.length && (
            <div>
              <input
                type="text"
                placeholder="Enter verification token"
                value={token}
                onChange={e => setToken(e.target.value)}
              />
              <button onClick={handleClassVerification} disabled={!token}>
                Confirm Class Verification
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyResult;