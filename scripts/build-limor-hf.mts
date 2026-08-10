/**
 * Builds the HyperFrames arm of the L.I.M.O.R tournament.
 *
 * The fidelity rule for a cross-implementation tournament is that both arms must be
 * the SAME program expressed two ways - otherwise you are ranking two different films.
 * So this generator imports the cut sheet, the design tokens AND the network geometry
 * from the very modules the Remotion arm renders from. Nothing about the piece is
 * re-typed here; only the way it is expressed changes (React/Remotion vs HTML/GSAP).
 *
 * Run: npx tsx scripts/build-limor-hf.mts
 */

import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cutsheet, tokens, scatterItems, stringItems, type CutFrame } from '../src/compositions/LimorFilm/timing';
import { NODES, LINKS, linkPath } from '../src/compositions/LimorFilm/network/model';
import voManifest from '../src/compositions/LimorFilm/vo-manifest.json';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'hf/limor');
const P = tokens.palette;
const T = tokens.type;
const M = tokens.motion;
const { width, height } = tokens.canvas;

const SEED_AT = 25.5;
const GROW_FROM = 31.5;
const GROW_TO = 75.5;
const MATURE_AT = 81.5;
const CLEAR_AT = 96.0;
const GROW_DUR = tokens.network.growthFrames / cutsheet.fps;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const px = (n: number) => `${n}px`;

type Tween = string;
const tweens: Tween[] = [];
const at = (t: number) => t.toFixed(3);

/**
 * Entrance/exit bookkeeping.
 *
 * A GSAP timeline does not care whether you schedule an element's fade-OUT before its
 * fade-IN. It simply runs both in order, and the element ends up visible forever -
 * which is how a line from a 2.5-second scene can still be on screen thirty seconds
 * later, in the middle of the brand reveal. Nothing errors and nothing looks wrong in
 * the generator; only the finished video shows it. So track both and refuse to build.
 */
const enters = new Map<string, number>();
const leaves = new Map<string, number>();

/** Every element enters exactly as it does in the Remotion arm: fade plus a settle. */
const enter = (sel: string, time: number, dur = M.fadeInFrames / cutsheet.fps) => {
  enters.set(sel, time);
  tweens.push(
    `tl.fromTo("${sel}",{opacity:0,y:${M.riseDistance}},{opacity:1,y:0,duration:${dur.toFixed(3)},ease:"${'power2.out'}"},${at(time)});`
  );
};
const leave = (sel: string, time: number) => {
  leaves.set(sel, time);
  tweens.push(`tl.to("${sel}",{opacity:0,duration:${(M.fadeOutFrames / cutsheet.fps).toFixed(3)},ease:"power2.out"},${at(time)});`);
};

// ---------------------------------------------------------------------------
// The network. Same nodes, same links, same breadth-first birth order.
// ---------------------------------------------------------------------------

const linkBirth = (order: number) => GROW_FROM + order * (GROW_TO - GROW_FROM);

const networkSvg = () => {
  const paths = LINKS.map((l, i) => {
    const a = NODES[l.a];
    const b = NODES[l.b];
    return `<path id="lk${i}" class="lk" d="${linkPath(a.x, a.y, b.x, b.y, l.bow)}" stroke-width="${l.w.toFixed(2)}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" opacity="${(0.42 + l.order * 0.2).toFixed(2)}"/>`;
  }).join('');

  const dots = NODES.map(
    (n, i) => `<circle id="nd${i}" class="nd" cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(2)}" opacity="0"/>`
  ).join('');

  return `<svg id="net" viewBox="0 0 ${width} ${height}"><g id="netg" opacity="0">${paths}${dots}</g><circle id="seed" cx="${NODES[0].x}" cy="${NODES[0].y}" r="3.4" opacity="0"/></svg>`;
};

