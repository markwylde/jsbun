const path = require('path');
const fs = require('fs');
const resolve = require('resolve');

const matchAllRequires = require('./matchAllRequires');

function grabFile (fileName, relativeDirectory, tree = {}) {
  if (tree[fileName]) {
    return tree;
  }

  const filePath = resolve.sync(fileName, {
    includeCoreModules: false,
    basedir: path.resolve(relativeDirectory)
  });

  const content = fs.readFileSync(filePath, 'utf8');

  const matches = matchAllRequires(content);

  for (const match of matches) {
    grabFile(match[1], path.resolve(relativeDirectory, path.dirname(filePath)), tree);
  }

  tree[fileName] = content;

  return tree;
}

module.exports = entryFile => {
  const fileName = './' + path.relative(path.dirname(entryFile), entryFile);
  const tree = grabFile(fileName, path.dirname(entryFile));

  let bundled = '';

  Object.keys(tree).forEach(key => {
    bundled = bundled + '\n' + `  "${key}": function (require,module,exports) {\n${tree[key]}\n},`;
  });

  return [
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
