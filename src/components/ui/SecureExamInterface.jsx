import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

/**
 * SecureExamInterface now expects real exam data via props.
 * Pass actual examTitle, timeRemaining, currentQuestion, totalQuestions, isFullscreen, etc.
 * Example usage:
 * <SecureExamInterface
 *   examTitle={selectedExam?.title}
 *   timeRemaining={selectedExam?.duration * 60}
 *   currentQuestion={currentQuestion}
 *   totalQuestions={selectedExam?.questions?.length}
 *   isFullscreen={isFullscreen}
 *   onExitExam={handleExitExam}
 *   onSubmitExam={handleSubmitExam}
 *   onToggleFullscreen={handleToggleFullscreen}
 * />
 */

const SecureExamInterface = ({
  examTitle,
  timeRemaining,
  currentQuestion,
  totalQuestions,
  isFullscreen,
  onExitExam,
  onSubmitExam,
  onToggleFullscreen,
  className = ''
}) => {
  // Use default values if props are missing
  const [timeLeft, setTimeLeft] = useState(timeRemaining || 3600);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isWarningTime, setIsWarningTime] = useState(false);

  // Timer countdown
  useEffect(() => {
    setTimeLeft(timeRemaining || 3600); // Reset timer if exam changes
  }, [timeRemaining]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmitExam?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSubmitExam, timeRemaining]);

  // Warning time check (last 10 minutes)
  useEffect(() => {
    setIsWarningTime(timeLeft <= 600 && timeLeft > 0);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
    }
    return `${minutes}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!totalQuestions || totalQuestions === 0) return 0;
    return Math.round((currentQuestion / totalQuestions) * 100);
  };

  const handleExitAttempt = () => setShowExitConfirm(true);
  const handleSubmitAttempt = () => setShowSubmitConfirm(true);
  const confirmExit = () => { setShowExitConfirm(false); onExitExam?.(); };
  const confirmSubmit = () => { setShowSubmitConfirm(false); onSubmitExam?.(); };
  const cancelAction = () => { setShowExitConfirm(false); setShowSubmitConfirm(false); };

  return (
    <div className={`fixed top-0 left-0 right-0 bg-card border-b border-border z-1030 ${className}`}>
      {/* Main Exam Header */}
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Left Section - Exam Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="FileText" size={16} color="white" />
            </div>
            <div>
              <h2 className="font-heading font-medium text-sm text-foreground">{examTitle || "Exam"}</h2>
              <p className="font-caption text-xs text-muted-foreground">
                Question {currentQuestion || 1} of {totalQuestions || 1}
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Progress */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="font-caption text-xs text-muted-foreground">Progress:</span>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <span className="font-mono text-xs text-foreground">{getProgressPercentage()}%</span>
          </div>
        </div>

        {/* Right Section - Timer and Actions */}
        <div className="flex items-center space-x-3">
          {/* Timer */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
            isWarningTime ? 'bg-warning text-warning-foreground' : 'bg-muted'
          }`}>
            <Icon name="Clock" size={16} />
            <span className="font-mono text-sm font-medium">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <Icon name={isFullscreen ? "Minimize" : "Maximize"} size={16} />
          </Button>

          {/* Submit Exam */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSubmitAttempt}
            className="hidden sm:flex"
          >
            <Icon name="Send" size={14} className="mr-2" />
            Submit
          </Button>

          {/* Exit Exam */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitAttempt}
            className="text-destructive hover:text-destructive"
            title="Exit Exam"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden px-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-caption text-xs text-muted-foreground">
            Progress: {getProgressPercentage()}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSubmitAttempt}
          >
            <Icon name="Send" size={14} className="mr-1" />
            Submit
          </Button>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1030">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} color="white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground">Exit Exam?</h3>
                <p className="font-body text-sm text-muted-foreground">
                  Are you sure you want to exit? Your progress will be saved.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={cancelAction} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmExit} className="flex-1">
                Exit Exam
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1030">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Send" size={20} color="white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground">Submit Exam?</h3>
                <p className="font-body text-sm text-muted-foreground">
                  You have answered {currentQuestion || 1} of {totalQuestions || 1} questions. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={cancelAction} className="flex-1">
                Continue Exam
              </Button>
              <Button variant="default" onClick={confirmSubmit} className="flex-1">
                Submit Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Time Warning Alert */}
      {isWarningTime && timeLeft > 0 && (
        <div className="bg-warning text-warning-foreground px-4 py-2 text-center">
          <p className="font-body text-sm">
            <Icon name="Clock" size={16} className="inline mr-2" />
            Warning: Only {Math.ceil(timeLeft / 60)} minutes remaining!
          </p>
        </div>
      )}
    </div>
  );
};

export default SecureExamInterface;