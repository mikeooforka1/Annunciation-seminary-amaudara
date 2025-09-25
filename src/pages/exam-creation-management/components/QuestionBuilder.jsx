import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { IoMdAttach } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";


const QuestionBuilder = ({ 
  questions = [], 
  onQuestionsChange, 
  onAddQuestion, 
  onDeleteQuestion,
  onImportQuestions 
}) => {
  const [activeQuestionType, setActiveQuestionType] = useState('multiple-choice');
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    explanation: ''
  });
  const [attachedImage, setAttachedImage] = useState(null);

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice', icon: 'CheckCircle' },
    { value: 'true-false', label: 'True/False', icon: 'ToggleLeft' },
    { value: 'short-answer', label: 'Short Answer', icon: 'Edit3' },
    { value: 'essay', label: 'Essay', icon: 'FileText' }
  ];

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion?.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (currentQuestion?.options?.length < 6) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev?.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (currentQuestion?.options?.length > 2) {
      const newOptions = currentQuestion?.options?.filter((_, i) => i !== index);
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const saveQuestion = () => {
    if (currentQuestion?.question?.trim()) {
      const questionToSave = {
        ...currentQuestion,
        id: Date.now(),
        type: activeQuestionType
      };
      onAddQuestion(questionToSave);
      
      // Reset form for next question, keeping last selected type
      setCurrentQuestion({
        type: activeQuestionType,
        question: '',
        options: activeQuestionType === 'multiple-choice' ? ['', '', '', ''] : [],
        correctAnswer: '',
        points: 1,
        explanation: ''
      });
    }
  };

  // Handle image upload
  const handleImageAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert image to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result);
        handleQuestionChange('image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderQuestionForm = () => {
    switch (activeQuestionType) {
      case 'multiple-choice':
      case 'true-false':
      case 'short-answer':
      case 'essay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Question Text
              </label>
              <div className="flex items-center gap-2">
                <textarea
                  className="w-full h-24 px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  placeholder="Enter your question here..."
                  value={currentQuestion?.question}
                  onChange={(e) => handleQuestionChange('question', e?.target?.value)}
                />
                <label className="cursor-pointer flex items-center">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageAttach}
                  />
                  <IoMdAttach size={24} className="text-primary hover:text-accent" title="Attach Image" />
                </label>
              </div>
              {attachedImage && (
                <div className="mt-2">
                  <img
                    src={attachedImage}
                    alt="Attached"
                    className="max-w-xs rounded-md border border-border"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAttachedImage(null);
                      handleQuestionChange('image', '');
                    }}
                    className="mt-2 text-destructive"
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-body font-medium text-foreground">
                  Answer Options
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  iconName="Plus"
                  iconPosition="left"
                  disabled={currentQuestion?.options?.length >= 6}
                >
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-2">
                {currentQuestion?.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={index}
                        checked={currentQuestion?.correctAnswer === index?.toString()}
                        onChange={(e) => handleQuestionChange('correctAnswer', e?.target?.value)}
                        className="w-4 h-4 text-primary bg-input border-border focus:ring-ring focus:ring-2"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e?.target?.value)}
                      />
                    </div>
                    {currentQuestion?.options?.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="hover:bg-muted"
                      >
                        <RiDeleteBin6Line size={18} color="black" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Question Text
              </label>
              <textarea
                className="w-full h-24 px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                placeholder="Enter your true/false statement..."
                value={currentQuestion?.question}
                onChange={(e) => handleQuestionChange('question', e?.target?.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-3">
                Correct Answer
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="trueFalseAnswer"
                    value="true"
                    checked={currentQuestion?.correctAnswer === 'true'}
                    onChange={(e) => handleQuestionChange('correctAnswer', e?.target?.value)}
                    className="w-4 h-4 text-primary bg-input border-border focus:ring-ring focus:ring-2"
                  />
                  <span className="text-sm font-body text-foreground">True</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="trueFalseAnswer"
                    value="false"
                    checked={currentQuestion?.correctAnswer === 'false'}
                    onChange={(e) => handleQuestionChange('correctAnswer', e?.target?.value)}
                    className="w-4 h-4 text-primary bg-input border-border focus:ring-ring focus:ring-2"
                  />
                  <span className="text-sm font-body text-foreground">False</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'short-answer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Question Text
              </label>
              <textarea
                className="w-full h-24 px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                placeholder="Enter your question here..."
                value={currentQuestion?.question}
                onChange={(e) => handleQuestionChange('question', e?.target?.value)}
              />
            </div>
            <Input
              label="Sample Answer (for reference)"
              type="text"
              placeholder="Enter a sample correct answer..."
              value={currentQuestion?.correctAnswer}
              onChange={(e) => handleQuestionChange('correctAnswer', e?.target?.value)}
              description="This will help with manual grading"
            />
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Question Text
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                placeholder="Enter your essay question here..."
                value={currentQuestion?.question}
                onChange={(e) => handleQuestionChange('question', e?.target?.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Grading Rubric (Optional)
              </label>
              <textarea
                className="w-full h-24 px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                placeholder="Enter grading criteria and expectations..."
                value={currentQuestion?.explanation}
                onChange={(e) => handleQuestionChange('explanation', e?.target?.value)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Allow teacher to select question type for each question
  const handleQuestionTypeChange = (type) => {
    setActiveQuestionType(type);
    setCurrentQuestion({
      type,
      question: '',
      options: type === 'multiple-choice' ? ['', '', '', ''] : [],
      correctAnswer: '',
      points: 1,
      explanation: ''
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="font-heading font-semibold text-lg text-foreground">
            Question Builder
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onImportQuestions}
              iconName="Upload"
              iconPosition="left"
              className="w-full sm:w-auto"
            >
              Import
            </Button>
            <span className="text-sm text-muted-foreground self-center sm:self-auto">
              {questions?.length} questions
            </span>
          </div>
        </div>
      </div>
      {/* Question Type Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {questionTypes?.map((type) => (
          <button
            key={type?.value}
            onClick={() => handleQuestionTypeChange(type?.value)}
            className={`flex items-center px-4 py-3 text-sm font-body border-b-2 transition-colors whitespace-nowrap ${
              activeQuestionType === type?.value
                ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon name={type?.icon} size={16} className="mr-2" />
            {type?.label}
          </button>
        ))}
      </div>
      {/* Question Form */}
      <div className="flex-1 p-2 sm:p-4 overflow-y-auto">
        <div className="space-y-6">
          {renderQuestionForm()}

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Points"
              type="number"
              placeholder="1"
              value={currentQuestion?.points}
              onChange={(e) => handleQuestionChange('points', parseInt(e?.target?.value) || 1)}
              min="1"
              max="100"
            />

            {activeQuestionType !== 'essay' && (
              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Explanation (Optional)
                </label>
                <textarea
                  className="w-full h-20 px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  placeholder="Explain the correct answer..."
                  value={currentQuestion?.explanation}
                  onChange={(e) => handleQuestionChange('explanation', e?.target?.value)}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setCurrentQuestion({
                type: activeQuestionType,
                question: '',
                options: activeQuestionType === 'multiple-choice' ? ['', '', '', ''] : [],
                correctAnswer: '',
                points: 1,
                explanation: ''
              })}
            >
              Clear
            </Button>
            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={saveQuestion}
              iconName="Plus"
              iconPosition="left"
              disabled={!currentQuestion?.question?.trim()}
            >
              Add Question
            </Button>
          </div>
        </div>
      </div>
      {/* Questions List */}
      {questions?.length > 0 && (
        <div className="border-t border-border p-2 sm:p-4">
          <h3 className="font-body font-medium text-foreground mb-3">
            Added Questions ({questions?.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {questions?.map((question, index) => (
              <div key={question?.id} className="flex flex-col sm:flex-row items-center justify-between p-2 bg-muted rounded-lg gap-2 sm:gap-0 w-full">
                <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-3 gap-2 sm:gap-0 w-full">
                  <span className="text-sm font-mono text-muted-foreground">
                    Q{index + 1}
                  </span>
                  <span className="text-sm font-body text-foreground truncate max-w-xs">
                    {question?.question}
                  </span>
                  <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                    {question?.points} pts
                  </span>
                  <span className="text-xs text-primary bg-background px-2 py-1 rounded">
                    {questionTypes.find(qt => qt.value === question.type)?.label}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteQuestion(question?.id)}
                  className="icon-btn"
                  aria-label="Delete Question"
                >
                  <RiDeleteBin6Line size={18} color="black" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBuilder;