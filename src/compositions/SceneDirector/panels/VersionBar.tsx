/**
 * VersionBar — Version control surface for SceneDirector.
 *
 * Surfaces version families (compositions sharing a base name) with their
 * sub-versions (V1.00 / V1.01 / ...). Lets the user:
 *   - Pick a family + version → sets the active SceneDirector composition
 *   - Bump current top → next sub-version (server clones the .tsx, returns wireup hints)
 *   - Freeze a version → adds its files to .frozen.json (sealed by hook)
 *
 * Family detection runs client-side from the COMPOSITIONS registry. A composition
 * id like 'DorianFullV1-01' is parsed as family='DorianFull', version='V1.01'.
 * Bare ids (no V suffix) are treated as the family's V1.00 baseline.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDirector } from '../context';
import { COMPOSITIONS } from '../compositions';
import {
  LockIcon,
  LockOpenIcon,
  CopyIcon,
  CheckIcon,
  AlertIcon,
  CloseIcon,
} from './icons';

type VersionEntry = {
  /** SceneDirector composition id (e.g. 'DorianFullV1-01' or 'DorianFull') */
  compId: string;
  /** Display label e.g. 'V1.00', 'V1.01' */
  label: string;
  /** Sortable numeric form: major*100 + minor (1.01 → 101) */
  ord: number;
};

type Family = {
  name: string;
  /** Display label from the base composition (or family name if none) */
  baseLabel: string;
  versions: VersionEntry[];
};

const VERSION_RE = /^(.+?)V(\d+)-(\d{2})$/;

