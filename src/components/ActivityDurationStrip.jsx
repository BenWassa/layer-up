import { useState } from 'react';
import { OptionSelector } from './OptionSelector';

export function ActivityDurationStrip({
  activity,
  duration,
  activityOptions,
  durationOptions,
  onActivityChange,
  onDurationChange,
}) {
  const [expanded, setExpanded] = useState(false);

  const activeActivity = activityOptions.find((o) => o.key === activity);
  const activeDuration = durationOptions.find((o) => o.key === duration);

  return (
    <div className="acd-strip content-panel" data-expanded={expanded}>
      <button
        className="acd-strip-summary"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="acd-strip-text">
          {activeActivity?.icon && (
            <span className="acd-strip-icon" aria-hidden="true">
              {activeActivity.icon}
            </span>
          )}
          {activeActivity?.label}
          <span className="acd-strip-sep" aria-hidden="true">·</span>
          {activeDuration?.label}
        </span>
        <span className="acd-strip-edit" aria-hidden="true">
          {expanded ? '✕' : '✎'}
        </span>
      </button>

      {expanded && (
        <div className="acd-expanded">
          <OptionSelector
            label="Activity"
            options={activityOptions}
            selectedKey={activity}
            onSelect={onActivityChange}
            showIcons
          />
          <OptionSelector
            label="Duration"
            options={durationOptions}
            selectedKey={duration}
            onSelect={onDurationChange}
          />
        </div>
      )}
    </div>
  );
}
