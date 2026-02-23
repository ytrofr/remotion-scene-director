const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

// Accept CLI argument or find most recent mp4 in out/
const inputArg = process.argv[2];
let inputFile;

if (inputArg) {
  inputFile = path.resolve(inputArg);
} else {
  const mp4Files = fs
    .readdirSync(outDir)
    .filter((f) => f.endsWith('.mp4') && !f.endsWith('-2x.mp4'))
    .map((f) => ({ name: f, mtime: fs.statSync(path.join(outDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  if (mp4Files.length === 0) {
    console.error('No mp4 files found in out/ directory');
    process.exit(1);
  }
  inputFile = path.join(outDir, mp4Files[0].name);
}

const parsed = path.parse(inputFile);
const outputFile = path.join(parsed.dir, `${parsed.name}-2x${parsed.ext}`);

// Find ffmpeg: system first, then Remotion's bundled version
let ffmpeg = 'ffmpeg';
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch {
  const remotionFfmpeg = path.join(
    __dirname,
    '..',
    'node_modules',
    '@remotion',
    'compositor-linux-x64-gnu',
    'ffmpeg',
  );
  if (fs.existsSync(remotionFfmpeg)) {
    ffmpeg = remotionFfmpeg;
    console.log('Using Remotion bundled ffmpeg');
  } else {
    console.error('No ffmpeg found (system or Remotion bundled)');
    process.exit(1);
  }
}

console.log(`Input:  ${inputFile}`);
console.log(`Output: ${outputFile}`);
console.log('Rendering 2x speed version...');

// Use simple 2x speed without minterpolate blending.
// mi_mode=blend creates ghost frames at scene boundaries by averaging
// adjacent frames — causes visible artifacts (double hands, overlapping titles).
// Plain setpts=0.5*PTS is clean: no ghosting, no blending artifacts.
const cmd = `"${ffmpeg}" -y -i "${inputFile}" -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" -r 30 "${outputFile}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log(`Done! 2x version saved to ${outputFile}`);
} catch (err) {
  console.error('ffmpeg failed:', err.message);
  process.exit(1);
}
