const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing required fields' });
    
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)').run(userId, email, hashedPassword, name);

    const user = db.prepare('SELECT id, email, name, avatar, is_developer, created_at FROM users WHERE id = ?').get(userId);
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const { password: _, ...userInfo } = user;
    res.json({ user: userInfo, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, name, avatar, is_developer, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

router.put('/me', authMiddleware, (req, res) => {
  const { name, avatar } = req.body;
  const updates = [];
  const values = [];
  if (name) { updates.push('name = ?'); values.push(name); }
  if (avatar) { updates.push('avatar = ?'); values.push(avatar); }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(Date.now());
  values.push(req.user.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`).run(...values);
  const user = db.prepare('SELECT id, email, name, avatar, is_developer, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

module.exports = router;