const networkTweens = () => {
  tweens.push(`tl.to("#seed",{opacity:0.9,duration:1.2,ease:"power2.out"},${at(SEED_AT)});`);
  tweens.push(`tl.to("#netg",{opacity:0.55,duration:${at(60 - GROW_FROM)},ease:"none"},${at(GROW_FROM)});`);
  tweens.push(`tl.to("#netg",{opacity:0.16,duration:${at(CLEAR_AT - MATURE_AT)},ease:"none"},${at(MATURE_AT)});`);
  tweens.push(`tl.to("#seed",{opacity:0.25,duration:${at(CLEAR_AT - MATURE_AT)},ease:"none"},${at(MATURE_AT)});`);

  const nodeBirth = new Map<number, number>([[0, SEED_AT]]);
  LINKS.forEach((l) => {
    const b = linkBirth(l.order);
    for (const i of [l.a, l.b]) if (!nodeBirth.has(i) || nodeBirth.get(i)! > b) nodeBirth.set(i, b);
  });

  LINKS.forEach((l, i) => {
    tweens.push(`tl.to("#lk${i}",{strokeDashoffset:0,duration:${GROW_DUR.toFixed(3)},ease:"power1.out"},${at(linkBirth(l.order))});`);
  });
  nodeBirth.forEach((b, i) => {
    tweens.push(`tl.to("#nd${i}",{opacity:0.5,duration:0.9,ease:"power2.out"},${at(b)});`);
  });
};

// ---------------------------------------------------------------------------
// Frames
// ---------------------------------------------------------------------------

const blocks: string[] = [];
let uid = 0;
const nextId = () => `e${uid++}`;

const centred = (html: string) => {
  const id = nextId();
  blocks.push(`<div class="ctr"><div id="${id}" style="opacity:0">${html}</div></div>`);
  return id;
};

/**
 * Several lines sharing one centred column, each animatable on its own. Returns one id
 * per line so the caller can stagger them without any of them needing a CSS transform.
 */
const group = (items: string[], gap = 22) => {
  const ids = items.map(() => nextId());
  const inner = items.map((h, i) => `<div id="${ids[i]}" style="opacity:0">${h}</div>`).join('');
  blocks.push(`<div class="ctr"><div class="grp" style="gap:${gap}px">${inner}</div></div>`);
  return ids;
};

const wordAt = (text: string, x: number, y: number, cls: string) => {
  const id = nextId();
  blocks.push(
    `<div id="${id}" class="${cls}" style="left:${px(x * width)};top:${px(y * height)}">${esc(text)}</div>`
  );
  return id;
};

const buildFrame = (f: CutFrame) => {
  const s = f.start;
  const end = f.start + f.dur;

  switch (f.kind) {
    case 'scatter': {
      // Tagged actI so the convergence can collect exactly this field later, without
      // also grabbing the words that settle onto the network in Acts III and V.
      scatterItems(f).forEach((it, i) => {
        const id = wordAt(it.t, it.x, it.y, 'word actI');
        enter(`#${id}`, s + 0.4 + i * 0.34);
      });
      break;
    }
    case 'scatterDense': {
      scatterItems(f).forEach((it, i) => {
        const id = wordAt(it.t, it.x, it.y, 'frag actI');
        enter(`#${id}`, s + 0.15 + i * 0.36);
      });
      // The standing words recede as the specifics arrive - accumulation, not replacement.
      tweens.push(`tl.to(".word.actI",{opacity:0.4,duration:0.8,ease:"power2.out"},${at(s + 0.4)});`);
      break;
    }
    case 'converge': {
      // The Act I field collapses onto the centre while the phrases arrive, and must
      // reach ZERO - a residual 0.06 reads as ghost text under every later statement.
      tweens.push(`tl.to(".actI",{x:(i,el)=>(${width / 2}-parseFloat(el.style.left))*0.9,y:(i,el)=>(${height * 0.52}-parseFloat(el.style.top))*0.9,opacity:0,duration:4.6,ease:"power2.inOut"},${at(s)});`);
      const step = 0.82;
      (f.sequence ?? []).forEach((line, i) => {
        const id = centred(`<div class="line">${esc(line)}</div>`);
        enter(`#${id}`, s + i * step);
        leave(`#${id}`, s + i * step + step - 0.18);
      });
      const fin = centred(`<div class="statement">${esc(f.final as string)}</div>`);
      enter(`#${fin}`, s + (f.finalAt ?? 0));
      leave(`#${fin}`, end - 0.25);
      break;
    }
    case 'swap': {
      const a = centred(`<div class="statement dim">${esc(f.a!)}</div>`);
      enter(`#${a}`, s + 0.25);
      leave(`#${a}`, s + (f.swapAt ?? 0) - 0.5);

      const tail = f.tail ?? [];
      if (tail.length === 0) {
        const b = centred(`<div class="statement">${esc(f.b!)}</div>`);
        enter(`#${b}`, s + (f.swapAt ?? 0));
        leave(`#${b}`, end - 0.2);
      } else {
        const ids = group([`<div class="statement">${esc(f.b!)}</div>`, ...tail.map((t) => `<div class="frag-c">${esc(t)}</div>`)], 30);
        enter(`#${ids[0]}`, s + (f.swapAt ?? 0));
        leave(`#${ids[0]}`, end - 0.15);

        // Fit the tail lines into whatever time the frame actually has left rather than
        // assuming a fixed stagger. On a short frame a fixed 0.34s step runs past the
        // end, which schedules a line's exit before its entrance.
        const first = s + (f.swapAt ?? 0) + 0.4;
        const last = end - 0.5;
        const step = tail.length > 1 ? Math.min(0.34, (last - first) / (tail.length - 1)) : 0;
        tail.forEach((_, i) => {
          enter(`#${ids[i + 1]}`, Math.min(first + i * step, last), 0.45);
          leave(`#${ids[i + 1]}`, end - 0.15);
        });
      }
      break;
    }
    case 'question': {
      const id = centred(`<div class="hero">${esc(f.text!)}</div>`);
      enter(`#${id}`, s + 0.9);
      leave(`#${id}`, end - 0.3);
      break;
    }
    case 'questions': {
      const items = stringItems(f);
      const slot = f.dur / items.length;
      items.forEach((q, i) => {
        const id = centred(`<div class="question">${esc(q)}</div>`);
        enter(`#${id}`, s + i * slot);
        leave(`#${id}`, s + (i + 1) * slot - 0.28);
      });
      break;
    }
    case 'stack': {
      const items = stringItems(f);
      const step = f.dur / (items.length + 1.4);
      const cls = f.hero ? 'statement' : 'line';
      const ids = group(items.map((l) => `<div class="${cls}">${esc(l)}</div>`), f.hero ? 30 : 20);
      ids.forEach((id, i) => {
        enter(`#${id}`, s + 0.3 + i * step);
        leave(`#${id}`, end - 0.2);
      });
      break;
    }
    case 'orbit':
    case 'rejoin':
    case 'particles': {
      const items = stringItems(f);
      const offset = f.kind === 'orbit' ? 9 : f.kind === 'rejoin' ? 3 : 17;
      const cls = f.kind === 'particles' ? 'whisper' : 'word';
      items.forEach((t, i) => {
        const n = NODES[(i * 5 + offset) % NODES.length];
        const id = wordAt(t, n.x / width, n.y / height, cls);
        enter(`#${id}`, s + 0.1 + i * (f.kind === 'orbit' ? 0.36 : 0.12));
        leave(`#${id}`, end - 0.25);
      });
      if (f.kind === 'particles') {
        const fin = f.final as string[];
        const ids = group(fin.map((l) => `<div class="line">${esc(l)}</div>`), 18);
        ids.forEach((id, i) => {
          enter(`#${id}`, s + 1.7 + i * 0.4);
          leave(`#${id}`, end - 0.15);
        });
      }
      break;
    }
    case 'dissolve': {
      const items = stringItems(f);
      const slot = f.dur / items.length;
      items.forEach((line, i) => {
        const id = centred(`<div class="line">${esc(line)}</div>`);
        enter(`#${id}`, s + i * slot);
        tweens.push(`tl.to("#${id}",{opacity:0,y:-16,duration:${(slot * 0.4).toFixed(2)},ease:"power2.in"},${at(s + i * slot + slot * 0.55)});`);
      });
      break;
    }
    case 'chain': {
      const items = stringItems(f);
      const ids = group(items.map((l) => `<div class="frag-c">${esc(l)}</div>`), 10);
      ids.forEach((id, i) => {
        enter(`#${id}`, s + i * 0.46, 0.4);
        leave(`#${id}`, s + 2.1 - 0.2);
      });
      const fin = centred(`<div class="line">${esc(f.final as string)}</div>`);
      enter(`#${fin}`, s + 2.1);
      leave(`#${fin}`, end - 0.15);
      break;
    }
    case 'words': {
      const items = stringItems(f);
      const slot = f.dur / items.length;
      items.forEach((w, i) => {
        const id = centred(`<div class="hero">${esc(w)}</div>`);
        enter(`#${id}`, s + i * slot, 0.35);
        leave(`#${id}`, s + (i + 1) * slot - 0.14);
      });
      break;
    }
    case 'mutual': {
      const [a, b] = group([`<div class="line">${esc(f.a!)}</div>`, `<div class="line">${esc(f.b!)}</div>`], 34);
      tweens.push(`tl.fromTo("#${a}",{opacity:0,x:-34},{opacity:1,x:0,duration:1.1,ease:"power2.out"},${at(s)});`);
      tweens.push(`tl.fromTo("#${b}",{opacity:0,x:34},{opacity:1,x:0,duration:1.1,ease:"power2.out"},${at(s + 1.15)});`);
      leave(`#${a}`, end - 0.2);
      leave(`#${b}`, end - 0.2);
      break;
    }
    case 'reveal': {
      const [mark, rule, slog] = group(
        [`<div class="mark">${esc(f.wordmark!)}</div>`, `<div class="rule"></div>`, `<div class="slogan">${esc(f.slogan!)}</div>`],
        46
      );
      tweens.push(`tl.fromTo("#${mark}",{opacity:0,y:${M.riseDistance},letterSpacing:"0.42em"},{opacity:1,y:0,letterSpacing:"0.2em",duration:2.2,ease:"power2.out"},${at(s + (f.wordmarkAt ?? 1))});`);
      enter(`#${rule}`, s + (f.sloganAt ?? 3.5) - 0.2, 0.6);
      enter(`#${slog}`, s + (f.sloganAt ?? 3.5));
      // "Everything disappears." The network has to go too - the Remotion arm gets this
      // for free because its reveal paints an opaque surface over the whole frame.
      tweens.push(`tl.to("#netg,#seed",{opacity:0,duration:1.1,ease:"power2.out"},${at(s - 0.6)});`);
      tweens.push(`tl.fromTo("#trace",{opacity:0,x:${-0.25 * width}},{opacity:0.5,x:${1.25 * width},duration:7.5,ease:"none"},${at(s)});`);
      break;
    }
  }
};

