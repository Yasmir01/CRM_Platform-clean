#!/usr/bin/env node
/*
  Rewrite imports like:
    import { A as AIcon, B } from '@mui/icons-material';
  into:
    import AIcon from '@mui/icons-material/A';
    import B from '@mui/icons-material/B';
*/

const fs = require('fs');
const path = require('path');

const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build' || entry.name === '.next') continue;
      walk(full, files);
    } else if (exts.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function transform(content) {
  const importRegex = /import\s*\{([\s\S]*?)\}\s*from\s*['"]@mui\/icons-material['"];?/g;
  let changed = false;
  let result = content;

  result = result.replace(importRegex, (match, specifiersBlock) => {
    const specifiers = specifiersBlock
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (specifiers.length === 0) return match;

    const lines = specifiers.map(spec => {
      const parts = spec.split(/\s+as\s+/i).map(p => p.trim());
      const sourceName = parts[0];
      const localName = parts[1] ? parts[1] : sourceName;
      if (!/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(sourceName) || !/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(localName)) {
        return null;
      }
      return `import ${localName} from '@mui/icons-material/${sourceName}';`;
    });

    if (lines.some(l => l === null)) {
      return match;
    }

    changed = true;
    return lines.join('\n');
  });

  return { content: result, changed, matched: importRegex.test(content) };
}

function run() {
  const projectRoot = process.cwd();
  const srcDir = path.join(projectRoot, 'src');
  if (!fs.existsSync(srcDir)) {
    console.error('src directory not found');
    process.exit(1);
  }

  const files = walk(srcDir);
  let modifiedCount = 0;
  let unmatched = [];

  for (const file of files) {
    let text = fs.readFileSync(file, 'utf8');
    if (text.includes("@mui/icons-material")) {
      const { content: out, changed, matched } = transform(text);
      if (!matched) {
        unmatched.push(path.relative(projectRoot, file));
      }
      if (changed) {
        fs.writeFileSync(file, out, 'utf8');
        modifiedCount++;
        console.log('Transformed:', path.relative(projectRoot, file));
      }
    }
  }

  if (unmatched.length) {
    console.log('Found @mui/icons-material but regex did not match in:\n' + unmatched.join('\n'));
  }

  console.log(`Rewrote imports in ${modifiedCount} files.`);
}

if (require.main === module) {
  run();
}
