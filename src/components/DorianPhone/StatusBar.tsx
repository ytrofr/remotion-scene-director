import React from 'react';

export const StatusBar: React.FC<{ zIndex?: number }> = React.memo(({ zIndex = 5 }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 50,
      background: 'white',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: '0 25px 5px 25px',
      zIndex,
    }}
  >
    <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>10:45</span>
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {/* Signal */}
      <svg width="18" height="12" viewBox="0 0 18 12">
        <rect x="0" y="8" width="3" height="4" fill="#000" />
        <rect x="5" y="5" width="3" height="7" fill="#000" />
        <rect x="10" y="2" width="3" height="10" fill="#000" />
        <rect x="15" y="0" width="3" height="12" fill="#000" />
      </svg>
      {/* Battery */}
      <div style={{ width: 25, height: 12, border: '1px solid #000', borderRadius: 3, position: 'relative' }}>
        <div style={{ position: 'absolute', right: -4, top: 3, width: 2, height: 6, background: '#000', borderRadius: '0 2px 2px 0' }} />
        <div style={{ position: 'absolute', left: 2, top: 2, right: 4, bottom: 2, background: '#000', borderRadius: 1 }} />
      </div>
    </div>
  </div>
));
