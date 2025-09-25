import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const subjectUrls = {
  'Mathematics': 'https://www.khanacademy.org/math',
  'Physics': 'https://www.physicsclassroom.com/',
  'Chemistry': 'https://www.chemguide.co.uk/',
  'Biology': 'https://www.biologyonline.com/',
  'English': 'https://www.englishclub.com/',
  'History': 'https://www.history.com/'
};

// Helper to get a random subject for weekly rotation
const getWeeklySubjects = () => {
  const allSubjects = Object.keys(subjectUrls);
  const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  // Rotate subjects every week
  const start = weekNumber % allSubjects.length;
  return [
    allSubjects[start],
    allSubjects[(start + 1) % allSubjects.length],
    allSubjects[(start + 2) % allSubjects.length]
  ];
};

const ResourceLibrarySection = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('recent');
  const [weeklySubjects, setWeeklySubjects] = useState(getWeeklySubjects());

  useEffect(() => {
    // Update weekly subjects on mount and every week
    const interval = setInterval(() => {
      setWeeklySubjects(getWeeklySubjects());
    }, 1000 * 60 * 60 * 24 * 7); // every week
    return () => clearInterval(interval);
  }, []);

  // Add URLs to resources
  const resources = {
    recent: [
      {
        id: 1,
        title: 'Advanced Calculus Notes',
        type: 'pdf',
        subject: weeklySubjects[0],
        size: '2.4 MB',
        uploadDate: '2025-01-10',
        thumbnail: 'https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg?auto=compress&cs=tinysrgb&w=400',
        downloads: 45,
        url: subjectUrls[weeklySubjects[0]]
      },
      {
        id: 2,
        title: 'Organic Chemistry Lab Manual',
        type: 'pdf',
        subject: weeklySubjects[1],
        size: '5.1 MB',
        uploadDate: '2025-01-08',
        thumbnail: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400',
        downloads: 32,
        url: subjectUrls[weeklySubjects[1]]
      },
      {
        id: 3,
        title: 'Physics Simulation Videos',
        type: 'video',
        subject: weeklySubjects[2],
        duration: '45 min',
        uploadDate: '2025-01-06',
        thumbnail: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=400',
        views: 128,
        url: subjectUrls[weeklySubjects[2]]
      }
    ],
    popular: [
      {
        id: 4,
        title: 'English Literature Guide',
        type: 'pdf',
        subject: weeklySubjects[1],
        size: '3.2 MB',
        uploadDate: '2024-12-15',
        thumbnail: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
        downloads: 156,
        url: subjectUrls[weeklySubjects[1]]
      },
      {
        id: 5,
        title: 'Biology Diagrams Collection',
        type: 'presentation',
        subject: weeklySubjects[2],
        slides: 42,
        uploadDate: '2024-12-20',
        thumbnail: 'https://images.pexels.com/photos/8566532/pexels-photo-8566532.jpeg?auto=compress&cs=tinysrgb&w=400',
        downloads: 89,
        url: subjectUrls[weeklySubjects[2]]
      }
    ]
  };

  const getResourceIcon = (type) => {
    const iconMap = {
      'pdf': 'FileText',
      'video': 'Play',
      'presentation': 'Presentation',
      'document': 'File',
      'image': 'Image'
    };
    return iconMap?.[type] || 'File';
  };

  const getResourceColor = (type) => {
    const colorMap = {
      'pdf': 'text-error bg-error/10',
      'video': 'text-primary bg-primary/10',
      'presentation': 'text-secondary bg-secondary/10',
      'document': 'text-accent bg-accent/10',
      'image': 'text-success bg-success/10'
    };
    return colorMap?.[type] || 'text-muted-foreground bg-muted';
  };

  const getSubjectColor = (subject) => {
    const colorMap = {
      'Mathematics': 'bg-blue-100 text-blue-800',
      'Physics': 'bg-purple-100 text-purple-800',
      'Chemistry': 'bg-green-100 text-green-800',
      'Biology': 'bg-emerald-100 text-emerald-800',
      'English': 'bg-orange-100 text-orange-800',
      'History': 'bg-amber-100 text-amber-800'
    };
    return colorMap?.[subject] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (size) => {
    return size || 'N/A';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const handleResourceClick = (resource) => {
    if (resource?.url) {
      window.open(resource.url, '_blank');
    } else {
      console.log('No URL for resource:', resource?.title);
    }
  };

  const tabs = [
    { id: 'recent', label: 'Recent', icon: 'Clock' },
    { id: 'popular', label: 'Popular', icon: 'TrendingUp' }
  ];

  return (
    <div id="resources" className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <Icon name="BookOpen" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground">Resource Library</h2>
            <p className="text-sm font-body text-muted-foreground">Study materials and references</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://www.khanacademy.org/', '_blank')}
        >
          <Icon name="Search" size={14} className="mr-2" />
          Browse All
        </Button>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-body transition-colors ${
              activeTab === tab?.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab?.icon} size={14} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources?.[activeTab]?.map((resource) => (
          <div
            key={resource?.id}
            className="border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/20 group"
            onClick={() => handleResourceClick(resource)}
          >
            {/* Thumbnail */}
            <div className="relative mb-3 overflow-hidden rounded-lg">
              <div className="aspect-video bg-muted">
                <Image
                  src={resource?.thumbnail}
                  alt={resource?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className={`absolute top-2 left-2 p-1 rounded ${getResourceColor(resource?.type)}`}>
                <Icon name={getResourceIcon(resource?.type)} size={14} />
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-body font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {resource?.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-caption ${getSubjectColor(resource?.subject)}`}>
                  {resource?.subject}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-caption text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <span>{formatDate(resource?.uploadDate)}</span>
                  {resource?.size && <span>{formatFileSize(resource?.size)}</span>}
                  {resource?.duration && <span>{resource?.duration}</span>}
                  {resource?.slides && <span>{resource?.slides} slides</span>}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Icon name={resource?.downloads ? "Download" : "Eye"} size={12} />
                  <span>{resource?.downloads || resource?.views}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Quick Access Categories */}
      <div className="mt-6 pt-4 border-t border-border">
        <h3 className="font-body font-medium text-foreground mb-3">Quick Access</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(subjectUrls).map((subject) => (
            <Button
              key={subject}
              variant="ghost"
              size="sm"
              onClick={() => window.open(subjectUrls[subject], '_blank')}
            >
              <Icon name="Folder" size={14} className="mr-2" />
              {subject}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceLibrarySection;