import React from 'react';
import { AbsoluteFill, Html5Audio, Sequence, staticFile } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { cutsheet, sec, tokens, type CutFrame } from './timing';
import { Surface, Grain, Vignette } from './Surface';
import { Network } from './network/Network';
import { Scatter, ScatterDense, Converge, Orbit, Rejoin, Particles } from './frames/Field';
import { byKind } from './frames/Statements';
import { Reveal } from './frames/Reveal';
import voManifest from './vo-manifest.json';

const { fontFamily } = loadFont();

/**
 * L.I.M.O.R - a cinematic typographic presentation film.
 *
 * Structure note: the knowledge network is mounted OUTSIDE the per-frame sequences and
 * driven by absolute time. That is the whole thesis of the piece - the intelligence
 * accumulates across the film rather than being re-staged scene by scene - so it must
 * not remount when a frame changes.
 *
 * Everything the brief forbids (avatars, robots, brains, orbs, circuits, holograms,
 * dashboards) is absent by construction: there is no imagery pipeline here at all,
 * only type, a mineral surface and a growing organic structure.
 */

const renderFrame = (f: CutFrame): React.ReactNode => {
  switch (f.kind) {
    case 'scatter': return <Scatter />;
    case 'scatterDense': return <ScatterDense />;
    case 'converge': return <Converge />;
    case 'orbit': return <Orbit />;
    case 'rejoin': return <Rejoin />;
    case 'particles': return <Particles />;
    case 'reveal': return <Reveal />;
    default: return byKind(f);
  }
};

export const LimorFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: tokens.palette.mineral, fontFamily }}>
    <Surface />

    {/* The spine. Absolute time, never remounted. */}
    <Network />

    {cutsheet.frames.map((f) => (
      <Sequence key={f.id} from={sec(f.start)} durationInFrames={sec(f.dur)} name={`${f.act} - ${f.id}`}>
        {renderFrame(f)}
      </Sequence>
    ))}

    {voManifest.cues.map((cue) => (
      <Sequence key={cue.id} from={sec(cue.at)} durationInFrames={sec(cue.duration) + 2} name={`vo ${cue.id}`}>
        <Html5Audio src={staticFile(cue.src)} />
      </Sequence>
    ))}

    <Vignette />
    <Grain />
  </AbsoluteFill>
);
