// Translator: SceneDirector waypoints → HF GSAP code block.
// Called from vite.config.ts /api/save-path after codedPaths.data.json write.
//
// INPUT: codedPaths entry shape
//   { gesture, animation, dark, path: [{ frame, x, y, gesture?, duration?, rotation? }...],
//     secondaryLayers?: [{ gesture, path: [...] }, ...] }
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
//
// Secondary layers share the single #cursor element and MUST be time-disjoint
// (cursor hidden between layers via prior click's fade-out). Each secondary
// layer re-shows the cursor via tl.set + fade-in at its first waypoint.

import fs from 'fs';
import path from 'path';

const INDENT = '      ';
const START_MARKER = '// @auto-generated-from-scene-director:start';
const END_MARKER = '// @auto-generated-from-scene-director:end';

// Emit a tl.to for a pointer/click move. Handles optional rotation on drag.
function emitMove(out, wp, prev, ease) {
  const dFrames = Math.max(1, wp.frame - prev.frame);
  const rot = wp.rotation || 0;
  const prevRot = prev.rotation || 0;
  const samePos = wp.x === prev.x && wp.y === prev.y;
  const sameRot = rot === prevRot;
  if (samePos && sameRot) return;
  const props = [];
  if (!samePos) props.push(`...setC(${wp.x}, ${wp.y})`);
  if (!sameRot) props.push(`rotation: ${rot}`);
  out.push(
    `tl.to('#cursor', { ${props.join(', ')}, duration: ${dFrames}/30, ease: ${ease} }, ${prev.frame}/30);`,
  );
}

// Process a single waypoint list into GSAP calls. Returns the final `hiddenSince`
// state so the next layer can pick up correctly.
function processLayer(out, wps, isFirstLayer, hiddenSince) {
  const first = wps[0];

  // Seed the cursor: first layer → gsap.set; subsequent layer → tl.set + fade-in
  if (isFirstLayer) {
    if (first.frame > 0) {
      out.push(
        `gsap.set('#cursor', { opacity: 0, rotation: ${first.rotation || 0}, ...setC(${first.x}, ${first.y}) });`,
      );
      out.push(
        `tl.to('#cursor', { opacity: 1, duration: 0.1 }, ${first.frame}/30);`,
      );
    } else {
      out.push(
        `gsap.set('#cursor', { opacity: 1, rotation: ${first.rotation || 0}, ...setC(${first.x}, ${first.y}) });`,
      );
    }
  } else {
    // Secondary layer — cursor must have been hidden by the previous layer's
    // last click fade-out. Pin new position at that fade-out frame (no visual
    // flash, since opacity=0), then fade in at this layer's first frame.
    const pinFrame = hiddenSince !== null ? hiddenSince.frame : first.frame;
    out.push(
      `tl.set('#cursor', { ...setC(${first.x}, ${first.y}), rotation: ${first.rotation || 0} }, ${pinFrame}/30);`,
    );
    out.push(
      `tl.to('#cursor', { opacity: 1, duration: 0.15 }, ${first.frame}/30);`,
    );
    hiddenSince = null;
  }

  let prev = first;
  for (let i = 1; i < wps.length; i++) {
    const wp = wps[i];
    const isClick = wp.gesture === 'click';

    // Re-show cursor if hidden from a prior click's fade-out in the same layer.
    // Jump to the new wp position instantly while invisible, then fade in.
    // (No visible travel between click targets — the cursor just "reappears" at
    //  the next tap location.)
    if (hiddenSince !== null) {
      out.push(
        `tl.set('#cursor', { ...setC(${wp.x}, ${wp.y}), rotation: ${wp.rotation || 0} }, ${hiddenSince.frame}/30);`,
      );
      out.push(
        `tl.to('#cursor', { opacity: 1, duration: 0.15 }, ${wp.frame}/30);`,
      );
      hiddenSince = null;
    } else {
      emitMove(out, wp, prev, isClick ? "'power2.in'" : "'power2.out'");
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

  return hiddenSince;
}

export function waypointsToHfBlock(entry) {
  const primaryWps = entry?.path;
  const secondary = Array.isArray(entry?.secondaryLayers)
    ? entry.secondaryLayers
    : [];

  if (!Array.isArray(primaryWps) || primaryWps.length === 0) {
    return '// (no waypoints)';
  }

  const out = [];
  let hiddenSince = processLayer(out, primaryWps, true, null);

  for (const layer of secondary) {
    const wps = layer?.path;
    if (!Array.isArray(wps) || wps.length === 0) continue;
    hiddenSince = processLayer(out, wps, false, hiddenSince);
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
