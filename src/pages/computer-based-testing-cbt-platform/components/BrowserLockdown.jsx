import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';

const BrowserLockdown = ({ isActive, onViolation, children }) => {
  const [violations, setViolations] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [tabActive, setTabActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e?.preventDefault();
      recordViolation('Right-click attempted');
      return false;
    };

    // Disable common keyboard shortcuts and copy/paste
    const handleKeyDown = (e) => {
      const forbiddenKeys = [
        'F12', // Developer tools
        'F5',  // Refresh
        'F11', // Fullscreen toggle
        'PrintScreen', // Screenshot
      ];

      const forbiddenCombos = [
        { ctrl: true, key: 'u' }, // View source
        { ctrl: true, key: 'i' }, // Developer tools
        { ctrl: true, key: 'j' }, // Console
        { ctrl: true, key: 'k' }, // Console
        { ctrl: true, key: 'r' }, // Refresh
        { ctrl: true, key: 'w' }, // Close tab
        { ctrl: true, key: 't' }, // New tab
        { ctrl: true, key: 'n' }, // New window
        { ctrl: true, shift: true, key: 'i' }, // Developer tools
        { ctrl: true, shift: true, key: 'j' }, // Console
        { ctrl: true, shift: true, key: 'c' }, // Developer tools
        { alt: true, key: 'Tab' }, // Alt+Tab
        { ctrl: true, key: 'c' }, // Copy
        { ctrl: true, key: 'v' }, // Paste
        { ctrl: true, key: 'x' }, // Cut
      ];

      if (forbiddenKeys?.includes(e?.key)) {
        e?.preventDefault();
        recordViolation(`Forbidden key pressed: ${e?.key}`);
        return false;
      }

      const matchesForbiddenCombo = forbiddenCombos?.some(combo => {
        return ((!combo?.ctrl || e?.ctrlKey) &&
        (!combo?.alt || e?.altKey) &&
        (!combo?.shift || e?.shiftKey) && e?.key?.toLowerCase() === combo?.key?.toLowerCase());
      });

      if (matchesForbiddenCombo) {
        e?.preventDefault();
        recordViolation(`Forbidden key combination: ${e?.key}`);
        return false;
      }
    };

    // Block copy, cut, paste events
    const handleCopy = (e) => {
      e?.preventDefault();
      recordViolation('Copy attempted');
      return false;
    };
    const handleCut = (e) => {
      e?.preventDefault();
      recordViolation('Cut attempted');
      return false;
    };
    const handlePaste = (e) => {
      e?.preventDefault();
      recordViolation('Paste attempted');
      return false;
    };

    // Detect tab switching/window blur
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabActive(false);
        recordViolation('Tab switched or window minimized');
      } else {
        setTabActive(true);
      }
    };

    const handleWindowBlur = () => {
      recordViolation('Window lost focus');
    };

    // Disable text selection in exam area
    const handleSelectStart = (e) => {
      if (e?.target?.closest('.exam-content')) {
        e?.preventDefault();
        return false;
      }
    };

    // Try to block camera/mic access (will only work if you control those APIs)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = function() {
        recordViolation('Attempt to access camera/microphone');
        return Promise.reject(new Error('Camera/microphone access blocked during exam'));
      };
      // Restore on cleanup
      return () => {
        navigator.mediaDevices.getUserMedia = originalGetUserMedia;
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('cut', handleCut);
        document.removeEventListener('paste', handlePaste);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('selectstart', handleSelectStart);
      };
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('selectstart', handleSelectStart);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [isActive]);

  const recordViolation = (type) => {
    const violation = {
      id: Date.now(),
      type,
      timestamp: new Date()?.toISOString(),
    };

    setViolations(prev => [...prev, violation]);
    setShowWarning(true);

    // Auto-hide warning after 3 seconds
    setTimeout(() => setShowWarning(false), 3000);
    // Notify parent component
    onViolation?.(violation);
  };

  if (!isActive) return null;

  return (
    <>
      {/* Security Warning Banner */}
      {showWarning && (
        <div className="fixed top-16 left-0 right-0 bg-red-600 text-white px-4 py-3 z-50">
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Shield" size={20} />
            <span className="font-medium">
              Security Alert: Unauthorized action detected. Please focus on your exam.
            </span>
          </div>
        </div>
      )}

      {/* Tab switch blocking overlay */}
      {!tabActive && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-[100]">
          <Icon name="AlertTriangle" size={48} className="mb-4 text-yellow-400" />
          <div className="text-white text-xl font-bold mb-2">Exam Locked</div>
          <div className="text-white text-base mb-4">
            You switched tabs or minimized the window.<br />
            Please return to this tab to continue your exam.
          </div>
        </div>
      )}

      {/* Violation Counter */}
      {violations?.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} />
            <span className="text-sm font-medium">
              Violations: {violations?.length}
            </span>
          </div>
        </div>
      )}
      {/* Overlay to prevent certain interactions */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{ userSelect: 'none' }}
      />
    </>
  );
};

export default BrowserLockdown;