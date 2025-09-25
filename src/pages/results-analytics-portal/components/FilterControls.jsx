import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const FilterControls = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  subjects = [],
  examTypes = [],
  className = '' 
}) => {
  const subjectOptions = [
    { value: '', label: 'All Subjects' },
    ...subjects?.map(subject => ({ value: subject, label: subject }))
  ];

  const examTypeOptions = [
    { value: '', label: 'All Exam Types' },
    ...examTypes?.map(type => ({ value: type, label: type }))
  ];

  const performanceOptions = [
    { value: '', label: 'All Performance' },
    { value: 'excellent', label: 'Excellent (90%+)' },
    { value: 'very-good', label: 'Very Good (80-89%)' },
    { value: 'good', label: 'Good (70-79%)' },
    { value: 'satisfactory', label: 'Satisfactory (60-69%)' },
    { value: 'needs-improvement', label: 'Needs Improvement (<60%)' }
  ];

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground">Filter Results</h3>
          <p className="font-body text-sm text-muted-foreground">Customize your view of academic performance</p>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
          >
            <Icon name="X" size={14} className="mr-2" />
            Clear All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Subject Filter */}
        <Select
          label="Subject"
          options={subjectOptions}
          value={filters?.subject}
          onChange={(value) => onFilterChange('subject', value)}
          placeholder="Select subject"
        />

        {/* Exam Type Filter */}
        <Select
          label="Exam Type"
          options={examTypeOptions}
          value={filters?.examType}
          onChange={(value) => onFilterChange('examType', value)}
          placeholder="Select exam type"
        />

        {/* Performance Filter */}
        <Select
          label="Performance Level"
          options={performanceOptions}
          value={filters?.performance}
          onChange={(value) => onFilterChange('performance', value)}
          placeholder="Select performance"
        />

        {/* Date Range */}
        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-foreground">Date Range</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              placeholder="From"
              value={filters?.dateFrom}
              onChange={(e) => onFilterChange('dateFrom', e?.target?.value)}
              className="text-xs"
            />
            <Input
              type="date"
              placeholder="To"
              value={filters?.dateTo}
              onChange={(e) => onFilterChange('dateTo', e?.target?.value)}
              className="text-xs"
            />
          </div>
        </div>
      </div>
      {/* Quick Filter Buttons */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="font-body text-sm font-medium text-foreground mb-3">Quick Filters</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange('dateRange', 'thisMonth')}
          >
            <Icon name="Calendar" size={14} className="mr-2" />
            This Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange('dateRange', 'lastMonth')}
          >
            <Icon name="CalendarDays" size={14} className="mr-2" />
            Last Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange('dateRange', 'thisSemester')}
          >
            <Icon name="BookOpen" size={14} className="mr-2" />
            This Semester
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFilterChange('performance', 'excellent')}
          >
            <Icon name="Star" size={14} className="mr-2" />
            Top Scores
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;