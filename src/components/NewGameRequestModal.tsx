import React, { useEffect, useState } from 'react';

interface NewGameRequestModalProps {
  isOpen: boolean;
  mode: 'request_sent' | 'request_received' | 'declined' | null;
  requesterName?: string;
  declinedPlayerName?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onClose?: () => void;
}

const NewGameRequestModal: React.FC<NewGameRequestModalProps> = ({
  isOpen,
  mode,
  requesterName,
  declinedPlayerName,
  onAccept,
  onDecline,
  onClose
}) => {
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (mode === 'declined' && isOpen) {
      // Auto-close declined notification after 3 seconds
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
      setAutoCloseTimer(timer);
      return () => {
        if (timer) clearTimeout(timer);
      };
    } else {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        setAutoCloseTimer(null);
      }
    }
  }, [mode, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal show" onClick={mode === 'declined' ? onClose : undefined}>
      <div className="modal-content new-game-request-modal" onClick={(e) => e.stopPropagation()}>
        {mode === 'request_sent' && (
          <>
            <h2>Request Sent</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Waiting for all players to accept the new game request...
            </p>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </>
        )}

        {mode === 'request_received' && (
          <>
            <h2>New Game Request</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              <strong>{requesterName}</strong> wants to start a new game. Do you accept?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={onAccept}>
                Accept
              </button>
              <button className="btn btn-secondary" onClick={onDecline}>
                Decline
              </button>
            </div>
          </>
        )}

        {mode === 'declined' && (
          <>
            <h2 style={{ color: '#d32f2f' }}>Request Declined</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              <strong>{declinedPlayerName}</strong> declined the new game request. The current game will continue.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              OK
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NewGameRequestModal;

