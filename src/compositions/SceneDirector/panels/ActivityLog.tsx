import React from 'react';
import { useDirector } from '../context';

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export const ActivityLog: React.FC = () => {
  const { state } = useDirector();
  const entries = state.activityLog;

  if (entries.length === 0) return null;

  return (
    <div className="inspector__zoom-section">
      <div className="inspector__section-title">Activity Log ({entries.length})</div>
      <div style={{ maxHeight: 160, overflowY: 'auto', fontSize: 11, fontFamily: 'var(--mono)' }}>
        {entries.map((e, i) => (
          <div key={`${e.time}-${i}`} style={{
            padding: '3px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: 'var(--text-muted)',
            display: 'flex',
            gap: 6,
          }}>
            <span style={{ color: 'var(--text-dim)', minWidth: 42, flexShrink: 0 }}>{timeAgo(e.time)}</span>
            <span style={{ color: 'var(--text)' }}>{e.action}</span>
            {e.scene && <span style={{ color: 'var(--accent)', marginLeft: 'auto', flexShrink: 0 }}>{e.scene.split('-').slice(1).join('-')}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
