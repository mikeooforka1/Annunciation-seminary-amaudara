import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExamBreakdownModal = ({ exam, isOpen, onClose }) => {
  if (!isOpen || !exam) return null;

  const getAnswerStatusIcon = (isCorrect) => {
    return isCorrect ? 'CheckCircle' : 'XCircle';
  };

  const getAnswerStatusColor = (isCorrect) => {
    return isCorrect ? 'text-success' : 'text-error';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1030 p-4">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">{exam?.title}</h2>
            <p className="font-body text-sm text-muted-foreground">
              {exam?.subject} • {new Date(exam.date)?.toLocaleDateString('en-GB')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-foreground">{exam?.score}</p>
              <p className="font-caption text-xs text-muted-foreground">Score</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-primary">{exam?.percentage}%</p>
              <p className="font-caption text-xs text-muted-foreground">Percentage</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-success">{exam?.correctAnswers}</p>
              <p className="font-caption text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-error">{exam?.incorrectAnswers}</p>
              <p className="font-caption text-xs text-muted-foreground">Incorrect</p>
            </div>
          </div>
        </div>

        {/* Questions Breakdown */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Question Analysis</h3>
          
          <div className="space-y-4">
            {exam?.questions?.map((question, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    question?.isCorrect ? 'bg-success' : 'bg-error'
                  }`}>
                    <Icon 
                      name={getAnswerStatusIcon(question?.isCorrect)} 
                      size={14} 
                      color="white"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-body text-sm font-medium text-foreground">
                        Question {index + 1}
                      </h4>
                      <span className={`font-caption text-xs ${getAnswerStatusColor(question?.isCorrect)}`}>
                        {question?.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    
                    <p className="font-body text-sm text-foreground mb-3">{question?.text}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-caption text-xs text-muted-foreground">Your Answer:</span>
                        <span className={`font-body text-sm ${question?.isCorrect ? 'text-success' : 'text-error'}`}>
                          {question?.userAnswer}
                        </span>
                      </div>
                      
                      {!question?.isCorrect && (
                        <div className="flex items-center space-x-2">
                          <span className="font-caption text-xs text-muted-foreground">Correct Answer:</span>
                          <span className="font-body text-sm text-success">{question?.correctAnswer}</span>
                        </div>
                      )}
                      
                      {question?.explanation && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="font-caption text-xs text-muted-foreground mb-1">Explanation:</p>
                          <p className="font-body text-sm text-foreground">{question?.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => console.log('Download report')}>
              <Icon name="Download" size={14} className="mr-2" />
              Download Report
            </Button>
            <Button variant="outline" onClick={() => console.log('Share with parent')}>
              <Icon name="Share" size={14} className="mr-2" />
              Share
            </Button>
          </div>
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamBreakdownModal;