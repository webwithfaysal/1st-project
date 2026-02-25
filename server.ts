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
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, referral_code } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    const registerUser = db.transaction(() => {
      let referredBy = null;
      if (referral_code) {
        const referrer = db.prepare('SELECT id FROM resellers WHERE referral_code = ?').get(referral_code) as any;
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      const hash = bcrypt.hashSync(password, 10);
      let newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      // Ensure uniqueness
      while (db.prepare('SELECT id FROM resellers WHERE referral_code = ?').get(newReferralCode)) {
        newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      }

      const result = db.prepare('INSERT INTO resellers (name, email, password, referral_code, referred_by) VALUES (?, ?, ?, ?, ?)').run(name, email, hash, newReferralCode, referredBy);
      const newResellerId = result.lastInsertRowid;

      if (referredBy) {
        const bonusType = (db.prepare("SELECT value FROM settings WHERE key = 'referral_bonus_type'").get() as any)?.value || 'fixed';
        const bonusAmount = parseFloat((db.prepare("SELECT value FROM settings WHERE key = 'referral_bonus_amount'").get() as any)?.value || '0');
        
        if (bonusType === 'fixed' && bonusAmount > 0) {
          db.prepare('UPDATE resellers SET balance = balance + ? WHERE id = ?').run(bonusAmount, referredBy);
          db.prepare('INSERT INTO referral_earnings (referrer_id, referred_id, amount, type) VALUES (?, ?, ?, ?)').run(referredBy, newResellerId, bonusAmount, 'registration');
        }
      }
      return newResellerId;
    });

    try {
      const newId = registerUser();
      res.json({ success: true, id: newId });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  });

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
    const totalSales = (db.prepare('SELECT SUM(admin_price) as total FROM orders WHERE status != "Cancelled"').get() as any).total || 0;
    const totalProfit = (db.prepare('SELECT SUM(profit) as total FROM orders WHERE status != "Cancelled"').get() as any).total || 0;
    const totalResellers = (db.prepare('SELECT count(*) as count FROM resellers').get() as any).count;
    const pendingWithdrawals = (db.prepare('SELECT count(*) as count FROM withdrawals WHERE status = "Pending"').get() as any).count;
    const pendingOrders = (db.prepare('SELECT count(*) as count FROM orders WHERE status = "Pending"').get() as any).count;
    res.json({ totalSales, totalProfit, totalResellers, pendingWithdrawals, pendingOrders });
  });

  app.get('/api/admin/products', authenticate('admin'), (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    res.json(products);
  });

  app.post('/api/admin/products', authenticate('admin'), (req, res) => {
    try {
      const { name, description, admin_price, stock, image } = req.body;
      const result = db.prepare('INSERT INTO products (name, description, admin_price, stock, image) VALUES (?, ?, ?, ?, ?)').run(name, description, Number(admin_price) || 0, Number(stock) || 0, image || 'https://picsum.photos/seed/product/400/400');
      res.json({ id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/admin/products/:id', authenticate('admin'), (req, res) => {
    try {
      const { name, description, admin_price, stock, image } = req.body;
      db.prepare('UPDATE products SET name = ?, description = ?, admin_price = ?, stock = ?, image = ? WHERE id = ?').run(name, description, Number(admin_price) || 0, Number(stock) || 0, image, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
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
      
      const reseller = db.prepare('SELECT referred_by FROM resellers WHERE id = ?').get(order.reseller_id) as any;
      const referredBy = reseller?.referred_by;

      const bonusType = (db.prepare("SELECT value FROM settings WHERE key = 'referral_bonus_type'").get() as any)?.value || 'fixed';
      const bonusAmount = parseFloat((db.prepare("SELECT value FROM settings WHERE key = 'referral_bonus_amount'").get() as any)?.value || '0');

      // If status changes to Delivered and wasn't Delivered before, add profit to reseller
      if (status === 'Delivered' && order.status !== 'Delivered') {
        db.prepare('UPDATE resellers SET balance = balance + ? WHERE id = ?').run(order.profit, order.reseller_id);
        
        // Handle percentage referral bonus
        if (referredBy && bonusType === 'percentage' && bonusAmount > 0) {
          const referralBonus = (order.profit * bonusAmount) / 100;
          db.prepare('UPDATE resellers SET balance = balance + ? WHERE id = ?').run(referralBonus, referredBy);
          db.prepare('INSERT INTO referral_earnings (referrer_id, referred_id, amount, type) VALUES (?, ?, ?, ?)').run(referredBy, order.reseller_id, referralBonus, 'order_profit');
        }
      } 
      // If status changes from Delivered to something else, remove profit
      else if (status !== 'Delivered' && order.status === 'Delivered') {
        db.prepare('UPDATE resellers SET balance = balance - ? WHERE id = ?').run(order.profit, order.reseller_id);
        
        // Revert percentage referral bonus
        if (referredBy && bonusType === 'percentage' && bonusAmount > 0) {
          const referralBonus = (order.profit * bonusAmount) / 100;
          db.prepare('UPDATE resellers SET balance = balance - ? WHERE id = ?').run(referralBonus, referredBy);
          // We could delete or add a negative entry in referral_earnings, but keeping it simple for now
          db.prepare('INSERT INTO referral_earnings (referrer_id, referred_id, amount, type) VALUES (?, ?, ?, ?)').run(referredBy, order.reseller_id, -referralBonus, 'order_profit_revert');
        }
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

  // --- Admin Settings ---
  app.get('/api/admin/settings', authenticate('admin'), (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.put('/api/admin/settings', authenticate('admin'), (req, res) => {
    const { referral_bonus_type, referral_bonus_amount } = req.body;
    const updateSettings = db.transaction(() => {
      if (referral_bonus_type !== undefined) {
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('referral_bonus_type', String(referral_bonus_type));
      }
      if (referral_bonus_amount !== undefined) {
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('referral_bonus_amount', String(referral_bonus_amount));
      }
    });
    try {
      updateSettings();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Reseller Routes ---
  app.get('/api/reseller/dashboard', authenticate('reseller'), (req, res) => {
    const resellerId = (req as any).user.id;
    const totalSales = (db.prepare('SELECT SUM(reseller_price) as total FROM orders WHERE reseller_id = ? AND status != "Cancelled"').get(resellerId) as any).total || 0;
    const totalProfit = (db.prepare('SELECT SUM(profit) as total FROM orders WHERE reseller_id = ? AND status != "Cancelled"').get(resellerId) as any).total || 0;
    const balance = (db.prepare('SELECT balance FROM resellers WHERE id = ?').get(resellerId) as any).balance;
    const pendingOrders = (db.prepare('SELECT count(*) as count FROM orders WHERE reseller_id = ? AND status = "Pending"').get(resellerId) as any).count;
    res.json({ totalSales, totalProfit, balance, pendingOrders });
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

  // --- Reseller Affiliate ---
  app.get('/api/reseller/affiliate', authenticate('reseller'), (req, res) => {
    const resellerId = (req as any).user.id;
    
    // Ensure reseller has a referral code
    let reseller = db.prepare('SELECT referral_code FROM resellers WHERE id = ?').get(resellerId) as any;
    if (!reseller.referral_code) {
      let newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      while (db.prepare('SELECT id FROM resellers WHERE referral_code = ?').get(newReferralCode)) {
        newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      }
      db.prepare('UPDATE resellers SET referral_code = ? WHERE id = ?').run(newReferralCode, resellerId);
      reseller.referral_code = newReferralCode;
    }

    const earnings = db.prepare('SELECT SUM(amount) as total FROM referral_earnings WHERE referrer_id = ?').get(resellerId) as any;
    const referredUsers = db.prepare('SELECT id, name, email FROM resellers WHERE referred_by = ?').all(resellerId);
    
    res.json({
      referral_code: reseller.referral_code,
      total_earnings: earnings.total || 0,
      referred_users: referredUsers
    });
  });

  // --- Messaging API ---

  // Admin: Get all resellers with their last message and unread count
  app.get('/api/admin/messages/conversations', authenticate('admin'), (req, res) => {
    const conversations = db.prepare(`
      SELECT r.id, r.name, r.email,
             (SELECT content FROM messages m WHERE m.reseller_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM messages m WHERE m.reseller_id = r.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
             (SELECT COUNT(*) FROM messages m WHERE m.reseller_id = r.id AND m.sender = 'reseller' AND m.is_read = 0) as unread_count
      FROM resellers r
      ORDER BY last_message_time DESC NULLS LAST, r.name ASC
    `).all();
    res.json(conversations);
  });

  // Admin: Get messages for a specific reseller
  app.get('/api/admin/messages/:resellerId', authenticate('admin'), (req, res) => {
    const messages = db.prepare('SELECT * FROM messages WHERE reseller_id = ? ORDER BY created_at ASC').all(req.params.resellerId);
    res.json(messages);
  });

  // Admin: Send a message to a reseller
  app.post('/api/admin/messages/:resellerId', authenticate('admin'), (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const result = db.prepare('INSERT INTO messages (reseller_id, sender, content) VALUES (?, ?, ?)').run(req.params.resellerId, 'admin', content);
    res.json({ id: result.lastInsertRowid });
  });

  // Admin: Mark messages from a reseller as read
  app.put('/api/admin/messages/:resellerId/read', authenticate('admin'), (req, res) => {
    db.prepare('UPDATE messages SET is_read = 1 WHERE reseller_id = ? AND sender = "reseller"').run(req.params.resellerId);
    res.json({ success: true });
  });

  // Reseller: Get messages
  app.get('/api/reseller/messages', authenticate('reseller'), (req, res) => {
    const resellerId = (req as any).user.id;
    const messages = db.prepare('SELECT * FROM messages WHERE reseller_id = ? ORDER BY created_at ASC').all(resellerId);
    res.json(messages);
  });

  // Reseller: Send a message to admin
  app.post('/api/reseller/messages', authenticate('reseller'), (req, res) => {
    const resellerId = (req as any).user.id;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const result = db.prepare('INSERT INTO messages (reseller_id, sender, content) VALUES (?, ?, ?)').run(resellerId, 'reseller', content);
    res.json({ id: result.lastInsertRowid });
  });

  // Reseller: Mark messages from admin as read
  app.put('/api/reseller/messages/read', authenticate('reseller'), (req, res) => {
    const resellerId = (req as any).user.id;
    db.prepare('UPDATE messages SET is_read = 1 WHERE reseller_id = ? AND sender = "admin"').run(resellerId);
    res.json({ success: true });
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
