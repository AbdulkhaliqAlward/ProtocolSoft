/**
 * Isolation verification (Phase 4 acceptance): the public web service must hold
 * NO PostgreSQL credentials and no Payload/DB imports. Fails the build step when violated.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const BANNED_PATTERNS = [
  /from\s+['"](pg|postgres|@vercel\/postgres|mysql2|mongodb|redis)['"]/i,
  /require\(['"](pg|postgres|mysql2|mongodb|redis)['"]\)/i,
  /from\s+['"]payload['"]/i, // no Payload Local API on the web side
  /createPool|createConnection\(/i,
];
const BANNED_ENV = [/^DATABASE_URI/i, /^POSTGRES_/i, /^PGPASSWORD/i];

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const stat = statSync(p);
    if (stat.isDirectory()) walk(p);
    else if (/\.(m?[jt]sx?)$/.test(name)) files.push(p);
  }
};
walk(join(ROOT, 'src'));

let failures = 0;
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`FAIL: banned import/pattern "${pattern}" in ${file}`);
      failures += 1;
    }
  }
}

const envExample = readFileSync(join(ROOT, '.env.example'), 'utf8');
for (const line of envExample.split('\n')) {
  for (const pattern of BANNED_ENV) {
    if (pattern.test(line)) {
      console.error(`FAIL: database credential variable in web .env.example: ${line.trim()}`);
      failures += 1;
    }
  }
}

console.log(failures === 0 ? 'OK: web service has no database credentials or DB imports' : `${failures} violation(s)`);
process.exit(failures === 0 ? 0 : 1);
