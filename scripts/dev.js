/* eslint-disable @typescript-eslint/no-var-requires */

const childProcess = require('child_process');
const argv = process.argv;

const tscOptions = ['-w', '-p', './tsconfig.json'];
const nodemonOptions = ['--watch', './lib', '--nolazy', '-r', 'dotenv/config', './lib/server/src/index.js'];

const nodemonDebugOption = '--inspect=0.0.0.0:9222';

if (argv.includes('--inspect')) {
  nodemonOptions.splice(2, 0, nodemonDebugOption);
}

process.env.NODE_ENV = 'development';

const procs = [];

function spawn(procPath, opts, workingDir) {
  const procPathSplit = procPath.split('/');
  const procName = procPathSplit[procPathSplit.length - 1];

  console.log(`Starting ${procName}...`);

  const proc = childProcess.spawn(procPath, opts, { shell: true, cwd: workingDir || '.' });

  proc.stdout.on('data', data => {
    console.log(`[${procName}] ${data}`);
  });

  proc.stderr.on('data', data => {
    console.error(`[${procName}] ${data}`);
  });

  proc.on('close', () => {
    console.log(`${procName} exited.`);
    process.exit(1);
  });

  procs.push(proc);

  return proc;
}

process.on('exit', () => {
  console.log(`Killing ${procs.length} child processes.`);
  procs.forEach(proc => {
    proc.kill();
  });
});

console.log('Build starting...');

let firstCompilation = false;

spawn('../node_modules/typescript/bin/tsc', tscOptions, './server').stdout.on('data', data => {
  if (!firstCompilation && data.includes('Found 0 errors. Watching for file changes')) {
    firstCompilation = true;

    spawn('../node_modules/nodemon/bin/nodemon.js', nodemonOptions, './server');
  }
});

spawn('./node_modules/.bin/webpack-dev-server', undefined, './client');
