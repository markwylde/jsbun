const fs = require('fs');
const test = require('basictap');

const jsbun = require('../');

test('npm modules work successfully', t => {
  t.plan(1);

  const actual = jsbun('./test/scenarios/npm/index.js');
  const expected = fs.readFileSync('./test/scenarios/npm/expected.min.js', 'utf8');

  t.equal(actual, expected);
});
