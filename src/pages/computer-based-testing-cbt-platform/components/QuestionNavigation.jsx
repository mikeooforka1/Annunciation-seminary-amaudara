import React from 'react';
import Icon from '../../../components/AppIcon';

const QuestionNavigation = ({ 
  questions,
  currentQuestion,
  answeredQuestions,
  flaggedQuestions,
  onQuestionSelect
}) => {
  const getQuestionStatus = (questionNumber) => {
    if (answeredQuestions?.includes(questionNumber)) {
      return flaggedQuestions?.includes(questionNumber) ? 'answered-flagged' : 'answered';
    }
    if (flaggedQuestions?.includes(questionNumber)) {
      return 'flagged';
    }
    return 'unanswered';
  };

  const getStatusColor = (status, isActive) => {
    if (isActive) {
      return 'bg-green-600 text-white border-green-600';
    }
    
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'flagged':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'answered-flagged':
        return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'answered':
        return 'Check';
      case 'flagged':
        return 'Flag';
      case 'answered-flagged':
        return 'AlertCircle';
      default:
        return null;
    }
  };

  const statusCounts = {
    answered: answeredQuestions?.filter(q => !flaggedQuestions?.includes(q))?.length,
    flagged: flaggedQuestions?.filter(q => !answeredQuestions?.includes(q))?.length,
    answeredFlagged: answeredQuestions?.filter(q => flaggedQuestions?.includes(q))?.length,
    unanswered: questions?.length - answeredQuestions?.length
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
      {/* Navigation Header */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Question Navigation</h3>
        
        {/* Status Legend */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-gray-600">Answered ({statusCounts?.answered})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span className="text-gray-600">Flagged ({statusCounts?.flagged})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
            <span className="text-gray-600">Both ({statusCounts?.answeredFlagged})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span className="text-gray-600">Unanswered ({statusCounts?.unanswered})</span>
          </div>
        </div>
      </div>
      {/* Question Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2">
        {questions?.map((question, index) => {
          const questionNumber = index + 1;
          const status = getQuestionStatus(questionNumber);
          const isActive = currentQuestion === questionNumber;
          const statusIcon = getStatusIcon(status);

          return (
            <button
              key={question?.id}
              onClick={() => onQuestionSelect(questionNumber)}
              className={`relative w-10 h-10 border-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                getStatusColor(status, isActive)
              }`}
              title={`Question ${questionNumber} - ${status?.replace('-', ' and ')}`}
            >
              <span className="relative z-10">{questionNumber}</span>
              {statusIcon && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border">
                  <Icon name={statusIcon} size={10} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {/* Progress Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Progress: {answeredQuestions?.length} of {questions?.length}
          </span>
          <span className="font-medium text-gray-900">
            {Math.round((answeredQuestions?.length / questions?.length) * 100)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredQuestions?.length / questions?.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigation;