import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const QuestionDisplay = ({
  question = {},
  selectedAnswer,
  onAnswerSelect = () => {},
  onFlagQuestion = () => {},
  isFlagged = false
}) => {
  const [imageError, setImageError] = useState(false);

  // Defensive checks for question structure
  const options = Array.isArray(question.options) ? question.options : [];
  const questionType = (question.type || '').toLowerCase().replace('_', '-');

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {options.length === 0 ? (
        <div className="text-red-500 text-sm">No options provided for this question.</div>
      ) : (
        options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index);
          const optionId = option?.id ?? index.toString();
          const isSelected = selectedAnswer === optionId;
          return (
            <button
              key={optionId}
              onClick={() => onAnswerSelect(optionId)}
              className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              type="button"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                  isSelected
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-600'
                }`}>
                  {optionLetter}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{option?.text ?? String(option)}</p>
                  {option?.image && !imageError && (
                    <div className="mt-2">
                      <Image
                        src={option.image}
                        alt={`Option ${optionLetter}`}
                        className="max-w-xs rounded-md"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );

  const renderTrueFalse = () => (
    <div className="space-y-3">
      {['true', 'false'].map((option) => {
        const isSelected = selectedAnswer === option;
        return (
          <button
            key={option}
            onClick={() => onAnswerSelect(option)}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
              isSelected
                ? 'border-green-500 bg-green-50 text-green-900'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            type="button"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                isSelected
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 text-gray-600'
              }`}>
                <Icon name={option === 'true' ? 'Check' : 'X'} size={16} />
              </div>
              <span className="font-medium capitalize">{option}</span>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderShortAnswer = () => (
    <div className="space-y-3">
      <textarea
        value={selectedAnswer || ''}
        onChange={(e) => onAnswerSelect(e?.target?.value ?? '')}
        placeholder="Type your answer here..."
        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
        rows={6}
        maxLength={500}
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>Characters: {(selectedAnswer || '').length}</span>
        <span>Words: {(selectedAnswer || '').split(/\s+/).filter(word => word.length > 0).length}</span>
      </div>
    </div>
  );

  const renderEssay = () => (
    <div className="space-y-3">
      <textarea
        value={selectedAnswer || ''}
        onChange={(e) => onAnswerSelect(e?.target?.value ?? '')}
        placeholder="Write your essay answer here..."
        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
        rows={10}
        maxLength={2000}
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>Characters: {(selectedAnswer || '').length}</span>
        <span>Words: {(selectedAnswer || '').split(/\s+/).filter(word => word.length > 0).length}</span>
      </div>
    </div>
  );

  // Robust rendering for question number and points
  const questionNumber = typeof question.number === 'number' ? question.number : '';
  const questionPoints = typeof question.points === 'number' ? question.points : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 lg:p-8">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {questionNumber ? `Question ${questionNumber}` : 'Question'}
            </span>
            <span className="text-sm text-gray-500 capitalize">
              {questionType || 'type'}
            </span>
            {questionPoints !== null && (
              <span className="text-sm text-gray-500">
                ({questionPoints} {questionPoints === 1 ? 'point' : 'points'})
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onFlagQuestion}
          className={isFlagged ? 'text-yellow-600' : 'text-gray-400'}
          type="button"
        >
          <Icon name="Flag" size={16} className="mr-2" />
          {isFlagged ? 'Flagged' : 'Flag'}
        </Button>
      </div>
      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 leading-relaxed">
          {question?.text || question?.question || 'No question text provided.'}
        </h3>
        {/* Display question image/photo if present */}
        {question?.image && !imageError && (
          <div className="mb-4">
            <Image
              src={question.image}
              alt="Question illustration"
              className="max-w-full rounded-lg shadow-sm"
              onError={() => setImageError(true)}
            />
          </div>
        )}
        {/* Display photo published from teacher side if present */}
        {question?.photo && !imageError && (
          <div className="mb-4">
            <Image
              src={question.photo}
              alt="Question photo"
              className="max-w-full rounded-lg shadow-sm"
              onError={() => setImageError(true)}
            />
          </div>
        )}
        {question?.instructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">{question.instructions}</p>
            </div>
          </div>
        )}
      </div>
      {/* Answer Options */}
      <div className="space-y-4">
        {['multiple_choice', 'multiple-choice'].includes(questionType) && renderMultipleChoice()}
        {['true_false', 'true-false'].includes(questionType) && renderTrueFalse()}
        {['short_answer', 'short-answer'].includes(questionType) && renderShortAnswer()}
        {['essay'].includes(questionType) && renderEssay()}
        {/* Fallback for unknown type */}
        {!['multiple_choice', 'multiple-choice', 'true_false', 'true-false', 'short_answer', 'short-answer', 'essay'].includes(questionType) && (
          <div className="text-red-500 text-sm">Unknown question type.</div>
        )}
      </div>
      {/* Auto-save Indicator */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <Icon name="Save" size={14} className="text-green-500" />
          <span>Auto-saved</span>
        </div>
        {selectedAnswer && (
          <span className="text-green-600 font-medium">Answer recorded</span>
        )}
      </div>
    </div>
  );
};

export default QuestionDisplay;