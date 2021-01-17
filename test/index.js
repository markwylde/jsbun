const fs = require('fs');
const test = require('basictap');

const jsbun = require('../');
const matchAllRequires = require('../matchAllRequires');

test('matches single quotes', t => {
  t.plan(2);

  const actual = Array.from(matchAllRequires(`
    require('test');
  `));

  t.equal(actual[0][0], "require('test')");
  t.equal(actual[0][1], 'test');
});

test('matches double quotes', t => {
  t.plan(2);

  const actual = Array.from(matchAllRequires(`
    require("test");
  `));

  t.equal(actual[0][0], 'require("test")');
  t.equal(actual[0][1], 'test');
});

test('matches whitespace', t => {
  t.plan(2);

  const actual = Array.from(matchAllRequires(`
    require ('test');
  `));

  t.equal(actual[0][0], "require ('test')");
  t.equal(actual[0][1], 'test');
});

test('npm modules work successfully', async t => {
  t.plan(1);

  const actual = await jsbun('./test/scenarios/npm/index.js');
  const expected = fs.readFileSync('./test/scenarios/npm/expected.min.js', 'utf8');

  t.equal(actual, expected);
});
