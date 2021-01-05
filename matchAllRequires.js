function matchAllRequires (code) {
  return code.matchAll(/require\s*\(["'](.*)["']\)/mg);
}

module.exports = matchAllRequires;
