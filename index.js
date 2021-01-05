const path = require('path');
const fs = require('fs');
const resolve = require('resolve');

const matchAllRequires = require('./matchAllRequires');

function grabFile (fileName, relativeDirectory, entryFile, tree = {}) {
  if (tree[fileName]) {
    return tree;
  }

  const filePath = resolve.sync(fileName, {
    includeCoreModules: false,
    basedir: path.resolve(relativeDirectory)
  });

  const relativeFilePath = path.relative(entryFile, filePath);

  let content = fs.readFileSync(filePath, 'utf8');

  const matches = matchAllRequires(content);

  for (const match of matches) {
    const relativeSubDirectory = path.resolve(relativeDirectory, path.dirname(filePath));
    grabFile(match[1], relativeSubDirectory, entryFile, tree);

    const absoluteSubPath = resolve.sync(match[1], {
      includeCoreModules: false,
      basedir: relativeSubDirectory
    });
    const relativeSubPath = path.relative(entryFile, path.resolve(absoluteSubPath));
    content = content.replace(match[0], `require('${relativeSubPath}')`);
  }

  tree[relativeFilePath || fileName] = content;

  return tree;
}

module.exports = entryFile => {
  const fileName = './' + path.relative(path.dirname(entryFile), entryFile);
  const tree = grabFile(fileName, path.dirname(entryFile), path.resolve(entryFile));

  let bundled = '';

  Object.keys(tree).forEach(key => {
    bundled = bundled + '\n' + `  "${key}": function (require,module,exports) {\n${tree[key]}\n},`;
  });

  return [
    "var global = (typeof self === 'object' && self.self === self && self) ||",
    "(typeof global === 'object' && global.global === global && global) ||",
    'this',
    'var instances = {}',
    'var modules = {',
    `  ${bundled}`,
    '};',
    '',
    'function require (filename) {',
    '  if (instances[filename]) {',
    '    return instances[filename]',
    '  }',
    '',
    '  var module = { exports: {} };',
    ' ',
    '  modules[filename](require, module, module.exports);',
    '',
    '  instances[filename] = module.exports;',
    '',
    '  return instances[filename];',
    '}',

    `require('${fileName}');`
  ].join('\n');
};
