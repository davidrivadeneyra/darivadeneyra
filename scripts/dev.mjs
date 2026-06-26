import { spawn } from 'node:child_process';

const DEV_PORT = '3001';
const incomingArgs = process.argv.slice(2);
const passthroughArgs = [];

for (let index = 0; index < incomingArgs.length; index += 1) {
  const arg = incomingArgs[index];

  if (arg === '--port' || arg === '-p') {
    index += 1;
    continue;
  }

  if (arg.startsWith('--port=')) continue;

  passthroughArgs.push(arg);
}

const processes = [
  spawn('npm', ['run', 'tailwind:watch'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  }),
  spawn('astro', ['dev', '--host', '127.0.0.1', '--port', DEV_PORT, ...passthroughArgs], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })
];

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) child.kill('SIGINT');
  }

  process.exitCode = code;
}

for (const child of processes) {
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    if (code && code !== 0) {
      shutdown(code);
      return;
    }
    if (signal) shutdown(1);
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
