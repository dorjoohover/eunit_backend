const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  let next = original;

  for (const [searchValue, replaceValue] of replacements) {
    next = next.replace(searchValue, replaceValue);
  }

  if (next === original) {
    return false;
  }

  fs.writeFileSync(filePath, next);
  return true;
}

function patchBufferEqualConstantTime(rootDir) {
  const target = path.join(
    rootDir,
    'node_modules',
    'buffer-equal-constant-time',
    'index.js',
  );

  if (!fs.existsSync(target)) {
    return false;
  }

  const original = fs.readFileSync(target, 'utf8');
  const next = original.replace(
    /var SlowBuffer = require\('buffer'\)\.SlowBuffer;/,
    "var SlowBuffer = require('buffer').SlowBuffer || Buffer;",
  );

  if (next === original) {
    return false;
  }

  fs.writeFileSync(target, next);
  return true;
}

function patchNestCli(rootDir) {
  const abstractRunner = path.join(
    rootDir,
    'node_modules',
    '@nestjs',
    'cli',
    'lib',
    'runners',
    'abstract.runner.js',
  );
  const startAction = path.join(
    rootDir,
    'node_modules',
    '@nestjs',
    'cli',
    'actions',
    'start.action.js',
  );

  const runnerPatched = replaceInFile(abstractRunner, [
    [
      "            shell: true,",
      "            shell: process.platform === 'win32',",
    ],
  ]);

  const startPatched = replaceInFile(startAction, [
    [
      "        outputFilePath =\n            outputFilePath.indexOf(' ') >= 0 ? `\"${outputFilePath}\"` : outputFilePath;\n",
      "        const useShell = process.platform === 'win32';\n        outputFilePath =\n            useShell && outputFilePath.indexOf(' ') >= 0 ? `\"${outputFilePath}\"` : outputFilePath;\n",
    ],
    [
      "            shell: true,",
      "            shell: useShell,",
    ],
  ]);

  return runnerPatched || startPatched;
}

function main() {
  const rootDir = process.cwd();
  const patched = [
    patchBufferEqualConstantTime(rootDir),
    patchNestCli(rootDir),
  ].some(Boolean);

  if (patched) {
    console.log('Applied Node 25 compatibility patches.');
  }
}

main();
