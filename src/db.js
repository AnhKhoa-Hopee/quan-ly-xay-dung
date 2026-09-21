import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DB_FILE = join(DATA_DIR, 'db.json');

export const COLLECTIONS = [
  'projects', 'tasks', 'contractors', 'people', 'materials',
  'stockMoves', 'expenses', 'documents', 'issues', 'changeRequests',
];

const EMPTY = Object.fromEntries(COLLECTIONS.map((c) => [c, []]));
let db = null;

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

export function load() {
  if (db) return db;
  ensureDir();
  if (existsSync(DB_FILE)) {
    try { db = JSON.parse(readFileSync(DB_FILE, 'utf8')); }
    catch { db = structuredClone(EMPTY); }
  } else {
    db = structuredClone(EMPTY);
  }
  for (const c of COLLECTIONS) if (!Array.isArray(db[c])) db[c] = [];
  return db;
}

export function save() {
  ensureDir();
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function list(collection) { return load()[collection]; }

export function find(collection, id) {
  return load()[collection].find((r) => String(r.id) === String(id));
}

export function insert(collection, row) {
  const d = load();
  const nums = d[collection].map((r) => Number(String(r.id || '').replace(/\D/g, ''))).filter((n) => n > 0);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  const record = { ...row, id: next, createdAt: row.createdAt || new Date().toISOString() };
  d[collection].push(record);
  save();
  return record;
}

export function update(collection, id, patch) {
  const d = load();
  const idx = d[collection].findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return null;
  d[collection][idx] = { ...d[collection][idx], ...patch, id: d[collection][idx].id };
  save();
  return d[collection][idx];
}

export function remove(collection, id) {
  const d = load();
  const idx = d[collection].findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return false;
  d[collection].splice(idx, 1);
  save();
  return true;
}

export function replaceAll(data) {
  db = { ...structuredClone(EMPTY), ...data };
  for (const c of COLLECTIONS) if (!Array.isArray(db[c])) db[c] = [];
  save();
  return db;
}

export { DB_FILE, DATA_DIR };