networkTweens();
cutsheet.frames.forEach(buildFrame);

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

const audioTags = voManifest.cues
  .map((c) => `<audio src="vo/${c.id}.wav" data-start="${c.at}" data-duration="${c.duration}"></audio>`)
  .join('\n      ');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>L.I.M.O.R - Endless Possibilities. One Entity.</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: ${P.mineral};
        font-family: "${T.family}", system-ui, sans-serif; }
      #stage { width: ${width}px; height: ${height}px; position: relative; background: ${P.mineral}; }
      .scene-content { position: absolute; inset: 0; }

      #fall { position: absolute; inset: 0;
        background: radial-gradient(78% 78% at 38% 34%, ${P.limestone}d9 0%, ${P.mineralWarm}80 48%, ${P.mineral}00 100%); }
      #vig { position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(72% 72% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%); }
      #grain { position: absolute; inset: 0; opacity: ${tokens.grain.opacity}; mix-blend-mode: overlay; pointer-events: none;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>"); }

      #net { position: absolute; inset: 0; width: ${width}px; height: ${height}px; }
      .lk { fill: none; stroke: ${P.clay}; stroke-linecap: round; }
      .nd { fill: ${P.sand}; }
      #seed { fill: ${P.amber}; }

      #trace { position: absolute; top: ${height * 0.52 - 280}px; left: 0; width: 1240px; height: 560px; opacity: 0;
        background: radial-gradient(50% 50% at 50% 50%, ${P.amber}80 0%, ${P.amberDim}24 55%, ${P.amber}00 100%); }

      /* Stacked lines are CHILDREN of one flex column, never separate full-screen
         layers nudged by CSS transform. GSAP writes to transform when it animates y,
         which silently overwrites any translateY the stylesheet set - that collapses
         every row onto the same baseline. Letting flexbox own the layout and GSAP own
         only the entrance keeps the two from fighting over the same property. */
      .ctr { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        flex-direction: column; padding: 0 220px; }
      .grp { display: flex; flex-direction: column; align-items: center; }

      .hero { font-size: ${T.scale.hero}px; font-weight: 300; letter-spacing: ${T.tracking.hero}em;
        color: ${P.bone}; text-align: center; line-height: ${T.leading}; max-width: 1500px; }
      .statement { font-size: ${T.scale.statement}px; font-weight: 400; letter-spacing: ${T.tracking.statement}em;
        color: ${P.bone}; text-align: center; line-height: ${T.leading}; max-width: 1340px; }
      .statement.dim { font-weight: 300; color: ${P.sand}; }
      .question { font-size: ${T.scale.question}px; font-weight: 300; letter-spacing: ${T.tracking.statement}em;
        color: ${P.bone}; text-align: center; line-height: ${T.leading}; max-width: 1400px; }
      .line { font-size: ${T.scale.line}px; font-weight: 300; letter-spacing: ${T.tracking.line}em;
        color: ${P.bone}; text-align: center; line-height: ${T.leading}; }
      .frag-c { font-size: ${T.scale.fragment}px; font-weight: 300; letter-spacing: ${T.tracking.fragment}em;
        color: ${P.sand}; text-align: center; }
      .mark { font-size: ${T.scale.hero}px; font-weight: 300; color: ${P.bone}; }
      .rule { width: 168px; height: 1px; background: ${P.ash}; opacity: 0.7; }
      .slogan { font-size: ${T.scale.fragment}px; font-weight: 300; letter-spacing: ${T.tracking.fragment}em;
        color: ${P.sand}; text-align: center; }

      .word, .frag, .whisper { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; opacity: 0;
        font-weight: 300; }
      .word { font-size: ${T.scale.word}px; letter-spacing: ${T.tracking.word}em; color: ${P.sand}; }
      .frag { font-size: ${T.scale.fragment}px; letter-spacing: ${T.tracking.fragment}em; color: ${P.clay}; }
      .whisper { font-size: ${T.scale.whisper}px; letter-spacing: ${T.tracking.fragment}em; color: ${P.clay}; }
    </style>
  </head>
  <body>
    <div id="stage" class="clip" data-composition-id="main" data-start="0" data-duration="${cutsheet.totalSeconds}"
         data-track-index="0" data-width="${width}" data-height="${height}">
      <div class="scene-content">
        <div id="fall"></div>
        ${networkSvg()}
        <div id="trace"></div>
        ${blocks.join('\n        ')}
        <div id="vig"></div>
        <div id="grain"></div>
      </div>
      ${audioTags}
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      ${tweens.join('\n      ')}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

