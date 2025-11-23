import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const announcementTypes = [
  { value: 'important', label: 'Important' },
  { value: 'info', label: 'Info' },
  { value: 'event', label: 'Event' },
  { value: 'meeting', label: 'Meeting' }
];

const priorities = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' }
];

const PostAnnouncement = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('info');
  const [priority, setPriority] = useState('normal');
  const [content, setContent] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const author = localStorage.getItem('userName') || 'Teacher';
      const date = new Date().toLocaleDateString();

      const announcement = {
        title,
        type,
        priority,
        content,
        author,
        date
      };

      const res = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      });

      const result = await res.json();

      if (res.ok) {
        setSuccessMsg('Announcement posted successfully!');
        setTimeout(() => {
          navigate('/teacher-portal');
        }, 1200);
      } else {
        setErrorMsg(result.error || 'Failed to post announcement.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-xl shadow-lg p-8 w-full max-w-lg">
        <div className="flex items-center mb-6 space-x-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <Icon name="Megaphone" size={20} color="white" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-primary">Post Announcement</h2>
        </div>
        {successMsg && (
          <div className="bg-success/10 border border-success text-success rounded-md px-4 py-2 mb-4 text-sm">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-error/10 border border-error text-error rounded-md px-4 py-2 mb-4 text-sm">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              placeholder="Announcement title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
                value={type}
                onChange={e => setType(e.target.value)}
                required
              >
                {announcementTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
                value={priority}
                onChange={e => setPriority(e.target.value)}
                required
              >
                {priorities.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              placeholder="Write your announcement here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Announcement'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PostAnnouncement;