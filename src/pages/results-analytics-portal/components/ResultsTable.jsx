import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResultsTable = ({ results, className = '' }) => {
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

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 80) return 'text-primary';
    if (percentage >= 70) return 'text-warning';
    return 'text-error';
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

  // If you have position data, use it; otherwise, leave blank or calculate if possible
  const position = results[0]?.position || ''; // Replace with actual logic if available

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <div className="p-6 border-b border-border">
        <h3 className="font-heading text-lg font-semibold text-foreground">Exam Results</h3>
        <p className="font-body text-sm text-muted-foreground">Complete history of your academic performance</p>
      </div>
      <div className="results-table mb-8 overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left">Subject</th>
                <th className="px-6 py-3 text-left">Exam Score</th>
                <th className="px-6 py-3 text-left">C/A Score</th>
                <th className="px-6 py-3 text-left">Term</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Subject rows */}
              {Object.keys(groupedResults)
                .filter(subject => subject !== 'Overall')
                .map(subject => (
                  <tr key={subject} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-body text-sm text-foreground">{subject}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-foreground">
                        {groupedResults[subject].exam?.score !== undefined
                          ? groupedResults[subject].exam.score
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-foreground">
                        {groupedResults[subject].ca?.score !== undefined
                          ? groupedResults[subject].ca.score
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-foreground">
                        {groupedResults[subject].exam?.term || groupedResults[subject].ca?.term || ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-foreground">
                        {groupedResults[subject].exam?.date
                          ? new Date(groupedResults[subject].exam.date).toLocaleDateString('en-GB')
                          : groupedResults[subject].ca?.date
                          ? new Date(groupedResults[subject].ca.date).toLocaleDateString('en-GB')
                          : ''}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;