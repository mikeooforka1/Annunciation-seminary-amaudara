import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { CgChevronLeftR, CgChevronRightR } from "react-icons/cg";

const AcademicCalendarWidget = ({ className = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const upcomingEvents = [
    {
      id: 1,
      title: 'Mathematics Final Exam',
      date: '2025-01-15',
      time: '09:00',
      type: 'exam',
      location: 'CBT Lab'
    },
    {
      id: 2,
      title: 'Physics Assignment Due',
      date: '2025-01-16',
      time: '23:59',
      type: 'assignment',
      location: 'Online Submission'
    },
    {
      id: 3,
      title: 'Chemistry Lab Session',
      date: '2025-01-17',
      time: '14:00',
      type: 'class',
      location: 'Lab 2'
    },
    {
      id: 4,
      title: 'Science Fair',
      date: '2025-01-20',
      time: '10:00',
      type: 'event',
      location: 'Main Hall'
    },
    {
      id: 5,
      title: 'Parent-Teacher Meeting',
      date: '2025-01-25',
      time: '15:00',
      type: 'meeting',
      location: 'Conference Room'
    }
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)?.getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)?.getDay();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getEventTypeIcon = (type) => {
    const iconMap = {
      'exam': 'FileText',
      'assignment': 'ClipboardList',
      'class': 'BookOpen',
      'event': 'Calendar',
      'meeting': 'Users'
    };
    return iconMap?.[type] || 'Calendar';
  };

  const getEventTypeColor = (type) => {
    const colorMap = {
      'exam': 'text-error bg-error/10',
      'assignment': 'text-warning bg-warning/10',
      'class': 'text-primary bg-primary/10',
      'event': 'text-secondary bg-secondary/10',
      'meeting': 'text-accent bg-accent/10'
    };
    return colorMap?.[type] || 'text-muted-foreground bg-muted';
  };

  const hasEventOnDate = (day) => {
    const dateString = `${currentDate?.getFullYear()}-${String(currentDate?.getMonth() + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
    return upcomingEvents?.some(event => event?.date === dateString);
  };

  const isToday = (day) => {
    const today = new Date();
    return today?.getDate() === day && 
           today?.getMonth() === currentDate?.getMonth() && 
           today?.getFullYear() === currentDate?.getFullYear();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate?.setMonth(currentDate?.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days?.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvent = hasEventOnDate(day);
      const todayClass = isToday(day) ? 'bg-primary text-primary-foreground' : '';
      const eventClass = hasEvent ? 'ring-2 ring-secondary' : '';
      
      days?.push(
        <button
          key={day}
          className={`h-8 w-8 text-sm font-body rounded-full hover:bg-muted transition-colors ${todayClass} ${eventClass} ${
            hasEvent && !isToday(day) ? 'bg-secondary/10 text-secondary' : ''
          }`}
          onClick={() => setSelectedDate(day)}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const getUpcomingEventsForWeek = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return upcomingEvents?.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= nextWeek;
    })?.slice(0, 3);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Icon name="Calendar" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground">Academic Calendar</h2>
            <p className="text-sm font-body text-muted-foreground">Upcoming events and deadlines</p>
          </div>
        </div>
      </div>
      {/* Mini Calendar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-body font-medium text-foreground">
            {currentDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="icon-btn" aria-label="Previous Month" onClick={() => navigateMonth(-1)}>
              <CgChevronLeftR size={22} color="black" />
            </Button>
            <Button variant="ghost" size="icon" className="icon-btn" aria-label="Next Month" onClick={() => navigateMonth(1)}>
              <CgChevronRightR size={22} color="black" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-caption text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>
      {/* Upcoming Events */}
      <div>
        <h3 className="font-body font-medium text-foreground mb-3">This Week</h3>
        <div className="space-y-3">
          {getUpcomingEventsForWeek()?.map((event) => (
            <div key={event?.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`p-2 rounded-full ${getEventTypeColor(event?.type)}`}>
                <Icon name={getEventTypeIcon(event?.type)} size={14} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-body font-medium text-foreground text-sm">{event?.title}</h4>
                <div className="flex items-center space-x-2 text-xs font-caption text-muted-foreground">
                  <span>{formatDate(event?.date)}</span>
                  <span>•</span>
                  <span>{event?.time}</span>
                  <span>•</span>
                  <span>{event?.location}</span>
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <Icon name="ChevronRight" size={14} />
              </Button>
            </div>
          ))}
        </div>

        {getUpcomingEventsForWeek()?.length === 0 && (
          <div className="text-center py-4">
            <Icon name="Calendar" size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-body text-muted-foreground">No events this week</p>
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="outline" className="w-full" onClick={() => window.location.href = '#calendar'}>
          <Icon name="Calendar" size={14} className="mr-2" />
          View Full Calendar
        </Button>
      </div>
    </div>
  );
};

export default AcademicCalendarWidget;