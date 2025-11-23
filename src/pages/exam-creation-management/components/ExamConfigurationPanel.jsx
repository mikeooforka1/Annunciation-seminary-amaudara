import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import ExamPreview from './ExamPreview'; // Import the ExamPreview component
import QuestionBuilder from './QuestionBuilder';

const termOptions = [
  { value: 'first', label: 'First Term' },
  { value: 'second', label: 'Second Term' },
  { value: 'third', label: 'Third Term' }
];

const initialExamData = {
  title: '',
  subject: '',
  class: '',
  term: '',
  duration: '',
  difficulty: '',
  instructions: '',
  totalMarks: '',
  passMarks: '',
  maxAttempts: 1,
  questionOrder: 'sequential',
  showResultsImmediately: false,
  allowReview: true,
  startDate: '',
  endDate: '',
  preventTabSwitching: true,
  disableCopyPaste: true,
  fullscreenMode: false,
  maxTabSwitchWarnings: 3,
  questions: []
};

const ExamConfigurationPanel = ({
  examData,
  onExamDataChange,
  onSaveExam,
  onPublishExam,
  isLoading = false,
  questions,
  setQuestions,
  onAddQuestion // <-- Add this prop
}) => {
  const [activeSection, setActiveSection] = useState('basic');
  const [customSubjects, setCustomSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [teacherClass, setTeacherClass] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // <-- Use env variable

  // Fetch teacher data from localStorage (same as DashboardWidgets)
  useEffect(() => {
    const teacherData = JSON.parse(localStorage.getItem('teacherData') || '{}');
    setTeacherClass(teacherData.className || '');
    // Set default exam class to teacher's class
    if (teacherData.className && examData?.class !== teacherData.className) {
      onExamDataChange({ ...examData, class: teacherData.className });
    }
    // eslint-disable-next-line
  }, []);

  const subjectOptions = [
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'english', label: 'English Language' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'geography', label: 'Geography' },
    { value: 'history', label: 'History' },
    { value: 'economics', label: 'Economics' },
    ...customSubjects.map(sub => ({ value: sub.toLowerCase().replace(/\s+/g, '-'), label: sub }))
  ];

  // Add all classes from Primary 1 to SS3
  const classOptions = [
    { value: 'primary1', label: 'Primary 1' },
    { value: 'primary2', label: 'Primary 2' },
    { value: 'primary3', label: 'Primary 3' },
    { value: 'primary4', label: 'Primary 4' },
    { value: 'primary5', label: 'Primary 5' },
    { value: 'primary6', label: 'Primary 6' },
    { value: 'js1', label: 'JS1 (Grade 7)' },
    { value: 'js2', label: 'JS2 (Grade 8)' },
    { value: 'js3', label: 'JS3 (Grade 9)' },
    { value: 'ss1', label: 'SS1 (Grade 10)' },
    { value: 'ss2', label: 'SS2 (Grade 11)' },
    { value: 'ss3', label: 'SS3 (Grade 12)' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const normalizeClass = (val) =>
    val?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

  // Find the correct value for the teacher's class from classOptions
  const getTeacherClassValue = () => {
    const found = classOptions.find(
      opt => opt.label.trim().toLowerCase() === teacherClass.trim().toLowerCase()
    );
    return found ? found.value : '';
  };

  const teacherClassValue = getTeacherClassValue();

  const handleInputChange = (field, value) => {
    if (field === 'class') {
      if (value !== teacherClassValue) {
        alert('Select the class you are assigned to.');
        onExamDataChange({
          ...examData,
          class: teacherClassValue
        });
        return;
      }
    }
    onExamDataChange({
      ...examData,
      [field]: value
    });
  };

  const handleAddSubject = () => {
    const subject = newSubject.trim();
    if (subject && !customSubjects.includes(subject)) {
      setCustomSubjects([...customSubjects, subject]);
      setNewSubject('');
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: 'FileText' },
    { id: 'questions', label: `Questions (${questions?.length})`, icon: 'HelpCircle' }, // <-- Added here
    { id: 'schedule', label: 'Schedule', icon: 'Calendar' },
    { id: 'security', label: 'Security', icon: 'Shield' }
  ];

  // Validation function for required fields
  const validateExam = () => {
    if (!examData?.title) return 'Exam title is required.';
    if (!examData?.subject) return 'Subject is required.';
    if (!examData?.class) return 'Class is required.';
    if (!examData?.term) return 'Term is required.';
    if (!examData?.duration) return 'Duration is required.';
    if (!examData?.startDate) return 'Start date is required.';
    if (!examData?.endDate) return 'End date must be after start date.';
    if (new Date(examData?.endDate) <= new Date(examData?.startDate)) return 'End date must be after start date.';
    return '';
  };

  // Handle publish button click
  const handlePublishClick = () => {
    const error = validateExam();
    if (error) {
      setPublishError(error);
      setTimeout(() => setPublishError(''), 4000);
      return;
    }
    setShowPublishModal(true);
  };

  // Confirm publish and show preview
  const handleConfirmPublish = () => {
    setShowPublishModal(false);
    setShowPreview(true);
  };

  // Actually publish after preview
  const handleFinalPublish = async (questions, startDate, endDate) => {
    setShowPreview(false);
    setPublishError('');
    const updatedExamData = {
      ...examData,
      questions,
      startDate: startDate || examData.startDate,
      endDate: endDate || examData.endDate,
      status: 'published',
    };
    try {
      const res = await fetch(`${API_BASE_URL}/api/exams/publish`, { // <-- Use env variable here
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExamData),
      });
      const result = await res.json();
      if (res.ok) {
        alert('Exam published successfully! Students will see it at the scheduled time.');
        if (onPublishExam) onPublishExam();
      } else {
        setPublishError(result.error || 'Failed to publish exam.');
      }
    } catch (err) {
      setPublishError('Network error. Please try again.');
    }
  };

  // Handler for editing schedule from preview
  const handleEditSchedule = ({ startDate, endDate }) => {
    onExamDataChange({
      ...examData,
      startDate,
      endDate,
    });
    setShowPreview(false);
    setActiveSection('schedule');
  };

  // Save draft handler
  const handleSaveDraft = async () => {
    setPublishError('');
    const draftExamData = {
      ...examData,
      status: 'draft',
    };
    try {
      const res = await fetch(`${API_BASE_URL}/api/exams/save-draft`, { // <-- Use env variable here
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftExamData),
      });
      const result = await res.json();
      if (res.ok) {
        alert('Draft saved! You can continue later.');
        if (onSaveExam) onSaveExam();
      } else {
        setPublishError(result.error || 'Failed to save draft.');
      }
    } catch (err) {
      setPublishError('Network error. Please try again.');
    }
  };

  // Publish handler (called only from modal)
  const handlePublishExam = () => {
    // Validation before publish
    const error = validateExam();
    if (error) {
      setPublishError(error);
      setTimeout(() => setPublishError(''), 4000);
      return;
    }
    // Only call parent's publish handler
    if (onPublishExam) {
      onPublishExam();
    }
    setShowPublishModal(false);
  };

  // Fetch submissions for the selected exam
  const fetchSubmissions = async (examId) => {
    setLoadingSubmissions(true);
    const res = await fetch(`${API_BASE_URL}/api/exams/submissions?examId=${examId}`); // <-- Use env variable here
    const data = await res.json();
    setSubmissions(Array.isArray(data) ? data : []);
    setLoadingSubmissions(false);
  };

  function formatDateTimePreview(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  const handleDeleteQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  return (
    <div className="exam-config-panel">
      <div className="bg-card border border-border rounded-lg h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="font-heading font-semibold text-lg text-foreground">
              Exam Configuration
            </h2>
            <div className="flex space-x-2 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={handleSaveDraft}
                loading={isLoading}
                iconName="Save"
                iconPosition="left"
                style={{ backgroundColor: '#16a34a', color: '#fff', borderColor: '#15803d' }} // green
                className="draft-btn"
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={handlePublishClick}
                loading={isLoading}
                iconName="Send"
                iconPosition="left"
                style={{ backgroundColor: '#dc2626', color: '#fff', borderColor: '#b91c1c' }} // red
                className="publish-btn"
              >
                Publish
              </Button>
            </div>
          </div>
          {publishError && (
            <div className="mt-2 text-sm text-destructive flex items-center">
              <Icon name="AlertTriangle" size={16} className="mr-2" />
              {publishError}
            </div>
          )}
        </div>
        {/* Section Tabs */}
        <div className="flex flex-nowrap overflow-x-auto border-b border-border mb-2 gap-1">
          {sections?.map((section) => (
            <button
              key={section?.id}
              onClick={() => setActiveSection(section?.id)}
              className={`flex items-center px-4 py-3 text-sm font-body border-b-2 transition-colors whitespace-nowrap
                ${activeSection === section?.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-transparent bg-muted text-white hover:text-white hover:bg-primary/80'
                }`}
              style={{ minWidth: 120, flex: '1 1 0' }}
            >
              <Icon name={section?.icon} size={16} className="mr-2" />
              <span className="block text-white">{section?.label}</span>
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 p-2 sm:p-4 overflow-y-auto">
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <Input
                label="Exam Title"
                type="text"
                placeholder="Enter exam title"
                value={examData?.title || ''}
                onChange={(e) => onExamDataChange({ ...examData, title: e?.target?.value })}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <Select
                    label="Subject"
                    options={subjectOptions}
                    value={examData?.subject || ''}
                    onChange={(value) => onExamDataChange({ ...examData, subject: value })}
                    placeholder="Select subject"
                    required
                    className="text-white" // <-- Make dropdown text white
                  />
                  <div className="flex flex-col sm:flex-row mt-2 gap-2">
                    <Input
                      type="text"
                      placeholder="Add more subject"
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      className="w-full sm:w-2/3"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSubject}
                      disabled={!newSubject.trim()}
                      className="w-full sm:w-auto"
                    >
                      <Icon name="Plus" size={14} className="mr-1" />
                      Add Subject
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-foreground mb-2">
                    Class
                  </label>
                  <div className="px-3 py-2 border border-border rounded-md bg-muted text-foreground font-semibold">
                    {teacherClass || 'No class assigned'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Select Term"
                  options={termOptions}
                  value={examData?.term || ''}
                  onChange={(value) => onExamDataChange({ ...examData, term: value })}
                  placeholder="Choose term"
                  required
                  className="text-white" // <-- Make dropdown text white
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Duration (minutes)"
                  type="number"
                  placeholder="90"
                  value={examData?.duration || ''}
                  onChange={(e) => handleInputChange('duration', Number(e?.target?.value))}
                  min="1"
                  max="300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">
                  Instructions
                </label>
                <textarea
                  className="w-full h-32 px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  placeholder="Enter exam instructions for students..."
                  value={examData?.instructions || ''}
                  onChange={(e) => handleInputChange('instructions', e?.target?.value)}
                />
              </div>
            </div>
          )}

          {activeSection === 'questions' && (
            <QuestionBuilder
              questions={questions}
              onQuestionsChange={setQuestions}
              onAddQuestion={onAddQuestion} // <-- Pass it down
              onDeleteQuestion={handleDeleteQuestion} // <-- Pass the delete handler
              // ...other props as needed
            />
          )}

          {activeSection === 'schedule' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="datetime-local"
                  value={examData?.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e?.target?.value)}
                  required
                />

                <Input
                  label="End Date"
                  type="datetime-local"
                  value={examData?.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e?.target?.value)}
                  required
                />
              </div>
              {/* Live preview of selected times */}
              <div className="flex flex-col md:flex-row gap-4 mt-2">
                <div className="bg-muted rounded-lg px-4 py-2 flex-1">
                  <span className="font-semibold text-primary">Start:</span>
                  <span className="ml-2 text-foreground">
                    {formatDateTimePreview(examData?.startDate) || 'Not set'}
                  </span>
                </div>
                <div className="bg-muted rounded-lg px-4 py-2 flex-1">
                  <span className="font-semibold text-primary">End:</span>
                  <span className="ml-2 text-foreground">
                    {formatDateTimePreview(examData?.endDate) || 'Not set'}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Info" size={16} className="text-primary" />
                  <p className="font-body font-medium text-foreground">Schedule Information</p>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Students will be able to access the exam during the specified time window</li>
                  <li>• Exam will automatically become unavailable after the end date</li>
                  <li>• Students will receive notifications 24 hours before the exam starts</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between p-3 border border-border rounded-lg gap-2">
                  <div>
                    <p className="font-body font-medium text-foreground">Prevent Tab Switching</p>
                    <p className="text-sm text-muted-foreground">Warn students when they switch tabs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={examData?.preventTabSwitching || false}
                      onChange={(e) => handleInputChange('preventTabSwitching', e?.target?.checked)}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-3 border border-border rounded-lg gap-2">
                  <div>
                    <p className="font-body font-medium text-foreground">Disable Copy/Paste</p>
                    <p className="text-sm text-muted-foreground">Prevent copying exam content</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={examData?.disableCopyPaste || false}
                      onChange={(e) => handleInputChange('disableCopyPaste', e?.target?.checked)}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-3 border border-border rounded-lg gap-2">
                  <div>
                    <p className="font-body font-medium text-foreground">Fullscreen Mode</p>
                    <p className="text-sm text-muted-foreground">Force fullscreen during exam</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={examData?.fullscreenMode || false}
                      onChange={(e) => handleInputChange('fullscreenMode', e?.target?.checked)}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <Input
                label="Maximum Tab Switch Warnings"
                type="number"
                placeholder="3"
                value={examData?.maxTabSwitchWarnings || ''}
                onChange={(e) => handleInputChange('maxTabSwitchWarnings', e?.target?.value)}
                min="1"
                max="10"
                description="Number of warnings before auto-submission"
              />
            </div>
          )}
        </div>

        {/* Publish Confirmation Modal */}
        {showPublishModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center mb-6">
                <Icon name="Send" size={32} className="text-primary mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Are you sure you want to publish now?
                </h3>
                <p className="text-gray-600">
                  Please confirm your data before publishing.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="draft-btn"
                  variant="outline"
                  size="md"
                  onClick={() => setShowPublishModal(false)}
                  iconName="ArrowLeft"
                  iconPosition="left"
                  style={{ backgroundColor: '#c0df12ff', color: '#fff', borderColor: '#15803d' }} // green
                >
                  Save Draft
                </Button>
                <Button
                  className="publish-btn"
                  variant="default"
                  size="md"
                  onClick={handlePublishExam}
                  iconName="Send"
                  iconPosition="left"
                  style={{ backgroundColor: '#dc2626', color: '#fff', borderColor: '#b91c1c' }} // red
                >
                  Publish
                </Button>
              </div>
              {publishError && (
                <div className="mt-2 text-sm text-destructive flex items-center justify-center">
                  <Icon name="AlertTriangle" size={16} className="mr-2" />
                  {publishError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exam Preview Modal */}
        {showPreview && (
          <ExamPreview
            examData={examData}
            questions={examData.questions || []}
            onClose={() => setShowPreview(false)}
            onEditSchedule={handleEditSchedule}
          />
        )}
      </div>
    </div>
  );
};

export default ExamConfigurationPanel;