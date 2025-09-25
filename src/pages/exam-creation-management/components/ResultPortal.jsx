import React, { useState, useEffect } from 'react';
import { TbFidgetSpinner } from "react-icons/tb";
import RoleBasedHeader from '../../../components/ui/RoleBasedHeader';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const terms = [
    { value: 'first', label: 'First Term' },
    { value: 'second', label: 'Second Term' },
    { value: 'third', label: 'Third Term' }
];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Use deployed backend URL

const ResultPortal = () => {
    const [teacherData, setTeacherData] = useState(null);
    const [selectedTerm, setSelectedTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState(['Mathematics', 'English', 'Biology', 'Physics', 'Chemistry']);
    const [newSubject, setNewSubject] = useState('');
    const [results, setResults] = useState({});
    const [overall, setOverall] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [teacherResults, setTeacherResults] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isLoadingResults, setIsLoadingResults] = useState(false);
    const [manualOverall, setManualOverall] = useState({});
    const [caScores, setCaScores] = useState({});

    // Get teacher data from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('teacherData');
        if (stored) setTeacherData(JSON.parse(stored));
    }, []);

    // Fetch all students registered under this class (not just those who took the exam)
    useEffect(() => {
        if (teacherData?.className && selectedTerm) {
            setIsLoadingStudents(true);
            fetch(`${API_BASE_URL}/api/user/class/${encodeURIComponent(teacherData.className)}/${encodeURIComponent(selectedTerm)}/students`, {
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => setStudents(Array.isArray(data) ? data : []))
                .catch(() => setStudents([]))
                .finally(() => setIsLoadingStudents(false));
        }
    }, [teacherData, selectedTerm]);

    // Fetch teacher's results for the class and term
    useEffect(() => {
        if (teacherData?.className && selectedTerm) {
            setIsLoadingResults(true);
            fetch(`${API_BASE_URL}/api/results/class/${encodeURIComponent(teacherData.className)}/${encodeURIComponent(selectedTerm)}`, {
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => setTeacherResults(Array.isArray(data) ? data : []))
                .catch(() => setTeacherResults([]))
                .finally(() => setIsLoadingResults(false));
        }
    }, [teacherData, selectedTerm]);

    // Map fetched results to local state
    useEffect(() => {
        if (teacherResults.length && students.length && subjects.length) {
            // Map subject scores
            const newResults = {};
            const newCaScores = {};
            students.forEach(student => {
                newResults[student._id] = {};
                newCaScores[student._id] = {};
                subjects.forEach(subject => {
                    // Exam score
                    const foundExam = teacherResults.find(
                        r => r.studentId === student._id && r.subject === subject
                    );
                    if (foundExam) {
                        newResults[student._id][subject] = foundExam.score;
                    }
                    // C/A score
                    const foundCA = teacherResults.find(
                        r => r.studentId === student._id && r.subject === `${subject} C/A`
                    );
                    if (foundCA) {
                        newCaScores[student._id][subject] = foundCA.score;
                    }
                });
            });
            setResults(newResults);
            setCaScores(newCaScores);

            // Map overall score and position
            const newOverall = {};
            students.forEach(student => {
                const found = teacherResults.find(
                    r => r.studentId === student._id && r.subject === 'Overall'
                );
                if (found) {
                    newOverall[student._id] = {
                        overallScore: found.score,
                        position: found.remarks?.replace('Position:', '').trim() || ''
                    };
                }
            });
            setOverall(newOverall);
        }
    }, [teacherResults, students, subjects]);

    // Automatically update overall score and position when subject scores change, unless manually edited
    useEffect(() => {
        if (students.length && subjects.length) {
            const newOverall = { ...overall };
            // Calculate overall scores for all students
            const scoresArr = students.map(student => {
                const studentId = student._id;
                // Sum C/A and Exam for each subject
                const subjectScores = subjects.map(subject => {
                    const ca = Number(caScores?.[studentId]?.[subject] || 0);
                    const exam = Number(results?.[studentId]?.[subject] || 0);
                    let total = ca + exam;
                    if (total < 0) total = 0;
                    if (total > 100) total = 100;
                    return total;
                });
                const autoScore = subjectScores.length
                    ? Math.round(subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length)
                    : 0;
                return {
                    studentId,
                    autoScore,
                };
            });
            // Sort by overall score descending for position
            const sorted = [...scoresArr].sort((a, b) => b.autoScore - a.autoScore);
            // Assign positions (1st, 2nd, 3rd, 4th, ...)
            const positionMap = {};
            let lastScore = null;
            let lastPosition = 0;
            let actualPosition = 1;
            sorted.forEach((item, idx) => {
                if (lastScore !== null && item.autoScore === lastScore) {
                    positionMap[item.studentId] = lastPosition; // Same score, same position
                } else {
                    positionMap[item.studentId] = actualPosition;
                    lastScore = item.autoScore;
                    lastPosition = actualPosition;
                }
                actualPosition++;
            });
            // Update overall state
            students.forEach(student => {
                const studentId = student._id;
                const autoScore = scoresArr.find(s => s.studentId === studentId)?.autoScore || 0;
                const autoPosition = positionMap[studentId];
                // Only update if not manually edited
                if (!manualOverall[studentId]) {
                    newOverall[studentId] = {
                        ...(newOverall[studentId] || {}),
                        overallScore: autoScore,
                        position: autoPosition ? `${autoPosition}${autoPosition === 1 ? 'st' : autoPosition === 2 ? 'nd' : autoPosition === 3 ? 'rd' : 'th'}` : ''
                    };
                }
            });
            setOverall(newOverall);
        }
        // eslint-disable-next-line
    }, [results, caScores, students, subjects]);

    // Add new subject to tray
    const handleAddSubject = () => {
        const subject = newSubject.trim();
        if (subject && !subjects.includes(subject)) {
            setSubjects([...subjects, subject]);
            setNewSubject('');
        }
    };

    // Remove subject from tray
    const handleRemoveSubject = (subject) => {
        setSubjects(subjects.filter(s => s !== subject));
    };

    // Handle result input change
    const handleResultChange = (studentId, subject, value) => {
        setResults(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [subject]: value
            }
        }));
    };

    // Handle overall score and position change (manual edit)
    const handleOverallChange = (studentId, field, value) => {
        setOverall(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [field]: value
            }
        }));
        if (field === 'overallScore') {
            setManualOverall(prev => ({ ...prev, [studentId]: true }));
        }
    };

    // Submit results for all students
    const handleSubmitResults = async () => {
        setIsSubmitting(true);
        setSuccessMsg('');
        setErrorMsg('');
        let allSuccess = true;
        let failedStudents = [];

        try {
            for (const student of students) {
                let studentSuccess = true;
                for (const subject of subjects) {
                    const score = results?.[student._id]?.[subject];
                    if (score !== undefined && score !== '') {
                        const res = await fetch(`${API_BASE_URL}/api/results/set`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                studentId: student._id,
                                teacherId: teacherData._id,
                                className: teacherData.className,
                                term: selectedTerm,
                                subject,
                                score: Number(score),
                                remarks: ''
                            })
                        });
                        if (!res.ok) {
                            studentSuccess = false;
                            allSuccess = false;
                        }
                    }
                    // Push C/A score (moved inside subject loop)
                    const caScore = caScores?.[student._id]?.[subject];
                    if (caScore !== undefined && caScore !== '') {
                        await fetch(`${API_BASE_URL}/api/results/set`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                studentId: student._id,
                                teacherId: teacherData._id,
                                className: teacherData.className,
                                term: selectedTerm,
                                subject: `${subject} C/A`,
                                score: Number(caScore),
                                remarks: ''
                            })
                        });
                    }
                }
                // Save overall score and position
                const overallScore = overall?.[student._id]?.overallScore;
                const position = overall?.[student._id]?.position;
                if (overallScore || position) {
                    const res = await fetch(`${API_BASE_URL}/api/results/set`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentId: student._id,
                            teacherId: teacherData._id,
                            className: teacherData.className,
                            term: selectedTerm,
                            subject: 'Overall',
                            score: Number(overallScore) || 0,
                            remarks: `Position: ${position || ''}`
                        })
                    });
                    if (!res.ok) {
                        studentSuccess = false;
                        allSuccess = false;
                    }
                }
                if (!studentSuccess) {
                    failedStudents.push(student.name || student._id);
                }
            }
            if (allSuccess) {
                setSuccessMsg('Results have been successfully pushed to students.');
            } else {
                setErrorMsg(`Failed to push results for: ${failedStudents.join(', ')}. Please try again.`);
            }
        } catch (err) {
            setErrorMsg('Failed to push results. Please try again.');
        }
        setIsSubmitting(false);
    };

    // Push individual student result
    const handlePushIndividualResult = async (studentId) => {
        setIsSubmitting(true);
        setSuccessMsg('');
        setErrorMsg('');
        let success = true;
        try {
            // Push subjects
            for (const subject of subjects) {
                const score = results?.[studentId]?.[subject];
                if (score !== undefined && score !== '') {
                    const res = await fetch(`${API_BASE_URL}/api/results/set`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentId,
                            teacherId: teacherData._id,
                            className: teacherData.className,
                            term: selectedTerm,
                            subject,
                            score: Number(score),
                            remarks: ''
                        })
                    });
                    if (!res.ok) success = false;
                }
            }
            // Push overall score and position
            const overallScore = overall?.[studentId]?.overallScore;
            const position = overall?.[studentId]?.position;
            if (overallScore || position) {
                const res = await fetch(`${API_BASE_URL}/api/results/set`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId,
                        teacherId: teacherData._id,
                        className: teacherData.className,
                        term: selectedTerm,
                        subject: 'Overall',
                        score: Number(overallScore) || 0,
                        remarks: `Position: ${position || ''}`
                    })
                });
                if (!res.ok) success = false;
            }
            // Push C/A score
            for (const subject of subjects) {
                const caScore = caScores?.[studentId]?.[subject];
                if (caScore !== undefined && caScore !== '') {
                    await fetch(`${API_BASE_URL}/api/results/set`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentId,
                            teacherId: teacherData._id,
                            className: teacherData.className,
                            term: selectedTerm,
                            subject: `${subject} C/A`,
                            score: Number(caScore),
                            remarks: ''
                        })
                    });
                }
            }
            if (success) {
                setSuccessMsg('Student result has been successfully updated.');
            } else {
                setErrorMsg('Failed to update student result. Please try again.');
            }
        } catch (err) {
            setErrorMsg('Failed to update student result. Please try again.');
        }
        setIsSubmitting(false);
    };

    // Term selection before entering main page
    if (!selectedTerm) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="bg-card border border-border rounded-xl shadow-lg p-8 w-full max-w-md text-center">
                    <h2 className="font-heading text-2xl font-bold text-primary mb-4">Select Term</h2>
                    <select
                        className="w-full border rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring"
                        value={selectedTerm}
                        onChange={e => setSelectedTerm(e.target.value)}
                    >
                        <option value="">Choose a term</option>
                        {terms.map(term => (
                            <option key={term.value} value={term.value}>{term.label}</option>
                        ))}
                    </select>
                    <Button
                        variant="default"
                        disabled={!selectedTerm}
                        onClick={() => {}}
                        className="w-full"
                    >
                        <Icon name="ArrowRight" size={16} className="mr-2" />
                        Proceed
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <RoleBasedHeader
                userRole="teacher"
                userName={teacherData?.name || 'Teacher'}
                isCollapsed={false}
            />
            <main className="pt-20 pb-10 bg-background min-h-screen">
                <div className="max-w-5xl mx-auto px-2 sm:px-4">
                    <div className="mb-8">
                        <h1 className="font-heading text-3xl font-bold text-primary mb-2">
                            Result Portal - {terms.find(t => t.value === selectedTerm)?.label}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Grade students who took your exam this term. You can add custom subjects, scores, and set overall score and position.
                        </p>
                    </div>
                    {successMsg && (
                        <div className="bg-success/10 border border-success text-success rounded-md px-4 py-2 mb-4 text-sm">
                            {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="bg-error/10 border border-error text-error rounded-md px-4 py-2 mb-4 text-sm">
                            {errorMsg}
                        </div>
                    )}
                    {/* Subject Tray */}
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                        <span className="font-heading font-semibold text-primary mr-2">Subjects:</span>
                        {subjects.map(subject => (
                            <span key={subject} className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 mr-2">
                                {subject}
                                <button
                                    type="button"
                                    className="ml-2 text-xs text-destructive hover:text-destructive/80"
                                    onClick={() => handleRemoveSubject(subject)}
                                    title="Remove subject"
                                >
                                    <Icon name="X" size={12} />
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            className="border rounded-lg px-2 py-1 text-sm w-24 sm:w-32"
                            placeholder="Add subject"
                            value={newSubject}
                            onChange={e => setNewSubject(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                        />
                        <Button variant="outline" size="sm" onClick={handleAddSubject} disabled={!newSubject.trim()} className="w-full sm:w-auto">
                            <Icon name="Plus" size={14} className="mr-1" />
                            Add
                        </Button>
                    </div>
                    <div className="bg-card border border-border rounded-xl shadow-lg p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="font-heading text-xl font-bold text-foreground">Students in {teacherData?.className} (Exam Taken)</h2>
                            <span className="text-muted-foreground text-sm">{students.length} students</span>
                        </div>
                        {isLoadingStudents || isLoadingResults ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <TbFidgetSpinner className="animate-spin text-5xl text-primary mb-2" />
                                <span className="text-primary font-medium">Loading data...</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-2 sm:px-4 sm:py-2 text-left font-semibold text-muted-foreground text-xs sm:text-sm">Student</th>
                                            {subjects.map(subject => (
                                              <th key={subject} className="px-4 py-2 text-left font-semibold text-muted-foreground">{subject}</th>
                                            ))}
                                            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Overall Score</th>
                                            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Position</th>
                                        </tr>
                                        <tr>
                                            <th className="px-2 py-2 text-left font-semibold text-muted-foreground">C/A</th>
                                            {subjects.map(subject => (
                                              <th key={subject} className="px-4 py-2 text-left font-semibold text-muted-foreground"></th>
                                            ))}
                                            <th colSpan="2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(student => (
                                            <React.Fragment key={student._id}>
                                                {/* C/A Row */}
                                                <tr className="border-b border-border bg-muted/10">
                                                    <td className="px-4 py-2 font-body font-medium text-foreground">
                                                      <span className="text-xs text-muted-foreground">C/A</span>
                                                    </td>
                                                    {subjects.map(subject => (
                                                      <td key={subject} className="px-4 py-2">
                                                        <input
                                                          type="number"
                                                          min="0"
                                                          max="40"
                                                          className="w-16 border rounded-lg px-2 py-1 focus:outline-none focus:ring bg-background"
                                                          value={caScores?.[student._id]?.[subject] || ''}
                                                          onChange={e => setCaScores(prev => ({
                                                            ...prev,
                                                            [student._id]: {
                                                              ...(prev[student._id] || {}),
                                                              [subject]: e.target.value
                                                            }
                                                          }))}
                                                          placeholder="C/A"
                                                        />
                                                      </td>
                                                    ))}
                                                    <td colSpan="2"></td>
                                                </tr>
                                                {/* Exam Row */}
                                                <tr className="border-b border-border hover:bg-muted/20 transition">
                                                    <td className="px-4 py-2 flex items-center space-x-3">
                                                        <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-white border-2 border-primary shadow">
                                                            {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                                                        </span>
                                                        <span className="font-body font-medium text-foreground">{student.name}</span>
                                                        <span className="text-xs text-muted-foreground ml-2">({student.className})</span>
                                                    </td>
                                                    {subjects.map(subject => (
                                                        <td key={subject} className="px-4 py-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="60"
                                                                className="w-16 border rounded-lg px-2 py-1 focus:outline-none focus:ring bg-background"
                                                                value={results?.[student._id]?.[subject] || ''}
                                                                onChange={e => handleResultChange(student._id, subject, e.target.value)}
                                                                placeholder="Exam"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-2">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                className="w-20 border rounded-lg px-2 py-1 focus:outline-none focus:ring bg-background pr-8"
                                                                value={overall?.[student._id]?.overallScore || ''}
                                                                onChange={e => handleOverallChange(student._id, 'overallScore', e.target.value)}
                                                                placeholder="Overall"
                                                            />
                                                            {/* Show percentage label if value exists */}
                                                            {overall?.[student._id]?.overallScore !== undefined && overall?.[student._id]?.overallScore !== '' && (
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                                                    %
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="text"
                                                            className="w-20 border rounded-lg px-2 py-1 focus:outline-none focus:ring bg-background"
                                                            value={overall?.[student._id]?.position || ''}
                                                            onChange={e => handleOverallChange(student._id, 'position', e.target.value)}
                                                            placeholder="Position"
                                                        />
                                                    </td>
                                                </tr>
                                                {/* Push Button Row */}
                                                <tr>
                                                    <td colSpan={subjects.length + 3} className="px-4 py-2 text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePushIndividualResult(student._id)}
                                                            disabled={isSubmitting}
                                                        >
                                                            <Icon name="Send" size={14} className="mr-1" />
                                                            Push This Student's Result
                                                        </Button>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <Button
                                variant="primary"
                                onClick={handleSubmitResults}
                                disabled={isSubmitting || students.length === 0}
                                className="w-full sm:w-auto"
                            >
                                <Icon name="Send" size={16} className="mr-2" />
                                {isSubmitting ? 'Pushing Results...' : 'Push Results to Students'}
                            </Button>
                        </div>
                    </div>
                
                </div>
            </main>
        </>
    );
};

export default ResultPortal;