// A missing token reads as `undefined` here and lands in the timeline as the STRING
// "NaN", which GSAP accepts silently and then animates nothing. Nothing downstream
// would flag it - the render simply comes out missing a layer. Fail loud instead.
const nanCount = (html.match(/NaN/g) ?? []).length;
if (nanCount > 0) {
  console.error(`FAIL - ${nanCount} NaN value(s) in the generated timeline. A token lookup returned undefined.`);
  process.exit(1);
}

const stuck: string[] = [];
enters.forEach((enterTime, sel) => {
  const leaveTime = leaves.get(sel);
  if (leaveTime !== undefined && leaveTime <= enterTime) {
    stuck.push(`${sel}: fades out at ${leaveTime.toFixed(2)}s but only fades in at ${enterTime.toFixed(2)}s`);
  }
});
if (stuck.length) {
  console.error(`FAIL - ${stuck.length} element(s) exit before they enter and would stay on screen for the rest of the film:`);
  for (const s of stuck) console.error(`  x ${s}`);
  process.exit(1);
}

mkdirSync(join(outDir, 'vo'), { recursive: true });
for (const c of voManifest.cues) {
  const src = join(root, 'public', c.src);
  if (existsSync(src)) copyFileSync(src, join(outDir, 'vo', `${c.id}.wav`));
}
writeFileSync(join(outDir, 'index.html'), html);

console.log(`hf/limor/index.html`);
console.log(`  nodes ${NODES.length}  links ${LINKS.length}  blocks ${blocks.length}  tweens ${tweens.length}`);
console.log(`  audio ${voManifest.cues.length} cues  duration ${cutsheet.totalSeconds}s  ${(html.length / 1024).toFixed(0)}KB`);
