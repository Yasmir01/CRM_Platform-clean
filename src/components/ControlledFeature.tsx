import React, { useState, ReactNode } from 'react';

interface ControlledFeatureProps {
  enabled: boolean;
  children: ReactNode;
  disabledLabel: string;
  className?: string;
}

export function ControlledFeature({ enabled, children, disabledLabel, className }: ControlledFeatureProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (enabled) return <>{children}</>;

  return (
    <div
      className={className || 'relative inline-block'}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        className="px-3 py-1 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
        disabled
        aria-disabled="true"
      >
        Feature Disabled
      </button>

      {showTooltip && (
        <div role="tooltip" className="absolute top-full right-0 mt-2 w-72 p-2 text-sm text-white bg-black rounded shadow">
          {disabledLabel}
        </div>
      )}
    </div>
  );
}
