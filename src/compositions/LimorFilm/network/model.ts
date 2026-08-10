import { mulberry32, tokens } from '../timing';

/**
 * The knowledge network.
 *
 * The brief's rule: fragments begin as separate points, then remember, reconnect and
 * organise themselves - like roots, mycelium and leaf veins. Never circuit traces.
 *
 * Two properties make that read as growth rather than as a diagram:
 *   1. Links are born in BREADTH-FIRST order from the single seed point, so pathways
 *      genuinely spread outward from the light rather than popping in at random.
 *   2. Every link is a curve, bowed perpendicular to its own chord. Straight segments
 *      between nodes is what a circuit board looks like.
 *
 * Everything here is deterministic - seeded PRNG only, no Math.random - because both
 * tournament arms must produce the identical structure or the comparison is void.
 */

const { width, height } = tokens.canvas;
const NET = tokens.network;

export type Node = {
  i: number;
  x: number;
  y: number;
  r: number;
  phase: number;
  depth: number;
};

export type Link = {
  a: number;
  b: number;
  /** Position in the breadth-first growth order, 0..1. */
  order: number;
  /** Perpendicular bow of the control point, in px. Signed. */
  bow: number;
  w: number;
};

const NODE_COUNT = 64;
const SEED = { x: width * 0.5, y: height * 0.52 };

/**
 * Nodes sit on a jittered set of rings around the seed. Rings give the structure a
 * centre to grow from; the jitter keeps it off any visible grid.
 */
const placeNodes = (rand: () => number): Node[] => {
  const nodes: Node[] = [
    { i: 0, x: SEED.x, y: SEED.y, r: 3.2, phase: 0, depth: 0 },
  ];

  for (let i = 1; i < NODE_COUNT; i++) {
    const ring = Math.floor((i - 1) / 12) + 1;
    const perRing = 12;
    const slot = (i - 1) % perRing;
    const angle = (slot / perRing) * Math.PI * 2 + rand() * 0.55 + ring * 0.7;
    const radius = ring * 118 + (rand() - 0.5) * 96;

    nodes.push({
      i,
      x: SEED.x + Math.cos(angle) * radius * 1.42,
      y: SEED.y + Math.sin(angle) * radius * 0.92,
      r: NET.particleRadius[0] + rand() * (NET.particleRadius[1] - NET.particleRadius[0]),
      phase: rand() * Math.PI * 2,
      depth: Infinity,
    });
  }
  return nodes;
};

const dist = (a: Node, b: Node) => Math.hypot(a.x - b.x, a.y - b.y);

/** Candidate edges: each node reaches to its nearest few neighbours within range. */
const candidateEdges = (nodes: Node[]): [number, number][] => {
  const seen = new Set<string>();
  const edges: [number, number][] = [];

  for (const n of nodes) {
    const near = nodes
      .filter((m) => m.i !== n.i && dist(n, m) < NET.maxLinkDistance)
      .sort((p, q) => dist(n, p) - dist(n, q))
      .slice(0, 3);

    for (const m of near) {
      const key = n.i < m.i ? `${n.i}-${m.i}` : `${m.i}-${n.i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([n.i, m.i]);
    }
  }
  return edges;
};

/**
 * Breadth-first from the seed. The returned order is the sequence in which pathways
 * appear, so growth radiates outward instead of filling in arbitrarily.
 */
const growthOrder = (nodes: Node[], edges: [number, number][]): Link[] => {
  const adjacency = new Map<number, number[]>();
  for (const [a, b] of edges) {
    if (!adjacency.has(a)) adjacency.set(a, []);
    if (!adjacency.has(b)) adjacency.set(b, []);
    adjacency.get(a)!.push(b);
    adjacency.get(b)!.push(a);
  }

  const visited = new Set<number>([0]);
  nodes[0].depth = 0;
  const ordered: [number, number][] = [];
  let layer = [0];

  while (layer.length) {
    const next: number[] = [];
    for (const a of layer) {
      for (const b of adjacency.get(a) ?? []) {
        if (visited.has(b)) continue;
        visited.add(b);
        nodes[b].depth = nodes[a].depth + 1;
        ordered.push([a, b]);
        next.push(b);
      }
    }
    layer = next;
  }

  // Cross-links close the loops. They arrive last, which is what turns a spreading
  // tree into a coherent web - the "fragmentation to intelligence" move.
  const inTree = new Set(ordered.map(([a, b]) => `${a}-${b}`));
  for (const [a, b] of edges) {
    if (!inTree.has(`${a}-${b}`) && !inTree.has(`${b}-${a}`)) ordered.push([a, b]);
  }

  const rand = mulberry32(0x5eed);
  return ordered.map(([a, b], idx) => ({
    a,
    b,
    order: idx / (ordered.length - 1),
    bow: (rand() - 0.5) * 2 * NET.linkCurvature * dist(nodes[a], nodes[b]),
    w: NET.linkWidth[0] + rand() * (NET.linkWidth[1] - NET.linkWidth[0]),
  }));
};

export const NODES: Node[] = placeNodes(mulberry32(0x1170a));
export const LINKS: Link[] = growthOrder(NODES, candidateEdges(NODES));

/** Node drift. Small, slow, never enough to read as motion for its own sake. */
export const drift = (n: Node, frame: number) => {
  const t = (frame / NET.driftPeriodFrames) * Math.PI * 2;
  return {
    x: n.x + Math.sin(t + n.phase) * NET.driftAmplitude,
    y: n.y + Math.cos(t * 0.73 + n.phase) * NET.driftAmplitude * 0.7,
  };
};

/** Quadratic bezier bowed perpendicular to the chord - a vein, not a wire. */
export const linkPath = (
  ax: number, ay: number, bx: number, by: number, bow: number,
) => {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return `M ${ax.toFixed(2)} ${ay.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)}`;
};
