const path = require('path');
const fs = require('fs');
const resolve = require('resolve');

const matchAllRequires = require('./matchAllRequires');
const pluckComments = require('./pluckComments');

async function grabFile (fileName, relativeDirectory, entryFile, tree = {}) {
  const filePath = resolve.sync(fileName, {
    includeCoreModules: false,
    basedir: path.resolve(relativeDirectory)
  });

  const relativeFilePath = path.relative(entryFile, filePath);

  if (tree[relativeFilePath]) {
    return tree;
  }

  let content = await fs.promises.readFile(filePath, 'utf8');
  const { commentFreeCode, restoreComments } = pluckComments(content);
  content = commentFreeCode;

  const matches = matchAllRequires(content);

  for (const match of matches) {
    const relativeSubDirectory = path.resolve(relativeDirectory, path.dirname(filePath));
    await grabFile(match[1], relativeSubDirectory, entryFile, tree);

    const absoluteSubPath = resolve.sync(match[1], {
      includeCoreModules: false,
      basedir: relativeSubDirectory
    });
    const relativeSubPath = path.relative(entryFile, path.resolve(absoluteSubPath));
    content = content.replace(match[0], `require('${relativeSubPath}')`);
  }

  content = restoreComments(content);
  tree[relativeFilePath || fileName] = content;

  return tree;
}

module.exports = async entryFile => {
  const fileName = './' + path.relative(path.dirname(entryFile), entryFile);
  const tree = await grabFile(fileName, path.dirname(entryFile), path.resolve(entryFile));

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
