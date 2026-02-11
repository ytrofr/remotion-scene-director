/**
 * ExportModal v3 - Export + Import tabs
 * Export uses gesture-aware code generation. Import parses pasted code.
 */

import React, { useState, useCallback } from 'react';
import { useDirector } from '../context';
import { generateExportCode, generateAllExportCode, parseImportCode } from '../utils';

export const ExportModal: React.FC = () => {
  const { state, dispatch, composition } = useDirector();
  const [tab, setTab] = useState<'export' | 'import'>(state.importOpen ? 'import' : 'export');
  const [exportAll, setExportAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Export code
  const code = exportAll
    ? generateAllExportCode(
        composition.id,
        composition.scenes,
        state.waypoints,
        state.sceneGesture,
      )
    : state.selectedScene
      ? generateExportCode(
          state.selectedScene,
          composition.id,
          composition.scenes.find(s => s.name === state.selectedScene)!,
          state.waypoints[state.selectedScene] || [],
          state.sceneGesture[state.selectedScene] || 'click',
        )
      : '// Select a scene first';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const handleImport = useCallback(() => {
    if (!state.selectedScene) {
      setImportError('Select a scene first');
      return;
    }
    const result = parseImportCode(importCode);
    if (!result) {
      setImportError('No waypoints found. Paste code with { x: N, y: N, ... } objects.');
      return;
    }
    dispatch({
      type: 'IMPORT_PATHS',
      scene: state.selectedScene,
      waypoints: result.waypoints,
      gesture: result.gesture,
    });
    dispatch({ type: 'TOGGLE_EXPORT' });
  }, [importCode, state.selectedScene, dispatch]);

  return (
    <div
      className="export-modal__backdrop"
      onClick={() => dispatch({ type: 'TOGGLE_EXPORT' })}
    >
      <div
        className="export-modal__box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with tabs */}
        <div className="export-modal__header">
          <div className="export-modal__tabs">
            <button
              onClick={() => setTab('export')}
              className={`export-modal__tab ${tab === 'export' ? 'export-modal__tab--active' : ''}`}
            >
              Export
            </button>
            <button
              onClick={() => setTab('import')}
              className={`export-modal__tab ${tab === 'import' ? 'export-modal__tab--active' : ''}`}
            >
              Import
            </button>
          </div>
          <div className="export-modal__actions">
            {tab === 'export' && (
              <>
                <button
                  onClick={() => setExportAll(!exportAll)}
                  className={`toolbar__btn ${exportAll ? 'toolbar__btn--active' : ''}`}
                >
                  {exportAll ? 'All Scenes' : 'Current Scene'}
                </button>
                <button
                  onClick={handleCopy}
                  className={`toolbar__btn ${copied ? 'toolbar__btn--preview-on' : 'toolbar__btn--export'}`}
                >
                  {copied ? 'COPIED!' : 'COPY'}
                </button>
              </>
            )}
            {tab === 'import' && (
              <button
                onClick={handleImport}
                className="toolbar__btn toolbar__btn--export"
              >
                Load
              </button>
            )}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_EXPORT' })}
              className="toolbar__btn"
              title="Close (Escape)"
            >
              X
            </button>
          </div>
        </div>

        {/* Tab content */}
        {tab === 'export' && (
          <pre className="export-modal__code">
            {code}
          </pre>
        )}

        {tab === 'import' && (
          <div className="export-modal__import-area">
            <textarea
              className="export-modal__import-textarea"
              placeholder="Paste exported code here...&#10;&#10;Accepts any code containing { x: N, y: N, frame: N, ... } objects."
              value={importCode}
              onChange={(e) => { setImportCode(e.target.value); setImportError(null); }}
            />
            {importError && (
              <div className="export-modal__import-error">{importError}</div>
            )}
            {!state.selectedScene && (
              <div className="export-modal__import-error">Select a scene before importing</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
