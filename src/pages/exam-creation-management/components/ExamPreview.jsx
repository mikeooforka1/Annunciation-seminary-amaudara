import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExamPreview = ({
  examData,
  questions = [],
  onClose,
  onSave,
  onEditSchedule // <-- use this prop name
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [viewMode, setViewMode] = useState('desktop');
  const [editableQuestions, setEditableQuestions] = useState(questions);

  // Local state for editing schedule
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [startDate, setStartDate] = useState(examData?.startDate || '');
  const [endDate, setEndDate] = useState(examData?.endDate || '');

  const handleEditQuestion = (index, field, value) => {
    const updated = editableQuestions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setEditableQuestions(updated);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < editableQuestions?.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = editableQuestions?.[currentQuestionIndex];

  const renderQuestion = (question, index) => {
    if (!question) return null;
    switch (question?.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <input
                className="w-full font-body text-foreground bg-transparent border-none focus:ring-2 focus:ring-primary"
                value={question?.question}
                onChange={e => handleEditQuestion(index, 'question', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {question?.options?.map((option, optIdx) => (
                <div key={optIdx} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                  <span className="font-body text-foreground">
                    {String.fromCharCode(65 + optIdx)}.
                  </span>
                  <input
                    className="w-full bg-transparent border-none focus:ring-2 focus:ring-primary"
                    value={option}
                    onChange={e => {
                      const newOptions = [...question.options];
                      newOptions[optIdx] = e.target.value;
                      handleEditQuestion(index, 'options', newOptions);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case 'true-false':
      case 'short-answer':
      case 'essay':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <input
                className="w-full font-body text-foreground bg-transparent border-none focus:ring-2 focus:ring-primary"
                value={question?.question}
                onChange={e => handleEditQuestion(index, 'question', e.target.value)}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getViewModeClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  // Save/apply changes to parent state
  const handleSave = () => {
    // Pass edited questions and possibly updated schedule
    if (onSave) onSave(editableQuestions, startDate, endDate);
    onClose();
  };

  // Save schedule changes
  const handleSaveSchedule = () => {
    if (onEditSchedule) {
      onEditSchedule({ startDate, endDate });
    }
    setEditingSchedule(false);
  };

  // Format schedule date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1040 p-4">
      <div
        className="bg-card border border-border rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col"
        style={{ marginTop: '64px' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-semibold text-lg text-foreground">
                Exam Preview
              </h2>
              <p className="text-sm text-muted-foreground">
                {examData?.title || 'Untitled Exam'}
              </p>
              {/* Schedule Date Display & Edit */}
              <div className="mt-2 flex items-center gap-2">
                {editingSchedule ? (
                  <>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    />
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    />
                    <Button
                      variant="success"
                      size="xs"
                      onClick={handleSaveSchedule}
                      iconName="Save"
                      iconPosition="left"
                      className="ml-2"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setEditingSchedule(false);
                        setStartDate(examData?.startDate || '');
                        setEndDate(examData?.endDate || '');
                      }}
                      iconName="X"
                      iconPosition="left"
                      className="ml-2"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground">
                      <Icon name="Calendar" size={14} className="mr-1" />
                      <strong>Start:</strong> {formatDate(startDate)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <strong>End:</strong> {formatDate(endDate)}
                    </span>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setEditingSchedule(true)}
                      iconName="Edit"
                      iconPosition="left"
                      className="ml-2"
                    >
                      Edit Schedule
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Mode Selector */}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`px-3 py-1 text-sm font-body ${
                    viewMode === 'desktop' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name="Monitor" size={16} />
                </button>
                <button
                  onClick={() => setViewMode('tablet')}
                  className={`px-3 py-1 text-sm font-body ${
                    viewMode === 'tablet' 
                      ? 'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name="Tablet" size={16} />
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`px-3 py-1 text-sm font-body ${
                    viewMode === 'mobile' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name="Smartphone" size={16} />
                </button>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className={getViewModeClass()}>
            {/* Exam Header */}
            <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-heading font-semibold text-xl">
                    {examData?.title || 'Sample Exam'}
                  </h1>
                  <p className="text-sm opacity-90">
                    {examData?.subject} • {examData?.duration} minutes • {examData?.totalMarks} marks
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono">01:30:00</div>
                  <div className="text-sm opacity-90">Time Remaining</div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            {examData?.instructions && (
              <div className="bg-muted p-4 border-x border-border">
                <h3 className="font-body font-medium text-foreground mb-2">Instructions:</h3>
                <p className="text-sm text-muted-foreground">{examData?.instructions}</p>
              </div>
            )}

            {/* Question Navigation */}
            {editableQuestions?.length > 0 && (
              <div className="bg-card border-x border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-body font-medium text-foreground">
                    Question {currentQuestionIndex + 1} of {editableQuestions?.length}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {currentQuestion?.points || 1} point{(currentQuestion?.points || 1) !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Question Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
                  {editableQuestions?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 text-xs font-mono rounded ${
                        index === currentQuestionIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-muted'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {/* Current Question */}
                {currentQuestion && renderQuestion(currentQuestion, currentQuestionIndex)}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    iconName="ChevronLeft"
                    iconPosition="left"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="default"
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === editableQuestions?.length - 1}
                    iconName="ChevronRight"
                    iconPosition="right"
                  >
                    Next
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleSave}
                    iconName="Save"
                    iconPosition="left"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {editableQuestions?.length === 0 && (
              <div className="bg-card border-x border-border p-8 text-center">
                <Icon name="FileQuestion" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-heading font-medium text-lg text-foreground mb-2">
                  No Questions Added
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add questions using the Question Builder to see the exam preview.
                </p>
              </div>
            )}

            <div className="h-4 bg-card border-x border-b border-border rounded-b-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPreview;