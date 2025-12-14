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
      groupedResults[baseSubject].cat1 = result; // Only one C.A.T
    } else if (result.subject !== 'Overall') {
      groupedResults[baseSubject].exam = result;
    }
  });

  const getGradeColor = (grade) => {
    switch (String(grade).toUpperCase()) {
      case 'A1':
        return 'text-success';
      case 'B2':
      case 'B3':
        return 'text-primary';
      case 'C4':
      case 'C5':
      case 'C6':
        return 'text-warning';
      case 'D7':
      case 'E8':
        return 'text-info';
      case 'F9':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
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

  return (
    <div className={`bg-card border border-border rounded-lg ${className} results-table-responsive`}>
      <div className="p-6 border-b border-border">
        <h3 className="font-heading text-lg font-semibold text-foreground">Exam Results</h3>
        <p className="font-body text-sm text-muted-foreground">Complete history of your academic performance</p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="min-w-[700px] w-full table-fixed md:table-auto text-xs md:text-sm border border-border rounded-lg overflow-hidden">
          <thead className="bg-muted">
            <tr>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Subject</th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">C.A.T<br /><span className="text-xs text-muted-foreground">(30%)</span></th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Exam<br /><span className="text-xs text-muted-foreground">(70%)</span></th>
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Total<br /><span className="text-xs text-muted-foreground">(100%)</span></th>
              {/* Removed Max Score */}
              {/* Removed Min Score */}
              <th className="px-2 py-2 border-r border-border bg-muted/50 text-center">Grade</th>
              <th className="px-2 py-2 bg-muted/50 text-center">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.keys(groupedResults)
              .filter(subject => subject !== 'Overall')
              .map(subject => {
                const cat1 = groupedResults[subject].cat1 || {};
                const exam = groupedResults[subject].exam || {};
                const cat1Score = cat1.score ?? '';
                const examScore = exam.score ?? '';
                const total = (Number(cat1Score) || 0) + (Number(examScore) || 0);
                return (
                  <tr key={subject} className="hover:bg-muted/50 transition-colors">
                    <td className="px-2 py-2 border-r border-border bg-white font-semibold text-center break-words whitespace-normal max-w-[120px] md:max-w-none">
                      {subject || <span className="italic text-muted-foreground">N/A</span>}
                    </td>
                    {/* C.A.T (30%) */}
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={cat1Score}
                          onChange={e => onChange(subject, 'cat1', Number(e.target.value))}
                          className="border rounded px-2 py-1 w-16 text-center"
                        />
                      ) : (
                        <span className="block p-1 rounded bg-warning/10 border border-warning/20">
                          {cat1Score !== '' ? cat1Score : <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    {/* Exam (70%) */}
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="number"
                          min="0"
                          max="70"
                          value={examScore}
                          onChange={e => onChange(subject, 'exam', Number(e.target.value))}
                          className="border rounded px-2 py-1 w-16 text-center"
                        />
                      ) : (
                        <span className="block p-1 rounded bg-success/10 border border-success/20">
                          {examScore !== '' ? examScore : <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    {/* Total (100%) */}
                    <td className="px-2 py-2 border-r border-border bg-white text-center font-bold text-primary">
                      {total}
                    </td>
                    {/* Removed Max Score */}
                    {/* Removed Min Score */}
                    {/* Grade */}
                    <td className="px-2 py-2 border-r border-border bg-white text-center">
                      {editable ? (
                        <input
                          type="text"
                          value={exam.grade ?? ''}
                          onChange={e => onChange(subject, 'grade', e.target.value)}
                          className={`border rounded px-2 py-1 w-16 text-center font-bold ${getGradeColor(exam.grade)}`}
                        />
                      ) : (
                        <span
                          className={`block p-1 rounded font-bold ${getGradeColor(exam.grade)}`}
                          style={{ minWidth: 40 }}
                        >
                          {exam.grade ?? <span className="italic text-muted-foreground">N/A</span>}
                        </span>
                      )}
                    </td>
                    {/* Remark */}
                    <td className="px-2 py-2 bg-white text-center">
                      {editable ? (
                        <input
                          type="text"
                          value={exam.remark ?? ''}
                          onChange={e => onChange(subject, 'remark', e.target.value)}
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