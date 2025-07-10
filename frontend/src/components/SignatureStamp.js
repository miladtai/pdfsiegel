import React from 'react';

const SignatureStamp = ({ 
  user, 
  position, 
  isDragging, 
  onMouseDown, 
  onRemove,
  formatStampDate 
}) => {
  return (
    <div
      className={`signature-stamp ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: 10
      }}
      onMouseDown={onMouseDown}
    >
      <div className="stamp-content">
        {/* Verifizier-Symbol (15%) */}
        <svg className="stamp-verify-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        
        {/* Stempel-Informationen (75%) */}
        <div className="stamp-info">
          <div className="stamp-name">
            {user?.firstname || 'Max'} {user?.lastname || 'Mustermann'}
          </div>
          <div className="stamp-datetime">
            {formatStampDate()}
          </div>
          <div className="stamp-method">
            Signiert mit AD {user?.ad_number || '00000'}
          </div>
        </div>
        
        {/* Schließen-Button (10%) */}
        <button
          className="stamp-close-btn"
          onClick={onRemove}
          aria-label="Stempel entfernen"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SignatureStamp;
