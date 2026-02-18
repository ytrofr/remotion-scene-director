import React from 'react';
import { useDirector } from '../context';

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

/** Inline activity log (compact, used inside Editor tab) */
export const ActivityLog: React.FC = () => {
  const { state } = useDirector();
  const entries = state.activityLog;

  if (entries.length === 0) return null;

  return (
    <div className="inspector__zoom-section">
      <div className="inspector__section-title">Activity Log ({entries.length})</div>
      <div className="activity-log__list">
        {entries.map((e, i) => (
          <div key={`${e.time}-${i}`} className="activity-log__entry">
            <span className="activity-log__time">{timeAgo(e.time)}</span>
            <span className="activity-log__action">{e.action}</span>
            {e.scene && <span className="activity-log__scene">{e.scene.split('-').slice(1).join('-')}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
