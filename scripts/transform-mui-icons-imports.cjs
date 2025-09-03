#!/usr/bin/env node
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
  const re = /import\s*\{([^}]*)\}\s*from\s*["']@mui\/icons-material["']/gm;
  const before = content;
  const after = content.replace(re, (_, block) => {
    const specifiers = block.split(',').map(s => s.trim()).filter(Boolean);
    if (specifiers.length === 0) return _;
    const lines = specifiers.map(spec => {
      const parts = spec.split(/\s+as\s+/i).map(p => p.trim());
      const sourceName = parts[0];
      const localName = parts[1] ? parts[1] : sourceName;
      if (!/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(sourceName) || !/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(localName)) {
        return null;
      }
      return `import ${localName} from '@mui/icons-material/${sourceName}';`;
    });
    if (lines.some(l => l === null)) return _;
    return lines.join('\n');
  });
  return { content: after, changed: after !== before };
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
    const text = fs.readFileSync(file, 'utf8');
    if (!text.includes("@mui/icons-material")) continue;
    const { content: out, changed } = transform(text);
    if (changed) {
      fs.writeFileSync(file, out, 'utf8');
      modifiedCount++;
      console.log('Transformed:', path.relative(projectRoot, file));
    }
  }
  console.log(`Rewrote imports in ${modifiedCount} files.`);
}

if (require.main === module) run();
