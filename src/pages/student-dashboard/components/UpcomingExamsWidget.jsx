import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingExamsWidget = ({ className = '' }) => {
  const [timeRemaining, setTimeRemaining] = useState({});

  const upcomingExams = [
    {
      id: 1,
      subject: 'Mathematics',
      type: 'Final Exam',
      date: '2025-01-15',
      time: '09:00',
      duration: '2 hours',
      questions: 50,
      status: 'scheduled',
      examDate: new Date('2025-01-15T09:00:00')
    },
    {
      id: 2,
      subject: 'Physics',
      type: 'Mid-term Test',
      date: '2025-01-18',
      time: '14:00',
      duration: '1.5 hours',
      questions: 35,
      status: 'scheduled',
      examDate: new Date('2025-01-18T14:00:00')
    },
    {
      id: 3,
      subject: 'Chemistry',
      type: 'Quiz',
      date: '2025-01-20',
      time: '11:00',
      duration: '45 minutes',
      questions: 20,
      status: 'scheduled',
      examDate: new Date('2025-01-20T11:00:00')
    }
  ];

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      const newTimeRemaining = {};

      upcomingExams?.forEach(exam => {
        const timeDiff = exam?.examDate?.getTime() - now?.getTime();
        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          newTimeRemaining[exam.id] = { days, hours, minutes };
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getSubjectIcon = (subject) => {
    const iconMap = {
      'Mathematics': 'Calculator',
      'Physics': 'Zap',
      'Chemistry': 'Flask',
      'Biology': 'Leaf',
      'English': 'BookOpen',
      'History': 'Clock'
    };
    return iconMap?.[subject] || 'FileText';
  };

  const getUrgencyColor = (days) => {
    if (days <= 1) return 'text-error';
    if (days <= 3) return 'text-warning';
    return 'text-success';
  };

  const handleTakeExam = (examId) => {
    window.location.href = '/computer-based-testing-cbt-platform';
  };

  const formatCountdown = (time) => {
    if (!time) return 'Starting soon';
    
    if (time?.days > 0) {
      return `${time?.days}d ${time?.hours}h`;
    } else if (time?.hours > 0) {
      return `${time?.hours}h ${time?.minutes}m`;
    } else {
      return `${time?.minutes}m`;
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Icon name="Clock" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground">Upcoming Exams</h2>
            <p className="text-sm font-body text-muted-foreground">Your scheduled assessments</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = '/computer-based-testing-cbt-platform'}
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {upcomingExams?.map((exam) => (
          <div key={exam?.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name={getSubjectIcon(exam?.subject)} size={16} color="white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-body font-medium text-foreground">{exam?.subject}</h3>
                    <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-caption rounded">
                      {exam?.type}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-body">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} />
                      <span>{exam?.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={14} />
                      <span>{exam?.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Timer" size={14} />
                      <span>{exam?.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="HelpCircle" size={14} />
                      <span>{exam?.questions} questions</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2 ml-4">
                <div className="text-right">
                  <p className="text-xs font-caption text-muted-foreground">Time remaining</p>
                  <p className={`text-sm font-mono font-medium ${getUrgencyColor(timeRemaining?.[exam?.id]?.days || 0)}`}>
                    {formatCountdown(timeRemaining?.[exam?.id])}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTakeExam(exam?.id)}
                  className="whitespace-nowrap"
                >
                  <Icon name="Play" size={14} className="mr-1" />
                  Start
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {upcomingExams?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-body">No upcoming exams scheduled</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingExamsWidget;