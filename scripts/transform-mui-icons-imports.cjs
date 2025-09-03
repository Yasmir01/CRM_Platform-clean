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
      // skip node_modules and build outputs
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
    // Split by commas, but handle line breaks and extra spaces
    const specifiers = specifiersBlock
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (specifiers.length === 0) return match;

    const lines = specifiers.map(spec => {
      // forms: Name or Name as Alias
      const parts = spec.split(/\s+as\s+/i).map(p => p.trim());
      const sourceName = parts[0];
      const localName = parts[1] ? parts[1] : sourceName;
      // Ensure valid identifiers
      if (!/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(sourceName) || !/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(localName)) {
        // If we can't confidently parse, keep original import
        return null;
      }
      return `import ${localName} from '@mui/icons-material/${sourceName}';`;
    });

    if (lines.some(l => l === null)) {
      return match; // fallback to original if any unparsable
    }

    changed = true;
    return lines.join('\n');
  });

  return { content: result, changed };
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

  for (const file of files) {
    let text = fs.readFileSync(file, 'utf8');
    const { content: out, changed } = transform(text);
    if (changed) {
      fs.writeFileSync(file, out, 'utf8');
      modifiedCount++;
    }
  }

  console.log(`Rewrote imports in ${modifiedCount} files.`);
}

if (require.main === module) {
  run();
}
