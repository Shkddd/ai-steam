const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function developerMiddleware(req, res, next) {
  if (!req.user.is_developer) return res.status(403).json({ error: 'Developer access required' });
  next();
}

router.get('/apps', authMiddleware, developerMiddleware, (req, res) => {
  const apps = db.prepare('SELECT * FROM apps WHERE developer_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ apps: apps.map(a => ({ ...a, screenshots: JSON.parse(a.screenshots || '[]'), features: JSON.parse(a.features || '[]'), tags: JSON.parse(a.tags || '[]'), is_free: Boolean(a.is_free) })) });
});

router.get('/stats', authMiddleware, developerMiddleware, (req, res) => {
  const appCount = db.prepare('SELECT COUNT(*) as count FROM apps WHERE developer_id = ?').get(req.user.id);
  const totalDownloads = db.prepare('SELECT SUM(downloads) as total FROM apps WHERE developer_id = ?').get(req.user.id);
  const avgRating = db.prepare('SELECT AVG(rating) as avg FROM apps WHERE developer_id = ?').get(req.user.id);
  res.json({ total_apps: appCount.count, total_downloads: totalDownloads.total || 0, average_rating: avgRating.avg ? avgRating.avg.toFixed(1) : 0 });
});

router.post('/apps', authMiddleware, developerMiddleware, (req, res) => {
  const { name, description, category, icon, features, tags, is_free, price, apk_url, api_url } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Missing required fields' });
  const id = uuidv4();
  db.prepare(`INSERT INTO apps (id, developer_id, name, description, category, icon, screenshots, features, tags, is_free, price, apk_url, api_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.user.id, name, description || '', category, icon || '📦', '[]', JSON.stringify(features || []), JSON.stringify(tags || []), is_free !== false ? 1 : 0, price || 0, apk_url || '', api_url || '', 'pending');
  const app = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);
  res.json({ app: { ...app, screenshots: JSON.parse(app.screenshots || '[]'), features: JSON.parse(app.features || '[]'), tags: JSON.parse(app.tags || '[]'), is_free: Boolean(app.is_free) } });
});

router.put('/apps/:id', authMiddleware, developerMiddleware, (req, res) => {
  const app = db.prepare('SELECT id FROM apps WHERE id = ? AND developer_id = ?').get(req.params.id, req.user.id);
  if (!app) return res.status(404).json({ error: 'App not found' });
  const { name, description, category, icon, features, tags, is_free, price, apk_url, api_url } = req.body;
  const updates = [];
  const values = [];
  if (name) { updates.push('name = ?'); values.push(name); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (category) { updates.push('category = ?'); values.push(category); }
  if (icon) { updates.push('icon = ?'); values.push(icon); }
  if (features) { updates.push('features = ?'); values.push(JSON.stringify(features)); }
  if (tags) { updates.push('tags = ?'); values.push(JSON.stringify(tags)); }
  if (is_free !== undefined) { updates.push('is_free = ?'); values.push(is_free ? 1 : 0); }
  if (price !== undefined) { updates.push('price = ?'); values.push(price); }
  if (apk_url !== undefined) { updates.push('apk_url = ?'); values.push(apk_url); }
  if (api_url !== undefined) { updates.push('api_url = ?'); values.push(api_url); }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(Date.now(), req.params.id);
  db.prepare(`UPDATE apps SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`).run(...values);
  const updatedApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
  res.json({ app: { ...updatedApp, screenshots: JSON.parse(updatedApp.screenshots || '[]'), features: JSON.parse(updatedApp.features || '[]'), tags: JSON.parse(updatedApp.tags || '[]'), is_free: Boolean(updatedApp.is_free) } });
});

router.delete('/apps/:id', authMiddleware, developerMiddleware, (req, res) => {
  const app = db.prepare('SELECT id FROM apps WHERE id = ? AND developer_id = ?').get(req.params.id, req.user.id);
  if (!app) return res.status(404).json({ error: 'App not found' });
  db.prepare('DELETE FROM reviews WHERE app_id = ?').run(req.params.id);
  db.prepare('DELETE FROM favorites WHERE app_id = ?').run(req.params.id);
  db.prepare('DELETE FROM downloads WHERE app_id = ?').run(req.params.id);
  db.prepare('DELETE FROM apps WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
