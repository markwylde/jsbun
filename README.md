# jsbun
An extremely lightweight bundler that does nothing but merge your js files using commonjs.

## Installation
```bash
npm install --save-dev jsbun
```

(or) globally:
```bash
npm install -g jsbun
```

## Example
The best example is the [npm test scenario](test/scenarios/npm) used in this project.

## Usage
### CLI
```bash
jsbun -o bundled.js js/index.js
```

Optional arguments are:

```text
--watch (-w) [pattern]         rerun when the files change (default pattern is '**/*.js')
--output (-o) fileName         output the bundle to a file instead of to stdout
```

### Code
```javascript
const jsbun = require('jsbun');
const bundled = jsbun('./js/index.js');
console.log(bundled);
```
