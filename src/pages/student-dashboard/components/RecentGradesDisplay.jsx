import React from 'react';
import Icon from '../../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RecentGradesDisplay = ({ className = '' }) => {
  const recentGrades = [
    {
      id: 1,
      subject: 'Mathematics',
      examType: 'Quiz',
      score: 85,
      maxScore: 100,
      date: '2025-01-08',
      grade: 'A',
      trend: 'up'
    },
    {
      id: 2,
      subject: 'Physics',
      examType: 'Assignment',
      score: 78,
      maxScore: 100,
      date: '2025-01-06',
      grade: 'B+',
      trend: 'down'
    },
    {
      id: 3,
      subject: 'Chemistry',
      examType: 'Lab Report',
      score: 92,
      maxScore: 100,
      date: '2025-01-05',
      grade: 'A',
      trend: 'up'
    },
    {
      id: 4,
      subject: 'English',
      examType: 'Essay',
      score: 88,
      maxScore: 100,
      date: '2025-01-03',
      grade: 'A-',
      trend: 'stable'
    }
  ];

  const performanceData = [
    { name: 'Week 1', score: 75 },
    { name: 'Week 2', score: 82 },
    { name: 'Week 3', score: 78 },
    { name: 'Week 4', score: 85 },
    { name: 'Week 5', score: 88 },
    { name: 'Week 6', score: 92 }
  ];

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return 'text-success bg-success/10';
    if (grade?.startsWith('B')) return 'text-warning bg-warning/10';
    if (grade?.startsWith('C')) return 'text-secondary bg-secondary/10';
    return 'text-error bg-error/10';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return { icon: 'TrendingUp', color: 'text-success' };
      case 'down': return { icon: 'TrendingDown', color: 'text-error' };
      default: return { icon: 'Minus', color: 'text-muted-foreground' };
    }
  };

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

  const averageScore = Math.round(recentGrades?.reduce((sum, grade) => sum + grade?.score, 0) / recentGrades?.length);

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
            <Icon name="BarChart3" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground">Recent Grades</h2>
            <p className="text-sm font-body text-muted-foreground">Your latest assessment results</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-caption text-muted-foreground">Average Score</p>
          <p className="text-2xl font-mono font-bold text-success">{averageScore}%</p>
        </div>
      </div>
      {/* Performance Trend Chart */}
      <div className="mb-6">
        <h3 className="text-sm font-body font-medium text-foreground mb-3">Performance Trend</h3>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Recent Grades List */}
      <div className="space-y-3">
        {recentGrades?.map((grade) => {
          const trendInfo = getTrendIcon(grade?.trend);
          return (
            <div key={grade?.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <Icon name={getSubjectIcon(grade?.subject)} size={16} color="white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-body font-medium text-foreground">{grade?.subject}</h4>
                    <span className="text-xs font-caption text-muted-foreground">• {grade?.examType}</span>
                  </div>
                  <p className="text-xs font-caption text-muted-foreground">{grade?.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-medium text-foreground">
                      {grade?.score}/{grade?.maxScore}
                    </span>
                    <Icon name={trendInfo?.icon} size={14} className={trendInfo?.color} />
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-caption ${getGradeColor(grade?.grade)}`}>
                    {grade?.grade}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <button 
          className="w-full text-center text-sm font-body text-primary hover:text-primary/80 transition-colors"
          onClick={() => window.location.href = '/results-analytics-portal'}
        >
          View All Results →
        </button>
      </div>
    </div>
  );
};

export default RecentGradesDisplay;