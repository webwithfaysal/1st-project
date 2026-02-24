import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './server/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- Auth Middleware ---
  const authenticate = (role: 'admin' | 'reseller') => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const token = req.cookies.token;
      if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.role !== role) {
          res.status(403).json({ error: 'Forbidden' });
          return;
        }
        (req as any).user = decoded;
        next();
      } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
      }
    };
  };

  // --- API Routes ---

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    let user;
    if (role === 'admin') {
      user = db.prepare('SELECT * FROM admins WHERE email = ?').get(email) as any;
    } else if (role === 'reseller') {
      user = db.prepare('SELECT * FROM resellers WHERE email = ?').get(email) as any;
    } else {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: { ...userWithoutPassword, role } });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      let user;
      if (decoded.role === 'admin') {
        user = db.prepare('SELECT id, name, email FROM admins WHERE id = ?').get(decoded.id) as any;
      } else {
        user = db.prepare('SELECT id, name, email, balance FROM resellers WHERE id = ?').get(decoded.id) as any;
      }
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      res.json({ user: { ...user, role: decoded.role } });
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // --- Admin Routes ---
  app.get('/api/admin/dashboard', authenticate('admin'), (req, res) => {
    const totalSales = (db.prepare('SELECT SUM(admin_price) as total FROM orders WHERE status = "Delivered"').get() as any).total || 0;
    const totalProfit = (db.prepare('SELECT SUM(profit) as total FROM orders WHERE status = "Delivered"').get() as any).total || 0;
    const totalResellers = (db.prepare('SELECT count(*) as count FROM resellers').get() as any).count;
    const pendingWithdrawals = (db.prepare('SELECT count(*) as count FROM withdrawals WHERE status = "Pending"').get() as any).count;
    res.json({ totalSales, totalProfit, totalResellers, pendingWithdrawals });
  });

  app.get('/api/admin/products', authenticate('admin'), (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    res.json(products);
  });

  app.post('/api/admin/products', authenticate('admin'), (req, res) => {
    const { name, description, admin_price, stock, image } = req.body;
    const result = db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(name, description, admin_price, stock, image || 'https://picsum.photos/seed/product/400/400');
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/admin/products/:id', authenticate('admin'), (req, res) => {
    const { name, description, admin_price, stock, image } = req.body;
    db.prepare('UPDATE products SET name = ?, description = ?, admin_price = ?, stock = ?, image = ? WHERE id = ?').run(name, description, admin_price, stock, image, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/admin/products/:id', authenticate('admin'), (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/admin/resellers', authenticate('admin'), (req, res) => {
    const resellers = db.prepare('SELECT id, name, email, balance FROM resellers ORDER BY id DESC').all();
    res.json(resellers);
  });

  app.get('/api/admin/orders', authenticate('admin'), (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, p.name as product_name, r.name as reseller_name 
      FROM orders o 
      JOIN products p ON o.product_id = p.id 
      JOIN resellers r ON o.reseller_id = r.id 
      ORDER BY o.id DESC
    `).all();
    res.json(orders);
  });

  app.put('/api/admin/orders/:id/status', authenticate('admin'), (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;
    
    // Start transaction
    const updateStatus = db.transaction(() => {
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
      if (!order) throw new Error('Order not found');
      
      // If status changes to Delivered and wasn't Delivered before, add profit to reseller
      if (status === 'Delivered' && order.status !== 'Delivered') {
        db.prepare('UPDATE resellers SET balance = balance + ? WHERE id = ?').run(order.profit, order.reseller_id);
      } 
      // If status changes from Delivered to something else, remove profit
      else if (status !== 'Delivered' && order.status === 'Delivered') {
        db.prepare('UPDATE resellers SET balance = balance - ? WHERE id = ?').run(order.profit, order.reseller_id);
      }

      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);
    });

    try {
      updateStatus();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/admin/withdrawals', authenticate('admin'), (req, res) => {
    const withdrawals = db.prepare(`
      SELECT w.*, r.name as reseller_name 
      FROM withdrawals w 
      JOIN resellers r ON w.reseller_id = r.id 
      ORDER BY w.id DESC
    `).all();
    res.json(withdrawals);
  });

  app.put('/api/admin/withdrawals/:id/status', authenticate('admin'), (req, res) => {
    const { status } = req.body;
    const withdrawalId = req.params.id;

    const updateWithdrawal = db.transaction(() => {
      const withdrawal = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(withdrawalId) as any;
      if (!withdrawal) throw new Error('Withdrawal not found');
      if (withdrawal.status !== 'Pending') throw new Error('Withdrawal already processed');

      if (status === 'Approved') {
        // Deduct balance
        const reseller = db.prepare('SELECT balance FROM resellers WHERE id = ?').get(withdrawal.reseller_id) as any;
        if (reseller.balance < withdrawal.amount) throw new Error('Insufficient balance');
        db.prepare('UPDATE resellers SET balance = balance - ? WHERE id = ?').run(withdrawal.amount, withdrawal.reseller_id);
      }

      db.prepare('UPDATE withdrawals SET status = ? WHERE id = ?').run(status, withdrawalId);
    });

    try {
      updateWithdrawal();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Reseller Routes ---
  app.get('/api/reseller/dashboard', authenticate('reseller'), (req, res) => {
    const resellerId = (req as any).user.id;
    const totalSales = (db.prepare('SELECT SUM(reseller_price) as total FROM orders WHERE reseller_id = ? AND status = "Delivered"').get(resellerId) as any).total || 0;
    const totalProfit = (db.prepare('SELECT SUM(profit) as total FROM orders WHERE reseller_id = ? AND status = "Delivered"').get(resellerId) as any).total || 0;
    const balance = (db.prepare('SELECT balance FROM resellers WHERE id = ?').get(resellerId) as any).balance;
    res.json({ totalSales, totalProfit, balance });
  });

  app.get('/api/reseller/products', authenticate('reseller'), (req, res) => {
    const products = db.prepare('SELECT * FROM products WHERE stock > 0 ORDER BY id DESC').all();
    res.json(products);
  });

  app.post('/api/reseller/orders', authenticate('reseller'), (req, res) => {
    const resellerId = (req as any).user.id;
    const { product_id, reseller_price, customer_name, customer_phone, customer_address } = req.body;

    const placeOrder = db.transaction(() => {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id) as any;
      if (!product) throw new Error('Product not found');
      if (product.stock <= 0) throw new Error('Out of stock');
      if (reseller_price < product.admin_price) throw new Error('Reseller price cannot be less than admin price');

      const profit = reseller_price - product.admin_price;

      db.prepare(`
        INSERT INTO orders (reseller_id, product_id, admin_price, reseller_price, profit, customer_name, customer_phone, customer_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(resellerId, product_id, product.admin_price, reseller_price, profit, customer_name, customer_phone, customer_address);

      db.prepare('UPDATE products SET stock = stock - 1 WHERE id = ?').run(product_id);
    });

    try {
      placeOrder();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/reseller/orders', authenticate('reseller'), (req, res) => {
    const resellerId = (req as any).user.id;
    const orders = db.prepare(`
      SELECT o.*, p.name as product_name 
      FROM orders o 
      JOIN products p ON o.product_id = p.id 
      WHERE o.reseller_id = ? 
      ORDER BY o.id DESC
    `).all(resellerId);
    res.json(orders);
  });

  app.get('/api/reseller/withdrawals', authenticate('reseller'), (req, res) => {
    const resellerId = (req as any).user.id;
    const withdrawals = db.prepare('SELECT * FROM withdrawals WHERE reseller_id = ? ORDER BY id DESC').all(resellerId);
    res.json(withdrawals);
  });

  app.post('/api/reseller/withdrawals', authenticate('reseller'), (req, res) => {
    const resellerId = (req as any).user.id;
    const { amount, method, account_number } = req.body;

    if (amount < 500) {
      res.status(400).json({ error: 'Minimum withdraw amount is 500' });
      return;
    }

    const requestWithdrawal = db.transaction(() => {
      const reseller = db.prepare('SELECT balance FROM resellers WHERE id = ?').get(resellerId) as any;
      if (reseller.balance < amount) throw new Error('Insufficient balance');

      db.prepare(`
        INSERT INTO withdrawals (reseller_id, amount, method, account_number)
        VALUES (?, ?, ?, ?)
      `).run(resellerId, amount, method, account_number);
    });

    try {
      requestWithdrawal();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
