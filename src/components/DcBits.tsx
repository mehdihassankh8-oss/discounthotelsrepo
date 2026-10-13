import React, { useState } from 'react';

/** Photo with the dchotels fallback: a navy panel carrying the label when there is no image or it fails to load. */
export const HotelPhoto: React.FC<{ src?: string; label: string; className?: string }> = ({ src, label, className = '' }) => {
  const [broken, setBroken] = useState(false);
  const failed = !src || broken;
  return (
    <div className={`ph ${failed ? 'broken' : ''} ${className}`} data-label={label}>
      {src && !broken && (
        <img src={src} alt={label} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
      )}
    </div>
  );
};

export const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span className="stars" aria-label={`${n} star hotel`}>{'★★★★★'.slice(0, n)}</span>
);
