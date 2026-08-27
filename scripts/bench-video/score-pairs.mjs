#!/usr/bin/env node
/**
 * Blind, order-swapped pairwise scoring.
 *
 * Three things this does that a side-by-side glance does not:
 *   - hides which arm is which (labels are Left / Right, nothing else)
 *   - shows every pair in BOTH orders, so position bias becomes measurable
 *   - records each vote to a jsonl, so the ranking is reproducible and the next film
 *     can be compared to this one
 *
 * Serves its own MP4s with HTTP Range, because without 206 every seek control on the
 * page is dead and the rater cannot scrub to the moment they are judging.
 *
 *   node scripts/bench-video/score-pairs.mjs [port]
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, appendFileSync, statSync, createReadStream } from 'node:fs';
import { join, extname } from 'node:path';

const PORT = Number(process.argv[2] ?? 8899);
const OUT = 'out';
const VOTES = join(OUT, 'bench-votes.jsonl');
const RUBRIC = JSON.parse(readFileSync('scripts/bench-video/rubric.v1.json', 'utf8'));

/** The arms. `hidden` is what the rater must never see. */
const ARMS = [
  { id: 'v1', file: 'sigma-film-25s.mp4', hidden: 'v1 frozen baseline' },
  { id: 'v1_score', file: 'a0plus-v1-with-score.mp4', hidden: 'v1 + score ONLY (confound control)' },
  { id: 'd1', file: 'd1-inside-the-system.mp4', hidden: 'D1 inside the system' },
  { id: 'd2', file: 'd2-the-product.mp4', hidden: 'D2 the product itself' },
  { id: 'd3', file: 'd3-one-take.mp4', hidden: 'D3 one unbroken take' },
].filter((a) => existsSync(join(OUT, a.file)));

/** Every unordered pair, then BOTH orders of each. Position bias is free to remove. */
const PAIRS = (() => {
  const out = [];
  for (let i = 0; i < ARMS.length; i++)
    for (let j = i + 1; j < ARMS.length; j++) {
      out.push({ left: ARMS[i].id, right: ARMS[j].id });
      out.push({ left: ARMS[j].id, right: ARMS[i].id });
    }
  return out;
})();

const MIME = { '.mp4': 'video/mp4', '.html': 'text/html; charset=utf-8', '.json': 'application/json' };

