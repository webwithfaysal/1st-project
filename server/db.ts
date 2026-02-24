import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('database.sqlite');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS resellers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    admin_price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reseller_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    admin_price REAL NOT NULL,
    reseller_price REAL NOT NULL,
    profit REAL NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reseller_id) REFERENCES resellers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reseller_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    account_number TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reseller_id) REFERENCES resellers(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reseller_id INTEGER NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reseller_id) REFERENCES resellers(id)
  );
`);

// Seed Admin if not exists
const adminCount = db.prepare('SELECT count(*) as count FROM admins').get() as { count: number };
if (adminCount.count === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)').run('Admin', 'admin@example.com', hash);
}

// Seed Reseller if not exists
const resellerCount = db.prepare('SELECT count(*) as count FROM resellers').get() as { count: number };
if (resellerCount.count === 0) {
  const hash = bcrypt.hashSync('reseller123', 10);
  db.prepare('INSERT INTO resellers (name, email, password) VALUES (?, ?, ?)').run('Demo Reseller', 'reseller@example.com', hash);
}

// Seed Products if not exists
const productCount = db.prepare('SELECT count(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(
    'Wireless Earbuds', 'High quality wireless earbuds with active noise cancellation and 24-hour battery life.', 1500, 50, 'https://picsum.photos/seed/earbuds/400/400'
  );
  db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(
    'Smart Watch', 'Fitness tracker and smartwatch with heart rate monitoring and sleep tracking.', 2500, 30, 'https://picsum.photos/seed/watch/400/400'
  );
  db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(
    'Mechanical Keyboard', 'RGB mechanical keyboard with tactile blue switches and aluminum frame.', 3500, 20, 'https://picsum.photos/seed/keyboard/400/400'
  );
  db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(
    'Gaming Mouse', 'Ergonomic gaming mouse with 16000 DPI optical sensor and customizable RGB lighting.', 1200, 45, 'https://picsum.photos/seed/mouse/400/400'
  );
  db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(
    'Portable Power Bank', '20000mAh fast charging power bank with dual USB outputs and USB-C input.', 1800, 60, 'https://picsum.photos/seed/powerbank/400/400'
  );
} else if (productCount.count < 5) {
  try {
    // Only delete if there are no orders referencing them
    const orderCount = db.prepare('SELECT count(*) as count FROM orders').get() as { count: number };
    if (orderCount.count === 0) {
      db.prepare('DELETE FROM products').run();
      db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(
        'Wireless Earbuds', 'High quality wireless earbuds with active noise cancellation and 24-hour battery life.', 1500, 50, 'https://picsum.photos/seed/earbuds/400/400'
      );
      db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(
        'Smart Watch', 'Fitness tracker and smartwatch with heart rate monitoring and sleep tracking.', 2500, 30, 'https://picsum.photos/seed/watch/400/400'
      );
      db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(
        'Mechanical Keyboard', 'RGB mechanical keyboard with tactile blue switches and aluminum frame.', 3500, 20, 'https://picsum.photos/seed/keyboard/400/400'
      );
      db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(
        'Gaming Mouse', 'Ergonomic gaming mouse with 16000 DPI optical sensor and customizable RGB lighting.', 1200, 45, 'https://picsum.photos/seed/mouse/400/400'
      );
      db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(
        'Portable Power Bank', '20000mAh fast charging power bank with dual USB outputs and USB-C input.', 1800, 60, 'https://picsum.photos/seed/powerbank/400/400'
      );
    }
  } catch (e) {
    console.error("Could not re-seed products:", e);
  }
}

export default db;
