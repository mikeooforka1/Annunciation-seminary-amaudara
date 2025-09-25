import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { CgChevronLeftR, CgChevronRightR } from "react-icons/cg";

const AnnouncementsCarousel = ({ className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [comments, setComments] = useState({}); // Store comments keyed by announcement ID

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch announcements from backend
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/announcements`, {
          credentials: 'include', // <-- Send cookies/session with request
        });
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err) {
        setAnnouncements([]);
      }
    }
    fetchAnnouncements();
  }, [API_BASE_URL]);

  // Fetch comments for current announcement from backend
  useEffect(() => {
    async function fetchComments(announcementId) {
      if (!announcementId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/announcements/${announcementId}/comments`, {
          credentials: 'include', // <-- Send cookies/session with request
        });
        const data = await res.json();
        setComments(prev => ({ ...prev, [announcementId]: Array.isArray(data) ? data : [] }));
      } catch (err) {
        setComments(prev => ({ ...prev, [announcementId]: [] }));
      }
    }
    if (announcements.length > 0) {
      const currentAnnouncementId = announcements[currentIndex]?._id;
      if (currentAnnouncementId && !comments[currentAnnouncementId]) {
        fetchComments(currentAnnouncementId);
      }
    }
  }, [announcements, currentIndex, comments, API_BASE_URL]);

  useEffect(() => {
    if (!isAutoPlaying || announcements.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, announcements.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? announcements.length - 1 : currentIndex - 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === announcements.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      'important': 'AlertCircle',
      'info': 'Info',
      'event': 'Calendar',
      'meeting': 'Users'
    };
    return iconMap?.[type] || 'Bell';
  };

  const getTypeColor = (type) => {
    const colorMap = {
      'important': 'text-error bg-error/10',
      'info': 'text-primary bg-primary/10',
      'event': 'text-secondary bg-secondary/10',
      'meeting': 'text-accent bg-accent/10'
    };
    return colorMap?.[type] || 'text-muted-foreground bg-muted';
  };

  const getPriorityIndicator = (priority) => {
    if (priority === 'high') {
      return <div className="w-2 h-2 bg-error rounded-full animate-pulse" />;
    }
    return null;
  };

  const currentAnnouncement = announcements[currentIndex];
  const currentComments = currentAnnouncement?._id ? comments[currentAnnouncement._id] || [] : [];

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <Icon name="Megaphone" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground">Announcements</h2>
            <p className="text-sm font-body text-muted-foreground">Latest school updates</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="icon-btn" aria-label="Previous Announcement" onClick={goToPrevious}>
            <CgChevronLeftR size={22} color="black" />
          </Button>
          <Button variant="ghost" size="icon" className="icon-btn" aria-label="Next Announcement" onClick={goToNext}>
            <CgChevronRightR size={22} color="black" />
          </Button>
        </div>
      </div>
      {/* Current Announcement */}
      <div className="relative min-h-[200px]">
        {currentAnnouncement ? (
          <div className="border border-border rounded-lg p-4 bg-muted/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${getTypeColor(currentAnnouncement?.type)}`}>
                  <Icon name={getTypeIcon(currentAnnouncement?.type)} size={16} />
                </div>
                <div>
                  <h3 className="font-body font-semibold text-foreground flex items-center space-x-2">
                    <span>{currentAnnouncement?.title}</span>
                    {getPriorityIndicator(currentAnnouncement?.priority)}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs font-caption text-muted-foreground mt-1">
                    <span>{currentAnnouncement?.date}</span>
                    <span>•</span>
                    <span>{currentAnnouncement?.author}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm font-body text-foreground leading-relaxed mb-4">
              {currentAnnouncement?.content}
            </p>
            {/* Comments Section */}
            <div className="mt-4">
              <h4 className="font-heading text-sm font-bold text-primary mb-2">Comments</h4>
              {Array.isArray(currentComments) && currentComments.some(c => c && c.text) ? (
                <ul className="space-y-2">
                  {currentComments.map(comment => (
                    comment && comment.text ? (
                      <li key={comment._id} className="bg-background border border-border rounded px-3 py-2 text-xs">
                        <span className="font-semibold text-foreground">{comment.author}:</span> {comment.text}
                      </li>
                    ) : null
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground"></div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-caption capitalize ${getTypeColor(currentAnnouncement?.type)}`}>
                  {currentAnnouncement?.type}
                </span>
                {currentAnnouncement?.priority === 'high' && (
                  <span className="px-2 py-1 bg-error/10 text-error rounded text-xs font-caption">
                    High Priority
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="ExternalLink" size={14} className="mr-1" />
                Read More
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            No announcements available.
          </div>
        )}
      </div>
      {/* Carousel Indicators */}
      <div className="flex items-center justify-center space-x-2 mt-4">
        {announcements?.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-primary w-6' :'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
      {/* Auto-play indicator */}
      <div className="flex items-center justify-center mt-2">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="flex items-center space-x-1 text-xs font-caption text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name={isAutoPlaying ? "Pause" : "Play"} size={12} />
          <span>{isAutoPlaying ? 'Auto-playing' : 'Paused'}</span>
        </button>
      </div>
    </div>
  );
};

export default AnnouncementsCarousel;