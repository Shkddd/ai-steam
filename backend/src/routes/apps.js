const express = require('express');
const db = require('../models/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, (req, res) => {
  try {
    const { category, search, sort = 'downloads', limit = 20, offset = 0 } = req.query;
    let query = `SELECT a.*, u.name as developer_name FROM apps a JOIN users u ON a.developer_id = u.id WHERE a.status = 'published'`;
    const params = [];

    if (category && category !== 'all') { query += ' AND a.category = ?'; params.push(category); }
    if (search) { query += ' AND (a.name LIKE ? OR a.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    
    query += ` ORDER BY a.${['downloads', 'rating', 'created_at'].includes(sort) ? sort : 'downloads'} DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const apps = db.prepare(query).all(...params);
    const result = apps.map(app => ({ ...app, screenshots: JSON.parse(app.screenshots || '[]'), features: JSON.parse(app.features || '[]'), tags: JSON.parse(app.tags || '[]'), is_free: Boolean(app.is_free) }));
    res.json({ apps: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get apps' });
  }
});

router.get('/meta/featured', (req, res) => {
  try {
    const parseApp = (app) => ({ ...app, screenshots: JSON.parse(app.screenshots || '[]'), features: JSON.parse(app.features || '[]'), tags: JSON.parse(app.tags || '[]'), is_free: Boolean(app.is_free) });
    const popular = db.prepare('SELECT a.*, u.name as developer_name FROM apps a JOIN users u ON a.developer_id = u.id WHERE a.status = ? ORDER BY a.downloads DESC LIMIT 5').all('published').map(parseApp);
    const newest = db.prepare('SELECT a.*, u.name as developer_name FROM apps a JOIN users u ON a.developer_id = u.id WHERE a.status = ? ORDER BY a.created_at DESC LIMIT 5').all('published').map(parseApp);
    res.json({ popular, newest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get featured' });
  }
});

router.get('/:id', optionalAuth, (req, res) => {
  try {
    const app = db.prepare('SELECT a.*, u.name as developer_name FROM apps a JOIN users u ON a.developer_id = u.id WHERE a.id = ?').get(req.params.id);
    if (!app) return res.status(404).json({ error: 'App not found' });
    const result = { ...app, screenshots: JSON.parse(app.screenshots || '[]'), features: JSON.parse(app.features || '[]'), tags: JSON.parse(app.tags || '[]'), is_free: Boolean(app.is_free) };
    res.json({ app: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get app' });
  }
});

module.exports = router;
