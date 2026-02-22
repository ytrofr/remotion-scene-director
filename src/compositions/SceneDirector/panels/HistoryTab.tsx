import React from 'react';
import { useDirector } from '../context';
import type { VersionEntry } from '../state';

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Full History tab with version list + activity log */
export const HistoryTab: React.FC = () => {
  const { state, dispatch } = useDirector();
  const scene = state.selectedScene;
  const versions: VersionEntry[] = scene
    ? state.versionHistory[scene] || []
    : [];
  const entries = state.activityLog;

  return (
    <div className="history-tab">
      {/* Version history */}
      <div className="history-tab__section">
        <div className="inspector__section-title">
          Versions{scene ? ` — ${scene.split('-').slice(1).join('-')}` : ''}
        </div>
        {versions.length === 0 ? (
          <div className="history-tab__empty">
            No saved versions yet. Click Save to create one.
          </div>
        ) : (
          <div className="history-tab__list">
            {[...versions].reverse().map((v) => (
              <div key={v.version} className="history-tab__version">
                <div className="history-tab__version-info">
                  <span className="history-tab__version-num">v{v.version}</span>
                  <span className="history-tab__version-time">
                    {formatTime(v.timestamp)}
                  </span>
                  <span className="history-tab__version-detail">
                    {v.snapshot.waypoints.length}pts | {v.snapshot.gesture} |{' '}
                    {v.snapshot.dark ? 'light' : 'dark'}
                  </span>
                </div>
                <button
                  className="history-tab__restore-btn"
                  onClick={() => {
                    if (scene) {
                      dispatch({
                        type: 'RESTORE_VERSION',
                        scene,
                        snapshot: v.snapshot,
                      });
                    }
                  }}
                  title={`Restore to v${v.version}`}
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity log */}
      <div className="history-tab__section">
        <div className="inspector__section-title">
          Activity Log ({entries.length})
        </div>
        {entries.length === 0 ? (
          <div className="history-tab__empty">No activity yet.</div>
        ) : (
          <div className="history-tab__log">
            {entries.map((e, i) => (
              <div key={`${e.time}-${i}`} className="history-tab__log-entry">
                <span className="history-tab__log-time">{timeAgo(e.time)}</span>
                <span className="history-tab__log-action">{e.action}</span>
                {e.scene && (
                  <span className="history-tab__log-scene">
                    {e.scene.split('-').slice(1).join('-')}
                  </span>
                )}
                {e.snapshot && (
                  <button
                    className="history-tab__restore-btn history-tab__restore-btn--small"
                    onClick={() =>
                      dispatch({
                        type: 'RESTORE_ACTIVITY',
                        snapshot: e.snapshot!,
                      })
                    }
                    title="Restore to this point"
                  >
                    Restore
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
