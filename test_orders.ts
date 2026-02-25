import Database from 'better-sqlite3';

const db = new Database('database.sqlite');
try {
  const orders = db.prepare('SELECT * FROM orders').all();
  console.log('Orders:', orders);
} catch (e) {
  console.error(e);
}
