import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const watchedPaths = [
  'tailwind.config.mjs',
  'src/styles/input.css',
  'src'
];

let lastSignature = '';
let building = false;
let pending = false;

async function collectFiles(target) {
  const absolutePath = path.join(root, target);
  const entry = await stat(absolutePath).catch(() => null);

  if (!entry) return [];
  if (entry.isFile()) return [absolutePath];

  const children = await readdir(absolutePath, { withFileTypes: true });
  const files = await Promise.all(children.map((child) => {
    const relativeChild = path.join(target, child.name);
    return child.isDirectory() ? collectFiles(relativeChild) : [path.join(root, relativeChild)];
  }));

  return files.flat();
}

async function getSignature() {
  const files = (await Promise.all(watchedPaths.map(collectFiles))).flat();
  const stats = await Promise.all(files.map(async (file) => {
    const fileStat = await stat(file);
    return `${file}:${fileStat.mtimeMs}:${fileStat.size}`;
  }));

  return stats.sort().join('|');
}

function runTailwindBuild() {
  if (building) {
    pending = true;
    return;
  }

  building = true;
  const child = spawn('npm', ['run', 'tailwind:build'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  child.on('exit', (code) => {
    building = false;
    if (code !== 0) {
      console.error(`tailwind build exited with code ${code}`);
    }

    if (pending) {
      pending = false;
      runTailwindBuild();
    }
  });
}

async function tick() {
  const signature = await getSignature();
  if (!lastSignature) {
    lastSignature = signature;
    return;
  }

  if (signature !== lastSignature) {
    lastSignature = signature;
    runTailwindBuild();
  }
}

console.log('Watching Tailwind inputs...');
setInterval(() => {
  tick().catch((error) => console.error(error));
}, 500);
