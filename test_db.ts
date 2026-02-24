import Database from 'better-sqlite3';

const db = new Database('database.sqlite');
try {
  const info = db.prepare('PRAGMA table_info(messages)').all();
  console.log('Messages table info:', info);
} catch (e) {
  console.error(e);
}
