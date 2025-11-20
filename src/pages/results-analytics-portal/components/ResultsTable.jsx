import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResultsTable = ({
  results,
  className = '',
  editable = false,
  onChange = () => {},
}) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedResults = [...results]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  // Group results by subject
  const groupedResults = {};
  sortedResults.forEach(result => {
    const baseSubject = result.subject.replace(' C/A', '');
    if (!groupedResults[baseSubject]) groupedResults[baseSubject] = {};
    if (result.subject.endsWith('C/A')) {
      groupedResults[baseSubject].ca = result;
    } else if (result.subject !== 'Overall') {
      groupedResults[baseSubject].exam = result;
    }
  });

  const getGradeColor = (grade) => {
    switch (String(grade).toUpperCase()) {
      case 'A':
        return 'text-success';
      case 'B':
        return 'text-primary';
      case 'C':
        return 'text-warning';
      case 'D':
        return 'text-info';
      case 'E':
        return 'text-muted-foreground';
      case 'F':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPerformanceCategory = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-body text-sm font-medium text-foreground hover:text-primary transition-colors"
    >
      <span>{children}</span>
      <div className="flex flex-col">
        <Icon 
          name="ChevronUp" 
          size={12} 
          className={`${sortField === field && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground'}`}
        />
        <Icon 
          name="ChevronDown" 
          size={12} 
          className={`-mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground'}`}
        />
      </div>
    </button>
  );

  // Calculate overall score and position
  const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
  const totalMarks = results.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
  const overallPercentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
  const position = results[0]?.position || '';

  return (
    <div className={`bg-card border border-border rounded-lg ${className} results-table-responsive`}>
      <div className="p-6 border-b border-border">
        <h3 className="font-heading text-lg font-semibold text-foreground">Exam Results</h3>
        <p className="font-body text-sm text-muted-foreground">Complete history of your academic performance</p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="min-w-[800px] w-full table-fixed md:table-auto text-xs md:text-sm border border-border rounded-lg overflow-hidden">
          <thead className="bg-muted">
            <tr>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Subject</th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Project<br /><span className="text-xs text-muted-foreground">(10%)</span></th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">1st C.A.T<br /><span className="text-xs text-muted-foreground">(20%)</span></th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">2nd C.A.T<br /><span className="text-xs text-muted-foreground">(20%)</span></th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Exam<br /><span className="text-xs text-muted-foreground">(50%)</span></th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Total<br /><span className="text-xs text-muted-foreground">(100%)</span></th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Max Score</th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Min Score</th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Grade</th>
              <th className="px-2 py-2 bg-muted/50 text-center">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.keys(groupedResults)
              .filter(subject => subject !== 'Overall')
              .map(subject => {
                const exam = groupedResults[subject].exam || {};
                const safeSubject = typeof subject === 'string' ? subject.replace(' C/A', '') : '';
                return (
                  <tr key={subject} className="hover:bg-muted/50 transition-colors">
                    <td className="px-2 py-2 border-r border-border bg-white font-semibold text-center break-words whitespace-normal max-w-[120px] md:max-w-none">
                      {safeSubject || <span className="italic text-muted-foreground">N/A</span>}
                    </td>
                    {/* Editable cells for scores */}
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={exam.projectScore ?? ''}
                          onChange={e => onChange(exam.subject, 'projectScore', Number(e.target.value))}
                          className="border rounded px-2 py-1 w-16 text-center"
                        />
                      ) : (
                        <span className="block p-1 rounded bg-primary/10 border border-primary/20">
                          {exam.projectScore ?? <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={exam.firstCatScore ?? ''}
                          onChange={e => onChange(exam.subject, 'firstCatScore', Number(e.target.value))}
                          className="border rounded px-2 py-1 w-16 text-center"
                        />
                      ) : (
                        <span className="block p-1 rounded bg-warning/10 border border-warning/20">
                          {exam.firstCatScore ?? <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={exam.secondCatScore ?? ''}
                          onChange={e => onChange(exam.subject, 'secondCatScore', Number(e.target.value))}
                          className="border rounded px-2 py-1 w-16 text-center"
                        />
                      ) : (
                        <span className="block p-1 rounded bg-warning/10 border border-warning/20">
                          {exam.secondCatScore ?? <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={exam.examScore ?? exam.score ?? ''}
                          onChange={e => onChange(exam.subject, 'examScore', Number(e.target.value))}
                          className="border rounded px-2 py-1 w-16 text-center"
                        />
                      ) : (
                        <span className="block p-1 rounded bg-success/10 border border-success/20">
                          {exam.examScore ?? exam.score ?? <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={exam.totalScore ?? ''}
                          onChange={e => onChange(exam.subject, 'totalScore', Number(e.target.value))}
                          className="border rounded px-2 py-1 w-16 text-center"
                        />
                      ) : (
                        <span className="block p-1 rounded bg-muted/10 border border-muted/20">
                          {exam.totalScore ?? <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          value={exam.maxScore ?? ''}
                          onChange={e => onChange(exam.subject, 'maxScore', Number(e.target.value))}
                          className="border rounded px-2 py-1 w-16 text-center"
                        />
                      ) : (
                        <span className="block p-1 rounded bg-info/10 border border-info/20">
                          {exam.maxScore ?? <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          value={exam.minScore ?? ''}
                          onChange={e => onChange(exam.subject, 'minScore', Number(e.target.value))}
                          className="border rounded px-2 py-1 w-16 text-center"
                        />
                      ) : (
                        <span className="block p-1 rounded bg-error/10 border border-error/20">
                          {exam.minScore ?? <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="text"
                          value={exam.grade ?? ''}
                          onChange={e => onChange(exam.subject, 'grade', e.target.value)}
                          className={`border rounded px-2 py-1 w-16 text-center ${getGradeColor(exam.grade)}`}
                        />
                      ) : (
                        <span className={`block p-1 rounded border ${getGradeColor(exam.grade)} border-border`}>
                          {exam.grade ?? <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 bg-white text-center">
                      {editable ? (
                        <input
                          type="text"
                          value={exam.remark ?? ''}
                          onChange={e => onChange(exam.subject, 'remark', e.target.value)}
                          className="border rounded px-2 py-1 w-24 text-center"
                        />
                      ) : (
                        <span className="block p-1 rounded bg-muted/10 border border-muted/20">
                          {typeof exam.remark === 'string' && exam.remark.trim() !== ''
                            ? exam.remark
                            : <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;