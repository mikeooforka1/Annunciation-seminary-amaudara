import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExamHeader = ({ 
  examTitle,
  subject,
  timeRemaining,
  studentName,
  onExitExam,
  isWarningTime,
  isCriticalTime
}) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
    }
    return `${minutes}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (isCriticalTime) return 'text-red-600 bg-red-50';
    if (isWarningTime) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section - School Logo and Exam Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* School Logo */}
            <img
              src="/assets/images/school_logo-1754996036714.jpg"
              alt="Goshen Academy Logo"
              className="w-10 h-10 rounded-full border-2 border-green-700 object-cover"
            />
            <div className="hidden sm:block">
              <h1 className="font-semibold text-lg text-gray-900">GOSHEN Academy</h1>
              <p className="text-xs text-gray-500">CBT Platform</p>
            </div>
          </div>
          
          <div className="hidden md:block h-8 w-px bg-gray-300"></div>
          
          <div className="hidden md:block">
            <h2 className="font-medium text-gray-900">{examTitle}</h2>
            <p className="text-sm text-gray-600">{subject}</p>
          </div>
        </div>

        {/* Center Section - Student Info (Desktop) */}
        <div className="hidden lg:flex items-center space-x-2">
          <Icon name="User" size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{studentName}</span>
        </div>

        {/* Right Section - Timer and Exit */}
        <div className="flex items-center space-x-3">
          {/* Timer */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getTimerColor()}`}>
            <Icon name="Clock" size={18} />
            <span className="font-mono text-lg font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Emergency Exit */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExitExam}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
      </div>

      {/* Mobile Exam Info */}
      <div className="md:hidden px-4 pb-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-gray-900 text-sm">{examTitle}</h2>
            <p className="text-xs text-gray-600">{subject}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Icon name="User" size={14} />
            <span>{studentName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHeader;