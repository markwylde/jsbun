#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const minimist = require('minimist');
const chokidar = require('chokidar');

const jsbun = require('./');

const argv = minimist(process.argv);
const entryFile = argv._[2];

const result = jsbun(entryFile);

const outputFile = argv.o || argv.output;
const outputFilePath = outputFile && path.resolve(outputFile);

function run () {
  if (outputFilePath) {
    fs.writeFileSync(outputFilePath, result);
    console.log('Output successfully written to:', outputFilePath);
  } else {
    console.log(result);
  }
}

const watch = argv.w || argv.watch;

if (watch) {
  if (!outputFilePath) {
    console.log('You must specify an --output (-o) when using --watch (-w) mode');
    process.exit(1);
  }

  chokidar.watch(watch === true ? '**/*.js' : watch, {
    ignored: outputFile
  }).on('change', (path, event) => {
    console.log('detected change', path);
    run();
  });
} else {
  run();
}
