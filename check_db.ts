import Database from 'better-sqlite3';

const db = new Database('database.sqlite');
const count = db.prepare('SELECT count(*) as count FROM products').get() as { count: number };
console.log('Product count:', count.count);

if (count.count < 5) {
  try {
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
    console.log('Inserted 5 products');
  } catch (e) {
    console.error(e);
  }
}
