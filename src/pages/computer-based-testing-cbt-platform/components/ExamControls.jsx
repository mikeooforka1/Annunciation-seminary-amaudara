import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExamControls = ({ 
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmitExam,
  hasAnswered,
  canGoNext,
  canGoPrevious
}) => {
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const handleSubmitClick = () => {
    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    onSubmitExam();
  };

  const handleCancelSubmit = () => {
    setShowSubmitConfirm(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left - Previous Button */}
            <div className="flex-1">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="w-full sm:w-auto"
              >
                <Icon name="ChevronLeft" size={16} className="mr-2" />
                Previous
              </Button>
            </div>

            {/* Center - Question Counter */}
            <div className="flex-1 flex justify-center">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {currentQuestion} of {totalQuestions}
                </span>
              </div>
            </div>

            {/* Right - Next/Submit Button */}
            <div className="flex-1 flex justify-end space-x-3">
              {currentQuestion < totalQuestions ? (
                <Button
                  variant="default"
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="w-full sm:w-auto"
                >
                  Next
                  <Icon name="ChevronRight" size={16} className="ml-2" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleSubmitClick}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  Submit Exam
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="mt-3 sm:hidden">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round((currentQuestion / totalQuestions) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={24} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Submit Exam?</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-medium text-gray-900 ml-2">{totalQuestions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Current Question:</span>
                  <span className="font-medium text-gray-900 ml-2">{currentQuestion}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleCancelSubmit}
                className="flex-1"
              >
                Continue Exam
              </Button>
              <Button
                variant="default"
                onClick={handleConfirmSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Icon name="Send" size={16} className="mr-2" />
                Submit Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamControls;