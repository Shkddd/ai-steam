const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../data/ai-steam.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      is_developer INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      developer_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      icon TEXT,
      screenshots TEXT,
      version TEXT DEFAULT '1.0.0',
      downloads INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      is_free INTEGER DEFAULT 1,
      price REAL DEFAULT 0,
      apk_url TEXT,
      api_url TEXT,
      features TEXT,
      tags TEXT,
      status TEXT DEFAULT 'pending',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (developer_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      content TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (app_id) REFERENCES apps(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      app_id TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (app_id) REFERENCES apps(id),
      UNIQUE(user_id, app_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      app_id TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (app_id) REFERENCES apps(id),
      UNIQUE(user_id, app_id)
    )
  `);

  console.log('✅ Database initialized');
}

function seedData() {
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (count.count === 0) {
    const devId = 'dev-001';
    const hashedPassword = bcrypt.hashSync('password123', 10);
    
    db.prepare(`INSERT INTO users (id, email, password, name, is_developer) VALUES (?, ?, ?, ?, ?)`)
      .run(devId, 'dev@ai-steam.com', hashedPassword, 'AI Studio', 1);

    db.prepare(`INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)`)
      .run('user-001', 'user@ai-steam.com', hashedPassword, '测试用户');

    const apps = [
      { id: 'app-001', developer_id: devId, name: 'AI 绘图大师', description: '强大的 AI 图像生成工具', category: 'image generation', icon: '🎨', downloads: 125000, rating: 4.8, reviews_count: 3200, is_free: 1, features: '["文生图","图生图"]', tags: '["AI","绘画"]', status: 'published' },
      { id: 'app-002', developer_id: devId, name: '智能写作助手', description: 'AI 写作辅助工具', category: 'text processing', icon: '✍️', downloads: 89000, rating: 4.6, reviews_count: 2100, is_free: 1, features: '["智能补全","语法检查"]', tags: '["写作","AI"]', status: 'published' },
      { id: 'app-003', developer_id: devId, name: '代码小助手', description: '智能代码补全工具', category: 'code assistant', icon: '🤖', downloads: 56000, rating: 4.9, reviews_count: 1800, is_free: 1, features: '["代码补全","错误检测"]', tags: '["编程","AI"]', status: 'published' },
    ];

    const insertApp = db.prepare(`INSERT INTO apps (id, developer_id, name, description, category, icon, screenshots, downloads, rating, reviews_count, is_free, features, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    for (const app of apps) {
      insertApp.run(app.id, app.developer_id, app.name, app.description, app.category, app.icon, '[]', app.downloads, app.rating, app.reviews_count, app.is_free, app.features, app.tags, app.status);
    }

    console.log('✅ Seed data added');
  }
}

initDatabase();
seedData();
module.exports = db;
