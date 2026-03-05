#!/usr/bin/env node

/**
 * AI Steam 前后端联调测试工具
 * 自动测试前后端 API 对接
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}◆ ${msg}${colors.reset}`);
}

// HTTP 请求封装
function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 测试用例
async function runTests() {
  log('AI Steam 前后端联调测试', 'blue');
  log('=====================================\n');

  let token = null;
  let passed = 0;
  let failed = 0;

  // 1. 健康检查
  try {
    const res = await request('GET', '/api/health');
    if (res.status === 200 && res.data.status === 'ok') {
      log('✓ 后端服务健康检查', 'green');
      passed++;
    } else {
      log('✗ 后端服务异常', 'red');
      failed++;
    }
  } catch (e) {
    log('✗ 后端服务未启动', 'red');
    log(`  提示: cd ai-steam/backend && npm start`, 'yellow');
    failed++;
    return { passed, failed };
  }

  // 2. 获取应用列表
  try {
    const res = await request('GET', '/api/apps');
    if (res.status === 200 && res.data.apps && res.data.apps.length > 0) {
      log(`✓ 获取应用列表 (${res.data.apps.length} 个)`, 'green');
      passed++;
    } else {
      log('✗ 获取应用列表失败', 'red');
      failed++;
    }
  } catch (e) {
    log('✗ API 请求失败', 'red');
    failed++;
  }

  // 3. 获取首页推荐
  try {
    const res = await request('GET', '/api/apps/meta/featured');
    if (res.status === 200 && res.data.popular) {
      log('✓ 获取首页推荐数据', 'green');
      passed++;
    } else {
      log('✗ 获取首页推荐失败', 'red');
      failed++;
    }
  } catch (e) {
    log('✗ API 请求失败', 'red');
    failed++;
  }

  // 4. 用户注册
  try {
    const res = await request('POST', '/api/auth/register', {
      email: `test${Date.now()}@test.com`,
      password: '123456',
      name: '测试用户'
    });
    if (res.status === 200 && res.data.token) {
      token = res.data.token;
      log('✓ 用户注册', 'green');
      passed++;
    } else {
      log('✗ 用户注册失败', 'red');
      failed++;
    }
  } catch (e) {
    log('✗ API 请求失败', 'red');
    failed++;
  }

  // 5. 用户登录
  try {
    const res = await request('POST', '/api/auth/login', {
      email: 'dev@ai-steam.com',
      password: 'password123'
    });
    if (res.status === 200 && res.data.token) {
      token = res.data.token;
      log('✓ 用户登录 (开发者账号)', 'green');
      passed++;
    } else {
      log('✗ 用户登录失败', 'red');
      failed++;
    }
  } catch (e) {
    log('✗ API 请求失败', 'red');
    failed++;
  }

  // 6. 获取用户信息
  if (token) {
    try {
      const res = await request('GET', '/api/auth/me', null, token);
      if (res.status === 200 && res.data.user) {
        log(`✓ 获取用户信息 (${res.data.user.name})`, 'green');
        passed++;
      } else {
        log('✗ 获取用户信息失败', 'red');
        failed++;
      }
    } catch (e) {
      log('✗ API 请求失败', 'red');
      failed++;
    }
  }

  // 7. 获取应用详情
  try {
    const res = await request('GET', '/api/apps/app-001');
    if (res.status === 200 && res.data.app) {
      log(`✓ 获取应用详情 (${res.data.app.name})`, 'green');
      passed++;
    } else {
      log('✗ 获取应用详情失败', 'red');
      failed++;
    }
  } catch (e) {
    log('✗ API 请求失败', 'red');
    failed++;
  }

  // 8. 搜索应用
  try {
    const res = await request('GET', '/api/apps?search=AI');
    if (res.status === 200) {
      log(`✓ 搜索应用 (${res.data.apps.length} 个结果)`, 'green');
      passed++;
    } else {
      log('✗ 搜索应用失败', 'red');
      failed++;
    }
  } catch (e) {
    log('✗ API 请求失败', 'red');
    failed++;
  }

  // 9. 分类筛选
  try {
    const res = await request('GET', '/api/apps?category=image generation');
    if (res.status === 200) {
      log(`✓ 分类筛选 (${res.data.apps.length} 个结果)`, 'green');
      passed++;
    } else {
      log('✗ 分类筛选失败', 'red');
      failed++;
    }
  } catch (e) {
    log('✗ API 请求失败', 'red');
    failed++;
  }

  // 10. 开发者获取自己的应用
  if (token) {
    try {
      const res = await request('GET', '/api/developer/apps', null, token);
      if (res.status === 200 && res.data.apps) {
        log(`✓ 开发者获取应用列表 (${res.data.apps.length} 个)`, 'green');
        passed++;
      } else {
        log('✗ 开发者获取应用列表失败', 'red');
        failed++;
      }
    } catch (e) {
      log('✗ API 请求失败', 'red');
      failed++;
    }
  }

  // 11. 开发者获取统计数据
  if (token) {
    try {
      const res = await request('GET', '/api/developer/stats', null, token);
      if (res.status === 200) {
        log(`✓ 开发者统计数据 (${res.data.total_apps} 个应用, ${res.data.total_downloads} 下载)`, 'green');
        passed++;
      } else {
        log('✗ 开发者统计数据失败', 'red');
        failed++;
      }
    } catch (e) {
      log('✗ API 请求失败', 'red');
      failed++;
    }
  }

  // 12. 收藏应用
  if (token) {
    try {
      const res = await request('POST', '/api/users/favorites', { appId: 'app-001' }, token);
      if (res.status === 200) {
        log('✓ 收藏应用', 'green');
        passed++;
      } else {
        log('✗ 收藏应用失败', 'red');
        failed++;
      }
    } catch (e) {
      log('✗ API 请求失败', 'red');
      failed++;
    }
  }

  // 13. 下载应用
  if (token) {
    try {
      const res = await request('POST', '/api/users/downloads', { appId: 'app-001' }, token);
      if (res.status === 200) {
        log('✓ 下载应用', 'green');
        passed++;
      } else {
        log('✗ 下载应用失败', 'red');
        failed++;
      }
    } catch (e) {
      log('✗ API 请求失败', 'red');
      failed++;
    }
  }

  // 总结
  log('\n=====================================', 'blue');
  log(`测试完成: ${passed} 通过, ${failed} 失败`, failed > 0 ? 'red' : 'green');
  
  return { passed, failed };
}

// 导出给其他模块使用
module.exports = { runTests, request, BASE_URL };

// 如果直接运行
if (require.main === module) {
  runTests().then(({ passed, failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
