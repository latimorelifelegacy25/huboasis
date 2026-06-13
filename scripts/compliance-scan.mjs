import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BLOCKED_DIRS = new Set(['.git', '.next', 'node_modules', 'dist', 'build']);
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.sql']);
const PROHIBITED = [
  'you qualify',
  'we recommend this product',
  'guaranteed result',
  'you should buy',
  '$X in Agent Commissions',
  '#LatimorOS',
];

function ext(path) {
  const match = path.match(/\.[^.]+$/);
  return match ? match[0] : '';
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (BLOCKED_DIRS.has(entry)) continue;
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) walk(path, files);
    else if (SCAN_EXTENSIONS.has(ext(path))) files.push(path);
  }
  return files;
}

const violations = [];
for (const file of walk(ROOT)) {
  const text = readFileSync(file, 'utf8');
  for (const phrase of PROHIBITED) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) {
      violations.push(`${file.replace(ROOT + '/', '')}: prohibited phrase found -> ${phrase}`);
    }
  }
}

if (violations.length > 0) {
  console.error('Compliance scan failed.');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('Compliance scan passed.');
