const http = require('http');
const https = require('https');

const PORT = 6688;
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// 简单内存缓存
const cache = {};

function getCached(key) {
  const entry = cache[key];
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache[key] = { data, time: Date.now() };
}

// 通用 HTTPS GET
function fetchJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      ...require('url').parse(url),
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// ============================================================
// 抖音热榜
// ============================================================
async function getDouyin() {
  const cached = getCached('douyin');
  if (cached) return cached;

  try {
    // 获取临时 cookie
    const cookieUrl = 'https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383';
    const cookieRes = await fetchJSON(cookieUrl);

    const url = 'https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1';
    const res = await fetchJSON(url, {
      Referer: 'https://www.douyin.com/',
      Cookie: `passport_csrf_token=temp_token`
    });

    if (!res?.data?.word_list) throw new Error('No data');

    const data = res.data.word_list.slice(0, 30).map((item, i) => ({
      id: item.sentence_id || String(i),
      title: item.word,
      hot: item.hot_value || 0,
      url: `https://www.douyin.com/hot/${item.sentence_id || i}`,
    }));

    setCache('douyin', data);
    return data;
  } catch (err) {
    console.error('抖音热榜获取失败:', err.message);
    return getCached('douyin') || [];
  }
}

// ============================================================
// 微博热搜
// ============================================================
async function getWeibo() {
  const cached = getCached('weibo');
  if (cached) return cached;

  try {
    const url = 'https://weibo.com/ajax/side/hotSearch';
    const res = await fetchJSON(url, {
      Referer: 'https://weibo.com/',
    });

    if (!res?.data?.realtime) throw new Error('No data');

    const data = res.data.realtime.slice(0, 30).map((item, i) => ({
      id: String(i),
      title: item.note || item.word,
      hot: item.num || item.raw_hot || 0,
      url: `https://s.weibo.com/weibo?q=${encodeURIComponent(item.note || item.word)}`,
      label: item.label_name || '',
    }));

    setCache('weibo', data);
    return data;
  } catch (err) {
    console.error('微博热搜获取失败:', err.message);
    return getCached('weibo') || [];
  }
}

// ============================================================
// 头条热榜
// ============================================================
async function getToutiao() {
  const cached = getCached('toutiao');
  if (cached) return cached;

  try {
    const url = 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc';
    const res = await fetchJSON(url, {
      Referer: 'https://www.toutiao.com/',
    });

    if (!res?.data) throw new Error('No data');

    const data = res.data.slice(0, 30).map((item, i) => ({
      id: item.ClusterIdStr || String(i),
      title: item.Title,
      hot: item.HotValue || 0,
      url: item.Url || `https://www.toutiao.com/trending/${item.ClusterIdStr || i}/`,
    }));

    setCache('toutiao', data);
    return data;
  } catch (err) {
    console.error('头条热榜获取失败:', err.message);
    return getCached('toutiao') || [];
  }
}

// ============================================================
// 百度热搜
// ============================================================
async function getBaidu() {
  const cached = getCached('baidu');
  if (cached) return cached;

  try {
    const url = 'https://top.baidu.com/api/board?platform=wise&tab=realtime';
    const res = await fetchJSON(url, {
      Referer: 'https://top.baidu.com/',
    });

    if (!res?.data?.cards?.[0]?.content) throw new Error('No data');

    const data = res.data.cards[0].content.slice(0, 30).map((item, i) => ({
      id: String(i),
      title: item.word || item.query,
      hot: item.hotScore || 0,
      url: item.url || `https://www.baidu.com/s?wd=${encodeURIComponent(item.word || item.query)}`,
      desc: item.desc || '',
    }));

    setCache('baidu', data);
    return data;
  } catch (err) {
    console.error('百度热搜获取失败:', err.message);
    return getCached('baidu') || [];
  }
}

// ============================================================
// HTTP 服务器
// ============================================================
const ROUTES = {
  '/douyin': { handler: getDouyin, name: '抖音', type: '热点榜' },
  '/weibo': { handler: getWeibo, name: '微博', type: '热搜榜' },
  '/toutiao': { handler: getToutiao, name: '头条', type: '热榜' },
  '/baidu': { handler: getBaidu, name: '百度', type: '热搜榜' },
};

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const path = req.url.split('?')[0];

  // 首页：返回可用路由列表
  if (path === '/' || path === '') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      name: '灵感引擎热榜API',
      routes: Object.entries(ROUTES).map(([path, r]) => ({
        path, name: r.name, type: r.type
      })),
      cache_ttl: '5分钟',
    }, null, 2));
    return;
  }

  // 聚合接口：一次返回所有平台
  if (path === '/all') {
    try {
      const results = await Promise.allSettled(
        Object.entries(ROUTES).map(async ([p, r]) => ({
          platform: r.name,
          type: r.type,
          data: await r.handler()
        }))
      );
      const data = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ code: 200, data }, null, 2));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 500, error: err.message }));
    }
    return;
  }

  // 单平台接口
  const route = ROUTES[path];
  if (!route) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 404, error: 'Not Found', available: Object.keys(ROUTES) }));
    return;
  }

  try {
    const data = await route.handler();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      code: 200,
      name: route.name,
      type: route.type,
      total: data.length,
      data
    }, null, 2));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 500, error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`热榜API运行在 http://localhost:${PORT}`);
  console.log(`可用路由: ${Object.keys(ROUTES).join(', ')}, /all`);
});
