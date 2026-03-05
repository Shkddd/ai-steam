const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/favorites', authMiddleware, (req, res) => {
  const favorites = db.prepare(`SELECT a.*, f.created_at as favorited_at FROM favorites f JOIN apps a ON f.app_id = a.id WHERE f.user_id = ? ORDER BY f.created_at DESC`).all(req.user.id);
  res.json({ favorites: favorites.map(a => ({ ...a, screenshots: JSON.parse(a.screenshots || '[]'), features: JSON.parse(a.features || '[]'), tags: JSON.parse(a.tags || '[]'), is_free: Boolean(a.is_free), is_favorited: true })) });
});

router.post('/favorites', authMiddleware, (req, res) => {
  const { appId } = req.body;
  if (!appId) return res.status(400).json({ error: 'Missing appId' });
  const id = uuidv4();
  try {
    db.prepare('INSERT INTO favorites (id, user_id, app_id) VALUES (?, ?, ?)').run(id, req.user.id, appId);
    res.json({ success: true });
  } catch { res.status(400).json({ error: 'Already favorited' }); }
});

router.delete('/favorites/:appId', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND app_id = ?').run(req.user.id, req.params.appId);
  res.json({ success: true });
});

router.get('/downloads', authMiddleware, (req, res) => {
  const downloads = db.prepare(`SELECT a.*, d.created_at as downloaded_at FROM downloads d JOIN apps a ON d.app_id = a.id WHERE d.user_id = ? ORDER BY d.created_at DESC`).all(req.user.id);
  res.json({ downloads: downloads.map(a => ({ ...a, screenshots: JSON.parse(a.screenshots || '[]'), features: JSON.parse(a.features || '[]'), tags: JSON.parse(a.tags || '[]'), is_free: Boolean(a.is_free), is_downloaded: true })) });
});

router.post('/downloads', authMiddleware, (req, res) => {
  const { appId } = req.body;
  if (!appId) return res.status(400).json({ error: 'Missing appId' });
  const app = db.prepare('SELECT id, downloads, apk_url, api_url FROM apps WHERE id = ?').get(appId);
  if (!app) return res.status(404).json({ error: 'App not found' });
  const existing = db.prepare('SELECT id FROM downloads WHERE user_id = ? AND app_id = ?').get(req.user.id, appId);
  if (!existing) {
    db.prepare('INSERT INTO downloads (id, user_id, app_id) VALUES (?, ?, ?)').run(uuidv4(), req.user.id, appId);
    db.prepare('UPDATE apps SET downloads = downloads + 1 WHERE id = ?').run(appId);
  }
  res.json({ success: true, downloadUrl: app.apk_url || app.api_url });
});

module.exports = router;
