// Translator: SceneDirector waypoints → HF GSAP code block.
// Called from vite.config.ts /api/save-path after codedPaths.data.json write.
//
// INPUT: codedPaths entry shape
//   { gesture, animation, dark, path: [{ frame, x, y, gesture?, duration? }...] }
// OUTPUT: JS code string inserted between
//   // @auto-generated-from-scene-director:start
//   ...
//   // @auto-generated-from-scene-director:end
//
// Coordinate system: composition-space (1080×1920). The HF `#cursor` element is
// a sibling of `#phone-stage`, so cursor coords need NO phone-stage-transform
// adjustment. Remotion's FloatingHand uses the same composition-space convention
// (see rule 42), so coords port 1:1 between the two stacks.
//
// fps assumption: 30. Timing `<n>/30` stays explicit in generated code so
// humans reading the HF file can convert to seconds mentally (f=N → N/30 s).

import fs from 'fs';
import path from 'path';

const INDENT = '      ';
const START_MARKER = '// @auto-generated-from-scene-director:start';
const END_MARKER = '// @auto-generated-from-scene-director:end';

export function waypointsToHfBlock(entry) {
  const wps = entry?.path;
  if (!Array.isArray(wps) || wps.length === 0) return '// (no waypoints)';

  const out = [];
  const first = wps[0];
  // Match Remotion FloatingHand behavior: if first waypoint is after frame 0,
  // cursor is invisible until that frame (FloatingHand returns null before
  // startFrame). Otherwise cursor is visible from scene start.
  if (first.frame > 0) {
    out.push(
      `gsap.set('#cursor', { opacity: 0, rotation: 0, ...setC(${first.x}, ${first.y}) });`,
    );
    out.push(
      `tl.to('#cursor', { opacity: 1, duration: 0.1 }, ${first.frame}/30);`,
    );
  } else {
    out.push(
      `gsap.set('#cursor', { opacity: 1, rotation: 0, ...setC(${first.x}, ${first.y}) });`,
    );
  }

  // Track whether cursor was hidden by a previous click's fade-out.
  // After a click, the cursor fades to opacity 0 at click.frame + clickDur.
  // If a later waypoint moves the cursor, we need to:
  //  (a) set its position via gsap.set BEFORE the next visible move (avoids stale-pos flash on re-show)
  //  (b) fade opacity back to 1 at the next waypoint.frame
  let prev = first;
  let hiddenSince = null; // { frame: N } when cursor is invisible, else null
  for (let i = 1; i < wps.length; i++) {
    const wp = wps[i];
    const dFrames = Math.max(1, wp.frame - prev.frame);
    const isClick = wp.gesture === 'click';
    const samePos = wp.x === prev.x && wp.y === prev.y;

    // Re-show cursor if hidden from a prior click's fade-out
    if (hiddenSince !== null) {
      // Pin position to `prev` just before re-show so fade-in shows at correct spot
      out.push(
        `tl.set('#cursor', { ...setC(${prev.x}, ${prev.y}) }, ${hiddenSince.frame}/30);`,
      );
      out.push(
        `tl.to('#cursor', { opacity: 1, duration: 0.15 }, ${wp.frame}/30);`,
      );
      hiddenSince = null;
    }

    // Move cursor to this waypoint (skip if identical to prev position)
    if (!samePos) {
      const ease = isClick ? "'power2.in'" : "'power2.out'";
      out.push(
        `tl.to('#cursor', { ...setC(${wp.x}, ${wp.y}), duration: ${dFrames}/30, ease: ${ease} }, ${prev.frame}/30);`,
      );
    }

    if (isClick) {
      const clickDur = wp.duration || 12;
      out.push(
        `tl.call(() => { const p = document.querySelector('#cursor dotlottie-player'); if (p && p.seek) p.seek(35); }, null, ${wp.frame}/30);`,
      );
      out.push(
        `tl.set('#ripple', { x: ${wp.x - 60}, y: ${wp.y - 60}, scale: 0, opacity: 1 }, ${wp.frame}/30);`,
      );
      out.push(
        `tl.to('#ripple', { scale: 1.5, opacity: 0, duration: 0.5, ease: 'power2.out' }, ${wp.frame}/30);`,
      );
      out.push(
        `tl.to('#cursor', { opacity: 0, duration: 0.15 }, ${wp.frame + clickDur}/30);`,
      );
      hiddenSince = { frame: wp.frame + clickDur };
    }

    prev = wp;
  }

  return out.join('\n' + INDENT);
}

// Scene-name mapping: "4-ChatOpen" → "04-chatopen.html"
export function sceneNameToHfFilename(sceneName) {
  const m = sceneName.match(/^(\d+)-(.+)$/);
  if (!m) return null;
  const [, num, name] = m;
  return `${num.padStart(2, '0')}-${name.toLowerCase()}.html`;
}

// Replace the auto-gen block in an HF scene file.
// Returns { updated, reason?, hfFile? }.
export function updateHfScene(projectRoot, sceneName, entry) {
  const hfFilename = sceneNameToHfFilename(sceneName);
  if (!hfFilename) {
    return { updated: false, reason: `scene name format: ${sceneName}` };
  }
  const hfPath = path.resolve(projectRoot, 'hf/scenes', hfFilename);
  if (!fs.existsSync(hfPath)) {
    return { updated: false, reason: `no HF file: ${hfFilename}` };
  }

  const content = fs.readFileSync(hfPath, 'utf8');
  const startIdx = content.indexOf(START_MARKER);
  const endIdx = content.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    return {
      updated: false,
      reason: `markers absent in ${hfFilename} (scene not yet wired)`,
    };
  }
  if (endIdx < startIdx) {
    return { updated: false, reason: `markers out of order in ${hfFilename}` };
  }

  const block = waypointsToHfBlock(entry);
  const before = content.substring(0, startIdx + START_MARKER.length);
  const after = content.substring(endIdx);
  const newContent = before + '\n' + INDENT + block + '\n' + INDENT + after;

  if (newContent === content) {
    return { updated: false, reason: 'no-op', hfFile: hfFilename };
  }

  fs.writeFileSync(hfPath, newContent);
  return { updated: true, hfFile: hfFilename };
}