function detectFamilies(): Family[] {
  const map = new Map<string, Family>();
  for (const c of COMPOSITIONS) {
    const m = VERSION_RE.exec(c.id);
    if (m) {
      const family = m[1];
      const major = parseInt(m[2], 10);
      const minor = parseInt(m[3], 10);
      const label = `V${major}.${String(minor).padStart(2, '0')}`;
      const ord = major * 100 + minor;
      const f = map.get(family) ?? {
        name: family,
        baseLabel: family,
        versions: [],
      };
      f.versions.push({ compId: c.id, label, ord });
      map.set(family, f);
    }
  }
  // Now attach base (V1.00) for every family that has a bare composition id matching
  for (const c of COMPOSITIONS) {
    if (VERSION_RE.test(c.id)) continue;
    const f = map.get(c.id);
    if (!f) continue;
    f.baseLabel = c.label;
    f.versions.unshift({ compId: c.id, label: 'V1.00', ord: 100 });
  }
  // Drop families that don't have a bare base composition (they wouldn't appear
  // in the dropdown today; show them when user adds them to compositions.ts)
  const out: Family[] = [];
  for (const [name, f] of map) {
    if (f.versions.length === 0) continue;
    f.versions.sort((a, b) => a.ord - b.ord);
    if (!f.baseLabel || f.baseLabel === f.name) f.baseLabel = name;
    out.push(f);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** Parse the family name out of a known composition id (or its base form). */
function familyOf(compId: string): string {
  const m = VERSION_RE.exec(compId);
  return m ? m[1] : compId;
}

/** Resolve the on-disk path for a composition's source file. */
function fileFor(compId: string): string | null {
  const m = VERSION_RE.exec(compId);
  if (m) {
    const family = m[1];
    const major = parseInt(m[2], 10);
    const minor = parseInt(m[3], 10);
    const label = `V${major}.${String(minor).padStart(2, '0')}`;
    return `src/compositions/${family}/${family}${label}.tsx`;
  }
  // Bare base
  return `src/compositions/${compId}/${compId}.tsx`;
}

export const VersionBar: React.FC = () => {
  const { state, dispatch } = useDirector();
  const families = useMemo(detectFamilies, []);

  // Frozen file index — refetched after freeze
  const [frozenSet, setFrozenSet] = useState<Set<string>>(new Set());
  const refetchFrozen = useCallback(async () => {
    try {
      const res = await fetch('/api/versions/frozen', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const s = new Set<string>(
        (data.frozen ?? []).map((e: { file: string }) => e.file),
      );
      setFrozenSet(s);
    } catch {
      /* ignore — display assumes unfrozen */
    }
  }, []);
  useEffect(() => {
    refetchFrozen();
  }, [refetchFrozen]);

  // Derive current family + version from compositionId
  const currentFamilyName = familyOf(state.compositionId);
  const currentFamily = families.find((f) => f.name === currentFamilyName);
  const currentVersion =
    currentFamily?.versions.find((v) => v.compId === state.compositionId) ??
    null;

  // Action state
  const [busy, setBusy] = useState<'idle' | 'bumping' | 'freezing'>('idle');
  const busyRef = useRef(busy);
  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);
  const [flash, setFlash] = useState<{
    kind: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [bumpResult, setBumpResult] = useState<{
    newVersion: string;
    newCompId: string;
    newFile: string;
    instructions: string[];
  } | null>(null);
  const [confirmFreeze, setConfirmFreeze] = useState<{
    label: string;
    files: string[];
  } | null>(null);

  // Auto-clear flash messages
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3500);
    return () => clearTimeout(t);
  }, [flash]);

  // Listen for cross-component triggers: SaveCluster fires sd-bump-version
  // after a regular Save; MoreMenu fires sd-freeze-version. Both reuse the
  // existing in-place handlers so the popovers render anchored to VersionBar.
  useEffect(() => {
    const onBumpEvent = () => {
      if (busyRef.current !== 'idle') return;
      onBumpRef.current();
    };
    const onFreezeEvent = () => {
      if (busyRef.current !== 'idle') return;
      onFreezeRequestRef.current();
    };
    window.addEventListener('sd-bump-version', onBumpEvent);
    window.addEventListener('sd-freeze-version', onFreezeEvent);
    return () => {
      window.removeEventListener('sd-bump-version', onBumpEvent);
      window.removeEventListener('sd-freeze-version', onFreezeEvent);
    };
  }, []);

  // Frozen status of the current version's primary file
  const currentFile = currentVersion ? fileFor(currentVersion.compId) : null;
  const currentIsFrozen = currentFile ? frozenSet.has(currentFile) : false;

  const onSelectVersion = useCallback(
    (compId: string) => {
      if (compId === state.compositionId) return;
      dispatch({ type: 'SET_COMPOSITION', id: compId });
    },
    [state.compositionId, dispatch],
  );

  const onBump = useCallback(async () => {
    if (!currentFamily || !currentVersion) return;
    if (currentVersion.label === 'V1.00') {
      setFlash({
        kind: 'err',
        text: 'First bump from V1.00 must be done manually (see version-safe-iteration.md).',
      });
      return;
    }
    const file = fileFor(currentVersion.compId);
    if (!file) return;

    // Pre-flight: scan all saved scenes in the source comp for destructive
    // changes vs the registry baseline. Surfaces the scene-4 incident pattern
    // BEFORE the bump propagates a broken state into the new version.
    try {
      const { diffSave } = await import('../saveDiff');
      const { getCodedPath } = await import('../codedPaths');
      const r = await fetch(
        `/api/get-saved-comp?compositionId=${encodeURIComponent(currentVersion.compId)}`,
      );
      if (r.ok) {
        const { entries } = (await r.json()) as {
          entries: Record<string, unknown>;
        };
        const issues: string[] = [];
        for (const [sceneName, savedRaw] of Object.entries(entries ?? {})) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const saved = savedRaw as any;
          const registry = getCodedPath(currentVersion.compId, sceneName);
          const proposal = {
            path: saved?.path ?? [],
            gesture: saved?.gesture ?? 'click',
            animation: saved?.animation,
            dark: saved?.dark,
            locked: saved?._locked ?? false,
            secondaryLayers: saved?.secondaryLayers,
          };
          // Compare current saved (= what bump will copy) vs registry. If
          // saved looks destructive vs registry, warn the user.
          const diff = diffSave(proposal, null, registry);
          if (diff.severity !== 'safe') {
            issues.push(
              `  • ${sceneName}: ${diff.reasons.slice(0, 2).join('; ')}`,
            );
          }
        }
        if (issues.length > 0) {
          const ok = confirm(
            `Bump pre-flight check found potentially destructive saved data in source version "${currentVersion.label}":\n\n${issues.join('\n')}\n\nThe bump will COPY this state into the new version. Continue?`,
          );
          if (!ok) return;
        }
      }
    } catch (err) {
      console.warn('Bump pre-flight check failed (proceeding):', err);
    }

    setBusy('bumping');
    try {
      const res = await fetch('/api/versions/bump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family: currentFamily.name,
          currentVersion: currentVersion.label,
          currentFile: file,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `bump failed (${res.status})`);
      }
      setBumpResult({
        newVersion: data.newVersion,
        newCompId: data.newCompId,
        newFile: data.newFile,
        instructions: data.instructions,
      });
      setFlash({
        kind: 'ok',
        text: `Cloned ${currentVersion.label} → ${data.newVersion}. See wire-up steps below.`,
      });
    } catch (err) {
      setFlash({ kind: 'err', text: String(err) });
    } finally {
      setBusy('idle');
    }
  }, [currentFamily, currentVersion]);

  const onFreezeRequest = useCallback(async () => {
    if (!currentVersion) return;
    if (currentVersion.label === 'V1.00') {
      setFlash({
        kind: 'err',
        text: 'V1.00 baseline freeze is set up at project init — not via this UI.',
      });
      return;
    }
    setBusy('freezing');
    try {
      const res = await fetch(
        `/api/versions/scan?label=${encodeURIComponent(currentVersion.label)}`,
        { cache: 'no-store' },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'scan failed');
      const unfrozen = (
        data.files as { file: string; frozen: boolean }[]
      ).filter((f) => !f.frozen);
      if (unfrozen.length === 0) {
        setFlash({
          kind: 'ok',
          text: `${currentVersion.label}: all files already frozen.`,
        });
        return;
      }
      setConfirmFreeze({
        label: currentVersion.label,
        files: unfrozen.map((f) => f.file),
      });
    } catch (err) {
      setFlash({ kind: 'err', text: String(err) });
    } finally {
      setBusy('idle');
    }
  }, [currentVersion]);

  // Refs to latest handlers — used by window event listeners (defined once,
  // stay stable; latest closure read via .current on event fire).
  const onBumpRef = useRef(onBump);
  const onFreezeRequestRef = useRef(onFreezeRequest);
  useEffect(() => {
    onBumpRef.current = onBump;
    onFreezeRequestRef.current = onFreezeRequest;
  }, [onBump, onFreezeRequest]);

  const onFreezeConfirm = useCallback(async () => {
    if (!confirmFreeze || !currentFamily) return;
    setBusy('freezing');
    try {
      const res = await fetch('/api/versions/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: confirmFreeze.files,
          version: `${currentFamily.name} ${confirmFreeze.label}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `freeze failed (${res.status})`);
      }
      await refetchFrozen();
      setFlash({
        kind: 'ok',
        text: `Frozen ${data.added} file${data.added === 1 ? '' : 's'} as ${currentFamily.name} ${confirmFreeze.label}.`,
      });
      setConfirmFreeze(null);
    } catch (err) {
      setFlash({ kind: 'err', text: String(err) });
    } finally {
      setBusy('idle');
    }
  }, [confirmFreeze, currentFamily, refetchFrozen]);

  const copy = useCallback((text: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      /* ignore — fallback would be a textarea select */
    }
  }, []);

  // Hide entirely for non-versioned compositions (e.g. SigmaAppDemo) \u2014
  // the main video dropdown in Toolbar already names them; nothing to add.
  if (!currentFamily) return null;

  return (
    <div className="version-bar">
      <span className="version-bar__label">Version</span>

      {/* Sub-version dropdown \u2014 picks within the current family */}
      <select
        className="version-bar__select version-bar__select--version"
        value={state.compositionId}
        onChange={(e) => onSelectVersion(e.target.value)}
        disabled={busy !== 'idle'}
        title="Sub-version"
      >
        {currentFamily.versions.map((v) => {
          const file = fileFor(v.compId);
          const frozen = file ? frozenSet.has(file) : false;
          return (
            <option key={v.compId} value={v.compId}>
              {v.label}
              {frozen ? ' \u2022 sealed' : ''}
            </option>
          );
        })}
      </select>

      {/* Frozen indicator (read-only badge) */}
      <span
        className={`version-bar__lock ${currentIsFrozen ? 'version-bar__lock--on' : 'version-bar__lock--off'}`}
        title={
          currentIsFrozen
            ? `${currentFile} is frozen — edits blocked by hook`
            : `${currentFile ?? '(unknown)'} is editable`
        }
      >
        {currentIsFrozen ? <LockIcon size={14} /> : <LockOpenIcon size={14} />}
      </span>

      {/* Inline status flash */}
      {flash && (
        <span
          className={`version-bar__flash version-bar__flash--${flash.kind}`}
          role="status"
        >
          {flash.kind === 'ok' ? (
            <CheckIcon size={12} />
          ) : (
            <AlertIcon size={12} />
          )}
          <span>{flash.text}</span>
        </span>
      )}

      {/* Freeze confirmation popover */}
      {confirmFreeze && (
        <div className="version-bar__popover" role="dialog">
          <div className="version-bar__popover-head">
            <strong>
              Freeze {currentFamily?.name} {confirmFreeze.label}?
            </strong>
            <button
              type="button"
              className="version-bar__icon-btn"
              onClick={() => setConfirmFreeze(null)}
              aria-label="Cancel"
            >
              <CloseIcon size={14} />
            </button>
          </div>
          <p className="version-bar__popover-sub">
            These {confirmFreeze.files.length} file
            {confirmFreeze.files.length === 1 ? '' : 's'} will be added to{' '}
            <code>.frozen.json</code>. The hook blocks future Edit/Write to
            them.
          </p>
          <ul className="version-bar__file-list">
            {confirmFreeze.files.map((f) => (
              <li key={f}>
                <code>{f}</code>
              </li>
            ))}
          </ul>
          <div className="version-bar__popover-actions">
            <button
              type="button"
              className="version-bar__btn"
              onClick={() => setConfirmFreeze(null)}
              disabled={busy === 'freezing'}
            >
              Cancel
            </button>
            <button
              type="button"
              className="version-bar__btn version-bar__btn--primary"
              onClick={onFreezeConfirm}
              disabled={busy === 'freezing'}
            >
              <LockIcon size={14} />
              <span>Confirm freeze</span>
            </button>
          </div>
        </div>
      )}

      {/* Bump result popover (wire-up checklist) */}
      {bumpResult && (
        <div className="version-bar__popover" role="dialog">
          <div className="version-bar__popover-head">
            <strong>Created {bumpResult.newVersion}</strong>
            <button
              type="button"
              className="version-bar__icon-btn"
              onClick={() => setBumpResult(null)}
              aria-label="Dismiss"
            >
              <CloseIcon size={14} />
            </button>
          </div>
          <p className="version-bar__popover-sub">
            File written: <code>{bumpResult.newFile}</code>
          </p>
          <p className="version-bar__popover-sub">
            Composition id: <code>{bumpResult.newCompId}</code>{' '}
            <button
              type="button"
              className="version-bar__icon-btn"
              onClick={() => copy(bumpResult.newCompId)}
              title="Copy composition id"
            >
              <CopyIcon size={12} />
            </button>
          </p>
          <p className="version-bar__popover-sub">
            <strong>Wire-up status</strong> — the new version is auto-wired into
            all 5 registries. If any line shows ✗, follow the manual step then
            refresh.
          </p>
          <ol className="version-bar__steps">
            {bumpResult.instructions.map((s, i) => (
              <li key={i}>
                <code>{s}</code>
              </li>
            ))}
          </ol>
          <div className="version-bar__popover-actions">
            <button
              type="button"
              className="version-bar__btn version-bar__btn--primary"
              onClick={() => setBumpResult(null)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
