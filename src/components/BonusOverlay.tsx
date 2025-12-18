import React, { useEffect } from 'react';

interface BonusOverlayProps {
  show: boolean;
  text: string;
  points: number;
  playerColor: string;
  onComplete: () => void;
  reverseWord?: string; // For emordnilap: show both words
}

const BonusOverlay: React.FC<BonusOverlayProps> = ({ show, text, points, playerColor, onComplete, reverseWord }) => {
  useEffect(() => {
    if (show) {
      // Auto-hide after 2.5 seconds (or 3 seconds for emordnilap)
      const duration = reverseWord ? 3000 : 2500;
      const timer = setTimeout(() => {
        onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete, reverseWord]);

  if (!show) return null;

  return (
    <div className="bonus-overlay">
      <div 
        className="bonus-content"
        style={{
          borderColor: playerColor,
          boxShadow: `0 0 20px ${playerColor}40`
        }}
      >
        <div className="bonus-text" style={{ color: playerColor }}>
          {text}
        </div>
        {reverseWord && (
          <div className="bonus-words" style={{ color: playerColor }}>
            {text.includes('Emordnilap') ? `${text.split(' ')[0]} → ${reverseWord.toUpperCase()}` : ''}
          </div>
        )}
        <div className="bonus-points" style={{ color: playerColor }}>
          +{points} points
        </div>
      </div>
    </div>
  );
};

export default BonusOverlay;

