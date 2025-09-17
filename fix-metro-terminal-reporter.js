const fs = require('fs');
const path = require('path');

function log(msg) {
  console.log(`[fix-metro-terminal-reporter] ${msg}`);
}

(function main() {
  try {
    const metroPkgPath = path.join(process.cwd(), 'node_modules', 'metro', 'package.json');
    if (!fs.existsSync(metroPkgPath)) {
      log('metro/package.json not found. Make sure dependencies are installed first.');
      return;
    }

    const pkgRaw = fs.readFileSync(metroPkgPath, 'utf8');
    let pkg;
    try {
      pkg = JSON.parse(pkgRaw);
    } catch (e) {
      log('Failed to parse metro/package.json');
      return;
    }

    const metroRoot = path.dirname(metroPkgPath);

    const candidateFiles = [
      './src/lib/TerminalReporter.js',
      './src/lib/TerminalReporter/index.js',
      './src/lib/TerminalReporter.cjs',
    ];

    let targetExport;
    for (const rel of candidateFiles) {
      const abs = path.join(metroRoot, rel);
      if (fs.existsSync(abs)) {
        targetExport = rel;
        break;
      }
    }

    if (!targetExport) {
      log('No TerminalReporter implementation found inside metro. Nothing to patch.');
      return;
    }

    const exportsField = pkg.exports ?? {};

    const subpath = './src/lib/TerminalReporter';

    if (exportsField[subpath] === targetExport) {
      log(`Already patched: exports["${subpath}"] -> ${targetExport}`);
      return;
    }

    // Preserve other exports; just add our mapping.
    exportsField[subpath] = targetExport;
    pkg.exports = exportsField;

    fs.writeFileSync(metroPkgPath, JSON.stringify(pkg, null, 2));
    log(`Patched metro exports: ${subpath} -> ${targetExport}`);
    log('You can now re-run: expo start (or bun expo start)');
  } catch (err) {
    log(`Error: ${err?.message ?? String(err)}`);
  }
})();
