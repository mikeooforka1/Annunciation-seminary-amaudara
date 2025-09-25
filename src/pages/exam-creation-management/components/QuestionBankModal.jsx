import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const QuestionBankModal = ({ isOpen, onClose, onImportQuestions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    subject: '',
    difficulty: '',
    type: '',
    options: [],
    correctAnswer: '',
    points: 1
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);

  // Fetch questions from backend
  useEffect(() => {
    if (!isOpen) return;
    async function fetchQuestions() {
      try {
        const res = await fetch('/api/question-bank');
        const data = await res.json();
        setQuestionBank(Array.isArray(data) ? data : []);
      } catch {
        setQuestionBank([]);
      }
    }
    fetchQuestions();
  }, [isOpen]);

  // Infinite scroll fetch
  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    setHasMore(true);
    setQuestionBank([]);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !hasMore) return;
    async function fetchQuestions() {
      try {
        const res = await fetch(`/api/question-bank?page=${page}&limit=20`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setQuestionBank(prev => [...prev, ...data]);
          if (data.length < 20) setHasMore(false);
        } else {
          setHasMore(false);
        }
      } catch {
        setHasMore(false);
      }
    }
    fetchQuestions();
  }, [isOpen, page, hasMore]);

  const subjectOptions = [
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'english', label: 'English Language' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'geography', label: 'Geography' },
    { value: 'history', label: 'History' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const typeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' }
  ];

  const filteredQuestions = questionBank?.filter(question => {
    const matchesSearch = question?.question?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesSubject = !selectedSubject || question?.subject === selectedSubject;
    const matchesDifficulty = !selectedDifficulty || question?.difficulty === selectedDifficulty;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev?.includes(questionId)) {
        return prev?.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions?.length === filteredQuestions?.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions?.map(q => q?._id));
    }
  };

  const handleImport = () => {
    const questionsToImport = questionBank?.filter(q => selectedQuestions?.includes(q?._id));
    onImportQuestions(questionsToImport);
    onClose();
    setSelectedQuestions([]);
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple-choice': return 'CheckCircle';
      case 'true-false': return 'ToggleLeft';
      case 'short-answer': return 'Edit3';
      case 'essay': return 'FileText';
      default: return 'HelpCircle';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  // Add new question to bank (match backend schema)
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        question: newQuestion.question,
        subject: newQuestion.subject,
        difficulty: newQuestion.difficulty,
        type: newQuestion.type,
        options: newQuestion.type === 'multiple-choice' ? newQuestion.options : [],
        correctAnswer: newQuestion.correctAnswer,
        points: Number(newQuestion.points) || 1
      };
      const res = await fetch('/api/question-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setQuestionBank(prev => [data, ...prev]);
        setShowAddForm(false);
        setNewQuestion({
          question: '',
          subject: '',
          difficulty: '',
          type: '',
          options: [],
          correctAnswer: '',
          points: 1
        });
      }
    } catch {}
  };

  // Handle options for multiple-choice
  const handleOptionChange = (index, value) => {
    setNewQuestion(prev => {
      const options = [...prev.options];
      options[index] = value;
      return { ...prev, options };
    });
  };

  const handleAddOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  // Infinite scroll handler
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050 p-4">
      <div
        className="bg-card border border-border rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
        style={{ minHeight: '400px', marginTop: '64px' }} // Add marginTop to push modal down
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">
              Question Bank
            </h2>
            <p className="text-sm text-muted-foreground">
              Add and import your own questions for exams
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Icon name="Plus" size={16} className="mr-1" />
              {showAddForm ? 'Cancel' : 'Add Question'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Add Question Form */}
        {showAddForm && (
          <form className="p-4 border-b border-border space-y-4" onSubmit={handleAddQuestion}>
            <Input
              label="Question"
              type="text"
              placeholder="Enter question"
              value={newQuestion.question}
              onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Subject"
                options={subjectOptions}
                value={newQuestion.subject}
                onChange={val => setNewQuestion({ ...newQuestion, subject: val })}
                required
              />
              <Select
                label="Difficulty"
                options={difficultyOptions}
                value={newQuestion.difficulty}
                onChange={val => setNewQuestion({ ...newQuestion, difficulty: val })}
                required
              />
              <Select
                label="Type"
                options={typeOptions}
                value={newQuestion.type}
                onChange={val => setNewQuestion({ ...newQuestion, type: val, options: [], correctAnswer: '' })}
                required
              />
            </div>
            {newQuestion.type === 'multiple-choice' && (
              <div>
                <label className="block text-sm font-medium mb-1">Options</label>
                {newQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={e => handleOptionChange(idx, e.target.value)}
                      required
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setNewQuestion(prev => ({
                          ...prev,
                          options: prev.options.filter((_, i) => i !== idx)
                        }))
                      }
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddOption}>
                  <Icon name="Plus" size={12} className="mr-1" />
                  Add Option
                </Button>
                <Input
                  label="Correct Answer (option number)"
                  type="number"
                  min={1}
                  max={newQuestion.options.length}
                  value={newQuestion.correctAnswer}
                  onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                  required
                />
              </div>
            )}
            {(newQuestion.type === 'short-answer' || newQuestion.type === 'true-false') && (
              <Input
                label="Correct Answer"
                type="text"
                placeholder="Enter correct answer"
                value={newQuestion.correctAnswer}
                onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                required
              />
            )}
            <Input
              label="Points"
              type="number"
              min={1}
              value={newQuestion.points}
              onChange={e => setNewQuestion({ ...newQuestion, points: e.target.value })}
              required
            />
            <Button type="submit" variant="primary" className="w-full">
              Save Question
            </Button>
          </form>
        )}

        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
            />
            <Select
              options={[{ value: '', label: 'All Subjects' }, ...subjectOptions]}
              value={selectedSubject}
              onChange={setSelectedSubject}
              placeholder="Filter by subject"
            />
            <Select
              options={[{ value: '', label: 'All Levels' }, ...difficultyOptions]}
              value={selectedDifficulty}
              onChange={setSelectedDifficulty}
              placeholder="Filter by difficulty"
            />
          </div>
        </div>

        {/* Results Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-muted-foreground">
                {filteredQuestions?.length} questions found
              </p>
              {selectedQuestions?.length > 0 && (
                <p className="text-sm text-primary">
                  {selectedQuestions?.length} selected
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedQuestions?.length === filteredQuestions?.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedQuestions?.length > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleImport}
                  iconName="Download"
                  iconPosition="left"
                >
                  Import Selected ({selectedQuestions?.length})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Questions List with infinite scroll and custom scroller */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#6366f1 #f3f4f6',
            maxHeight: '400px',
            minHeight: '200px'
          }}
          onScroll={handleScroll}
        >
          {filteredQuestions?.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredQuestions?.map((question) => (
                <div
                  key={question?._id}
                  className={`p-4 hover:bg-muted transition-colors ${
                    selectedQuestions?.includes(question?._id) ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedQuestions?.includes(question?._id)}
                      onChange={() => handleQuestionSelect(question?._id)}
                      className="mt-1 w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring focus:ring-2"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon 
                          name={getQuestionTypeIcon(question?.type)} 
                          size={16} 
                          className="text-muted-foreground" 
                        />
                        <span className="text-xs font-caption text-muted-foreground uppercase">
                          {question?.type?.replace('-', ' ')}
                        </span>
                        <span className={`text-xs font-caption uppercase ${getDifficultyColor(question?.difficulty)}`}>
                          {question?.difficulty}
                        </span>
                        <span className="text-xs font-caption text-muted-foreground">
                          {question?.points} pts
                        </span>
                      </div>
                      <p className="font-body text-foreground mb-2 line-clamp-2">
                        {question?.question}
                      </p>
                      {question?.type === 'multiple-choice' && question?.options && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {question?.options?.slice(0, 2)?.map((option, index) => (
                            <p key={index} className="text-sm text-muted-foreground truncate">
                              {String.fromCharCode(65 + index)}. {option}
                            </p>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-muted-foreground capitalize">
                            {question?.subject}
                          </span>
                          {/* Usage count can be added if tracked */}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <Icon name="Loader" size={24} className="animate-spin text-primary" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Icon name="Search" size={48} className="text-muted-foreground mb-4" />
              <h3 className="font-heading font-medium text-lg text-foreground mb-2">
                No Questions Found
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Try adding new questions or adjusting your search criteria.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Select questions to import into your exam
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleImport}
                disabled={selectedQuestions?.length === 0}
                iconName="Download"
                iconPosition="left"
              >
                Import {selectedQuestions?.length > 0 ? `(${selectedQuestions?.length})` : ''}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* ...custom scrollbar styles... */}
    </div>
  );
};

export default QuestionBankModal;