const page = () => `<!doctype html><meta charset=utf-8><title>Blind scoring</title>
<style>
:root{--void:#070709;--card:#121217;--bd:#26262e;--ink:#fafafa;--dim:#a1a1aa;--v:#8b5cf6;--c:#06b6d4}
*{box-sizing:border-box}body{margin:0;background:var(--void);color:var(--ink);font:15px/1.5 system-ui,sans-serif}
header{padding:18px 26px;border-bottom:1px solid var(--bd);display:flex;gap:20px;align-items:baseline}
h1{margin:0;font-size:17px;font-weight:600}
.sub{color:var(--dim);font-size:13px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:22px 26px}
.cell{background:var(--card);border:1px solid var(--bd);border-radius:12px;overflow:hidden}
.cell h2{margin:0;padding:11px 16px;font-size:13px;letter-spacing:3px;color:var(--dim);font-weight:500;border-bottom:1px solid var(--bd)}
video{width:100%;display:block;background:#000}
.bar{padding:14px 26px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;border-top:1px solid var(--bd)}
button{background:#1b1b22;color:var(--ink);border:1px solid var(--bd);border-radius:8px;padding:9px 15px;font-size:14px;cursor:pointer}
button:hover{border-color:var(--v)}
.win{background:linear-gradient(135deg,var(--v),var(--c));border:0;color:#07070a;font-weight:650;padding:11px 22px}
.rub{padding:0 26px 26px}
table{border-collapse:collapse;width:100%;max-width:900px}
td,th{padding:7px 10px;border-bottom:1px solid var(--bd);font-size:13px;text-align:left}
th{color:var(--dim);font-weight:500}
.sc{display:flex;gap:5px}
.sc button{padding:4px 10px;font-size:13px}
.sc button.on{background:var(--v);border-color:var(--v);color:#07070a}
.done{color:var(--dim);font-size:13px;padding:0 26px 20px}
</style>
<header><h1>Blind pairwise scoring</h1>
<span class=sub id=prog></span>
<span class=sub>labels hidden &middot; every pair shown in both orders</span></header>
<div class=grid>
 <div class=cell><h2>LEFT</h2><video id=L controls preload=metadata></video></div>
 <div class=cell><h2>RIGHT</h2><video id=R controls preload=metadata></video></div>
</div>
<div class=bar>
 <button onclick=both('play')>&#9654; play both</button>
 <button onclick=both('pause')>pause</button>
 <button onclick=seek(0)>restart</button>
 <button onclick=seek(6)>6s morph</button>
 <button onclick=seek(8)>8s agents</button>
 <button onclick=seek(16)>16s numbers</button>
 <button onclick=mute()>mute</button>
 <span style="flex:1"></span>
 <button class=win onclick="vote('left')">LEFT is better</button>
 <button onclick="vote('tie')">tie</button>
 <button class=win onclick="vote('right')">RIGHT is better</button>
</div>
<div class=rub><table id=rub></table>
<p class=sub style="max-width:900px">Scores are optional and say WHY; the ranking comes from the preference buttons.
There is no overall score on purpose - dimensions are never averaged.</p></div>
<div class=done id=done></div>
<script>
const PAIRS=${JSON.stringify(PAIRS)}, ARMS=${JSON.stringify(ARMS.map((a) => ({ id: a.id, file: a.file })))};
const DIMS=${JSON.stringify(RUBRIC.dimensions)}, ANCH=${JSON.stringify(RUBRIC.anchors)};
let i=0, scores={};
const V=()=>[document.getElementById('L'),document.getElementById('R')];
const both=m=>V().forEach(v=>v[m]());
const seek=t=>V().forEach(v=>v.currentTime=t);
const mute=()=>V().forEach(v=>v.muted=!v.muted);
function fileFor(id){return ARMS.find(a=>a.id===id).file}
function load(){
 if(i>=PAIRS.length){document.getElementById('done').textContent='All '+PAIRS.length+' comparisons done. Run: node scripts/bench-video/rank.mjs';return}
 const p=PAIRS[i];
 document.getElementById('L').src=fileFor(p.left);
 document.getElementById('R').src=fileFor(p.right);
 document.getElementById('prog').textContent=(i+1)+' of '+PAIRS.length;
 scores={};render();
}
function render(){
 const t=document.getElementById('rub');
 t.innerHTML='<tr><th>dimension</th><th>the question</th><th>L</th><th>R</th></tr>'+DIMS.map(d=>
  '<tr><td>'+d.label+'</td><td style="color:var(--dim)">'+d.ask+'</td>'+
  ['L','R'].map(s=>'<td><div class=sc>'+[1,2,3,4,5].map(n=>
    '<button title="'+ANCH[n]+'" onclick="setS(\\''+d.id+'\\',\\''+s+'\\','+n+')" id="b'+d.id+s+n+'">'+n+'</button>').join('')+'</div></td>').join('')+'</tr>').join('');
}
function setS(dim,side,n){
 scores[side+'.'+dim]=n;
 [1,2,3,4,5].forEach(k=>{const el=document.getElementById('b'+dim+side+k);if(el)el.className=k===n?'on':''});
}
function vote(w){
 const p=PAIRS[i];
 const winner=w==='tie'?'tie':(w==='left'?p.left:p.right);
 fetch('/vote',{method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify({a:p.left,b:p.right,shownLeft:p.left,winner,scores,rater:'operator'})})
  .then(()=>{i++;load()});
}
load();
</script>`;

createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/vote') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      appendFileSync(VOTES, JSON.stringify({ ...JSON.parse(body), at: null }) + '\n');
      res.writeHead(204).end();
    });
    return;
  }
  const name = req.url === '/' ? null : decodeURIComponent(req.url.slice(1).split('?')[0]);
  if (!name) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page());
    return;
  }
  const path = join(OUT, name);
  if (!existsSync(path) || name.includes('..')) {
    res.writeHead(404).end('not found');
    return;
  }
  const size = statSync(path).size;
  const type = MIME[extname(path)] ?? 'application/octet-stream';
  const range = req.headers.range;
  // 206 or every seek control on the page is dead.
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m[1] ? Number(m[1]) : 0;
    const end = m[2] ? Number(m[2]) : size - 1;
    res.writeHead(206, {
      'content-type': type,
      'accept-ranges': 'bytes',
      'content-range': `bytes ${start}-${end}/${size}`,
      'content-length': end - start + 1,
    });
    createReadStream(path, { start, end }).pipe(res);
    return;
  }
  res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': size });
  createReadStream(path).pipe(res);
}).listen(PORT, () => {
  console.log(`population: ${ARMS.length} arm(s) present, ${PAIRS.length} comparisons (every pair, both orders)`);
  for (const a of ARMS) console.log(`  ${a.id.padEnd(9)} ${a.file}`);
  if (ARMS.length < 2) console.log('\n  NOT ENOUGH ARMS - renders are probably still running.');
  console.log(`\n  http://localhost:${PORT}`);
});
