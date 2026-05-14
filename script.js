// ============================================================
// 工作区管理
// ============================================================
const currentWorkspace = JSON.parse(localStorage.getItem('currentWorkspace') || 'null');
if (!currentWorkspace) {
  window.location.href = 'login.html';
}
const WS_ID = currentWorkspace.workspaceId;

// 工作区命名空间的 localStorage key
function wsKey(key) {
  return `${key}_${WS_ID}`;
}

function logoutWorkspace() {
  if (confirm('确定退出当前工作区？')) {
    localStorage.removeItem('currentWorkspace');
    window.location.href = 'login.html';
  }
}

function clearWorkspaceData() {
  if (!confirm('确定清除当前工作区的所有数据？此操作不可恢复！')) return;
  localStorage.removeItem(wsKey('ipList'));
  localStorage.removeItem(wsKey('currentIpId'));
  localStorage.removeItem(wsKey('knowledgeItems'));
  localStorage.removeItem(wsKey('topicList'));
  localStorage.removeItem(wsKey('draftHistory'));
  localStorage.removeItem(wsKey('apiConfig'));
  alert('✅ 已清除当前工作区数据');
  window.location.reload();
}

// 渲染工作区信息
function renderWorkspaceInfo() {
  const el = document.getElementById('workspace-info');
  if (el) {
    el.innerHTML = `用户：${currentWorkspace.userId}<br>工作区：${currentWorkspace.workspaceId}`;
  }
}

// ============================================================
// 全局状态
// ============================================================
let state = {
  ipList: [],
  currentIpId: null,
  knowledgeItems: [],
  topicList: [],
  draftHistory: [],
  apiConfig: { provider: 'deepseek', apiKey: '', model: '', baseUrl: '' }
};

// 当前IP及其数据的便捷访问器
function currentIp() {
  return state.ipList.find(ip => ip.id === state.currentIpId) || null;
}
function currentKnowledge() {
  return state.knowledgeItems.filter(k => k.ipId === state.currentIpId);
}
function currentTopics() {
  return state.topicList.filter(t => t.ipId === state.currentIpId);
}

// ============================================================
// 数据持久化层（工作区隔离）
// ============================================================
function loadState() {
  const ipList = JSON.parse(localStorage.getItem(wsKey('ipList')) || '[]');
  const currentIpId = localStorage.getItem(wsKey('currentIpId')) || null;
  const knowledgeItems = JSON.parse(localStorage.getItem(wsKey('knowledgeItems')) || '[]');
  const topicList = JSON.parse(localStorage.getItem(wsKey('topicList')) || '[]');
  const draftHistory = JSON.parse(localStorage.getItem(wsKey('draftHistory')) || '[]');
  const apiConfig = JSON.parse(localStorage.getItem(wsKey('apiConfig')) || 'null') || {
    provider: 'deepseek', apiKey: '', model: 'deepseek-chat', baseUrl: ''
  };

  state.ipList = ipList;
  state.currentIpId = currentIpId;
  state.knowledgeItems = knowledgeItems;
  state.topicList = topicList;
  state.draftHistory = draftHistory;
  state.apiConfig = apiConfig;

  // 如果没有IP，创建一个默认IP
  if (state.ipList.length === 0) {
    const defaultIp = {
      id: 'ip_' + Date.now(),
      name: '我的IP',
      field: '',
      audience: '',
      style: 'professional',
      createdAt: new Date().toISOString()
    };
    state.ipList.push(defaultIp);
    state.currentIpId = defaultIp.id;
    saveIpList();
    saveCurrentIpId();
  } else if (!state.currentIpId || !state.ipList.find(ip => ip.id === state.currentIpId)) {
    state.currentIpId = state.ipList[0].id;
    saveCurrentIpId();
  }
}

function saveIpList() { localStorage.setItem(wsKey('ipList'), JSON.stringify(state.ipList)); }
function saveCurrentIpId() { localStorage.setItem(wsKey('currentIpId'), state.currentIpId || ''); }
function saveKnowledgeItems() { localStorage.setItem(wsKey('knowledgeItems'), JSON.stringify(state.knowledgeItems)); }
function saveTopicList() { localStorage.setItem(wsKey('topicList'), JSON.stringify(state.topicList)); }
function saveDraftHistory() { localStorage.setItem(wsKey('draftHistory'), JSON.stringify(state.draftHistory)); }
function saveApiConfig() { localStorage.setItem(wsKey('apiConfig'), JSON.stringify(state.apiConfig)); }

// ============================================================
// IP 管理
// ============================================================
function createIp(name, field, audience, style) {
  const ip = {
    id: 'ip_' + Date.now(),
    name: name || '新IP',
    field: field || '',
    audience: audience || '',
    style: style || 'professional',
    createdAt: new Date().toISOString()
  };
  state.ipList.push(ip);
  state.currentIpId = ip.id;
  saveIpList();
  saveCurrentIpId();
  renderAll();
  return ip;
}

function switchIp(ipId) {
  if (!state.ipList.find(ip => ip.id === ipId)) return;
  state.currentIpId = ipId;
  saveCurrentIpId();
  renderAll();
}

function deleteIp(ipId) {
  if (state.ipList.length <= 1) {
    alert('至少保留一个IP');
    return;
  }
  if (!confirm('确定删除该IP？相关知识库、选题和历史记录也会一并删除。')) return;
  state.ipList = state.ipList.filter(ip => ip.id !== ipId);
  state.knowledgeItems = state.knowledgeItems.filter(k => k.ipId !== ipId);
  state.topicList = state.topicList.filter(t => t.ipId !== ipId);
  state.draftHistory = state.draftHistory.filter(d => d.ipId !== ipId);
  if (state.currentIpId === ipId) {
    state.currentIpId = state.ipList[0]?.id || null;
  }
  saveIpList(); saveCurrentIpId(); saveKnowledgeItems(); saveTopicList(); saveDraftHistory();
  renderAll();
}

function updateIp(ipId, fields) {
  const ip = state.ipList.find(ip => ip.id === ipId);
  if (!ip) return;
  Object.assign(ip, fields);
  saveIpList();
  renderIpSelector();
}

function saveIpForm() {
  const name = document.getElementById('ip-name').value.trim();
  const field = document.getElementById('ip-field').value.trim();
  const audience = document.getElementById('ip-audience').value.trim();
  const style = document.querySelector('input[name="ip-style"]:checked')?.value || 'professional';
  if (!name) { alert('请填写IP名称'); return; }
  updateIp(state.currentIpId, { name, field, audience, style });
  renderIpSelector();
  showToast('✅ IP信息已保存');
}

// ============================================================
// 知识库管理
// ============================================================
function addKnowledgeItem() {
  const titleEl = document.getElementById('knowledge-title');
  const contentEl = document.getElementById('knowledge-content');
  const title = titleEl.value.trim();
  const content = contentEl.value.trim();
  if (!content) { alert('请输入知识内容'); return; }
  const item = {
    id: 'k_' + Date.now(),
    ipId: state.currentIpId,
    title: title || '知识条目',
    content,
    createdAt: new Date().toISOString()
  };
  state.knowledgeItems.push(item);
  saveKnowledgeItems();
  titleEl.value = '';
  contentEl.value = '';
  renderKnowledgeList();
  showToast('✅ 已添加到知识库');
}

function deleteKnowledgeItem(id) {
  if (!confirm('确定删除该知识条目？')) return;
  state.knowledgeItems = state.knowledgeItems.filter(k => k.id !== id);
  saveKnowledgeItems();
  renderKnowledgeList();
}

function editKnowledgeItem(id) {
  const item = state.knowledgeItems.find(k => k.id === id);
  if (!item) return;
  const newTitle = prompt('标题：', item.title);
  if (newTitle === null) return;
  const newContent = prompt('内容：', item.content);
  if (newContent === null) return;
  item.title = newTitle.trim() || item.title;
  item.content = newContent.trim() || item.content;
  saveKnowledgeItems();
  renderKnowledgeList();
}

// ============================================================
// 选题管理
// ============================================================
let selectedTopicId = null;
let createPlatform = 'xiaohongshu';
let createFormat = '口播';
// 新筛选状态
let topicSearch = '';
let topicPlatformFilter = 'all'; // 'all' | 'xiaohongshu' | 'douyin'
let topicFormatFilter = 'all';   // 'all' | '口播' | '图文'
let topicTimeFilter = 'all';     // 'all' | 'today' | 'week' | 'month'
let topicStarredFilter = false;

function generateTopics() {
  const platform = document.querySelector('input[name="topic-platform"]:checked')?.value || 'xiaohongshu';
  const format = document.querySelector('input[name="topic-format"]:checked')?.value || '口播';
  const ip = currentIp();
  if (!ip) { alert('请先设定IP信息'); return; }

  // 防堆叠：当前IP该平台+格式的选题超过30条时提示
  const existing = currentTopics().filter(t => t.platform === platform && t.format === format);
  if (existing.length >= 30) {
    if (!confirm(`当前已有 ${existing.length} 条 ${platform === 'xiaohongshu' ? '小红书' : '抖音'}${format} 选题，继续生成会置顶新内容。建议先清理旧选题，是否继续？`)) return;
  }

  const mode = state.apiConfig.apiKey ? 'api' : 'demo';
  if (mode === 'api') {
    const prompt = buildTopicPrompt(platform, format);
    document.getElementById('topic-gen-btn').innerHTML = '<span class="inline-block animate-spin mr-1">⟳</span>AI生成中';
    document.getElementById('topic-gen-btn').disabled = true;
    callAI(prompt).then(text => {
      try {
        // 兼容AI返回markdown代码块或纯JSON的情况
        const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const jsonStr = cleaned.match(/\[[\s\S]*\]/)?.[0] || '[]';
        const arr = JSON.parse(jsonStr);
        if (!arr.length) throw new Error('empty');
        const now = Date.now();
        const topics = arr.slice(0, 5).map((t, i) => ({
          id: 'topic_' + now + '_' + i,
          ipId: state.currentIpId,
          title: t.title || t,
          platform, format,
          reason: t.reason || '',
          starred: false,
          createdAt: new Date(now + i).toISOString()
        }));
        state.topicList.unshift(...topics);
        saveTopicList();
        renderTopicList();
        // 去重提示
        const dups = topics.filter(t => {
          const dup = checkDuplicate(t.title);
          return dup && dup.topic.id !== t.id;
        });
        if (dups.length) showToast(`✅ 已生成 ${topics.length} 个选题（注意：${dups.length} 条与已有选题相似）`);
        else showToast(`✅ 已生成 ${topics.length} 个选题`);
      } catch {
        showToast('解析选题失败：AI返回格式异常，请重试');
      }
    }).catch(err => {
      showToast('生成失败：' + err.message.slice(0, 50));
      // 如果是连接相关错误，更新连接状态
      if (err.message.includes('超时') || err.message.includes('网络错误') || err.message.includes('Failed to fetch')) {
        connStatus = 'failed';
        connStatusDetail = err.message.slice(0, 80);
        renderConnStatus();
      }
    }).finally(() => {
      document.getElementById('topic-gen-btn').textContent = '生成一批选题';
      document.getElementById('topic-gen-btn').disabled = false;
    });
  } else {
    const topics = generateDemoTopics(platform, format);
    // 新内容置顶
    state.topicList.unshift(...topics);
    saveTopicList();
    renderTopicList();
    showToast('✅ 已生成 ' + topics.length + ' 个选题（演示模式）');
  }
}

function clearCurrentTopics() {
  const count = currentTopics().length;
  if (count === 0) { showToast('当前IP没有选题'); return; }
  if (!confirm(`确定清空当前IP的全部 ${count} 条选题？`)) return;
  state.topicList = state.topicList.filter(t => t.ipId !== state.currentIpId);
  saveTopicList();
  renderTopicList();
  showToast('✅ 已清空');
}

function setTopicSearch(val) {
  topicSearch = val.trim();
  renderTopicList();
}

function setTopicTimeFilter(val) {
  topicTimeFilter = val;
  const ids = ['all','today','week','month'];
  ids.forEach(id => {
    const btn = document.getElementById('ttf-' + id);
    if (!btn) return;
    btn.className = id === val
      ? 'px-2.5 py-1.5 text-xs rounded-lg bg-gray-900 text-white font-medium transition-colors'
      : 'px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors';
  });
  renderTopicList();
}

function toggleTopicFilter(type, val) {
  if (type === 'platform') {
    topicPlatformFilter = val;
    [['all','tf-plat-all'],['xiaohongshu','tf-plat-xhs'],['douyin','tf-plat-dy']].forEach(([v,id]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.className = v === val
        ? 'px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white font-medium transition-colors'
        : 'px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors';
    });
  } else if (type === 'format') {
    topicFormatFilter = val;
    [['all','tf-fmt-all'],['口播','tf-fmt-koubo'],['图文','tf-fmt-tuwen']].forEach(([v,id]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.className = v === val
        ? 'px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white font-medium transition-colors'
        : 'px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors';
    });
  } else if (type === 'starred') {
    topicStarredFilter = !topicStarredFilter;
    const btn = document.getElementById('tf-starred');
    if (btn) btn.className = topicStarredFilter
      ? 'px-3 py-1.5 text-xs rounded-lg bg-yellow-400 text-white font-medium transition-colors'
      : 'px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors';
  }
  renderTopicList();
}

function buildTopicPrompt(platform, format) {
  const ip = currentIp();
  const knowledge = currentKnowledge();
  const knowledgeSection = knowledge.length > 0
    ? '\n\n## 知识库参考\n' + knowledge.map(k => `- ${k.title}：${k.content.slice(0, 100)}`).join('\n')
    : '';
  const platformName = platform === 'xiaohongshu' ? '小红书' : '抖音';

  // 已有选题标题，避免重复
  const existingTitles = currentTopics().filter(t => t.platform === platform && t.format === format).map(t => t.title);
  const avoidSection = existingTitles.length > 0
    ? `\n\n## 已有选题（请勿重复或相似）\n${existingTitles.map(t => `- ${t}`).join('\n')}`
    : '';

  const platformStyle = platform === 'xiaohongshu'
    ? '小红书风格：标题用"|"分隔，多用"｜"、"！"，强调收藏价值，适合图文和种草'
    : '抖音风格：标题简短有力，强调反转/数字/悬念，适合短视频开头钩子';

  return `你是内容策划专家。请为以下IP人设生成5个全新的${platformName}${format}选题。

## IP人设
- 名称：${ip.name}
- 领域：${ip.field || '内容创作'}
- 目标受众：${ip.audience || '普通用户'}
- 内容风格：${ip.style}
${knowledgeSection}${avoidSection}

## 平台要求
- ${platformStyle}
- 每个选题必须有标题和推荐理由
- 严格返回JSON数组，不要输出任何其他内容：[{"title": "...", "reason": "..."}]`;
}

function generateDemoTopics(platform, format) {
  const ip = currentIp();
  const field = ip?.field || '内容创作';
  const audience = ip?.audience || '普通用户';

  const templateMap = {
    'xiaohongshu_口播': [
      { title: `${audience}必看！${field}这3个误区，90%的人都踩过`, reason: `小红书口播：痛点切入，引发共鸣` },
      { title: `我靠${field}3个月改变了什么？真实复盘给你看`, reason: `小红书口播：故事化叙述，真实感强` },
      { title: `${field}入门第一步，${audience}别再走弯路了`, reason: `小红书口播：干货定位，适合新手收藏` },
      { title: `为什么你学了那么多${field}，还是没有进步？`, reason: `小红书口播：提问式开头，制造认知冲突` },
      { title: `${audience}做${field}，这件事比努力更重要`, reason: `小红书口播：反常识标题，激发好奇心` },
      { title: `${field}最容易被忽视的3个细节，你注意到了吗`, reason: `小红书口播：细节型内容，引发自我检视` },
      { title: `我做${field}一年后，最想对新手说的话`, reason: `小红书口播：经验分享，建立信任感` },
      { title: `${audience}学${field}，先搞清楚这个底层逻辑`, reason: `小红书口播：逻辑型内容，建立专业形象` },
      { title: `${field}这件事，99%的人都做反了`, reason: `小红书口播：反转型标题，制造好奇` },
      { title: `${audience}做${field}前，这3个问题你想清楚了吗`, reason: `小红书口播：追问式开头，引发思考` },
    ],
    'xiaohongshu_图文': [
      { title: `${field}完整攻略｜${audience}收藏这一篇就够了`, reason: `小红书图文：合集感强，适合收藏传播` },
      { title: `我整理了${field}最全资源清单，免费分享给你`, reason: `小红书图文：资源型内容，转发率高` },
      { title: `${audience}做${field}的正确姿势（附详细步骤）`, reason: `小红书图文：步骤清晰，适合图文展示` },
      { title: `${field}避坑指南｜这些错误我替你踩过了`, reason: `小红书图文：避坑类内容，实用性强` },
      { title: `从0到1学${field}，我用了这套方法论`, reason: `小红书图文：方法论类，建立专业形象` },
      { title: `${field}工具箱｜${audience}必备的10个神器`, reason: `小红书图文：工具清单，收藏率高` },
      { title: `${audience}做${field}的常见误区，对照自查`, reason: `小红书图文：自查清单，互动性强` },
      { title: `${field}进阶路线图｜从入门到精通只需这几步`, reason: `小红书图文：路线图形式，清晰直观` },
      { title: `${field}高频问题解答｜${audience}最想知道的都在这`, reason: `小红书图文：FAQ形式，搜索流量高` },
      { title: `${audience}做${field}，这份模板直接套用`, reason: `小红书图文：模板型内容，实用价值高` },
    ],
    'douyin_口播': [
      { title: `${audience}注意！${field}这个细节99%的人都忽略了`, reason: `抖音口播：强烈开场，制造紧迫感` },
      { title: `3秒告诉你${field}最核心的一件事`, reason: `抖音口播：短平快，符合抖音节奏` },
      { title: `我用${field}赚到第一桶金，方法只有这3步`, reason: `抖音口播：结果导向，激发行动欲` },
      { title: `${field}高手和普通人的差距，就在这一点`, reason: `抖音口播：对比结构，制造落差感` },
      { title: `看完这条视频，你对${field}的认知会彻底改变`, reason: `抖音口播：承诺型标题，提升完播率` },
      { title: `${audience}做${field}，千万别犯这个错误`, reason: `抖音口播：警示型开场，引发警觉` },
      { title: `${field}最快的入门方式，没有之一`, reason: `抖音口播：极致化表达，吸引新手` },
      { title: `我花了3年才明白的${field}真相`, reason: `抖音口播：时间成本感，引发共鸣` },
      { title: `${audience}做${field}，先问自己这一个问题`, reason: `抖音口播：追问式，引发思考停留` },
      { title: `${field}的本质是什么？很多人想错了`, reason: `抖音口播：认知颠覆型，完播率高` },
    ],
    'douyin_图文': [
      { title: `${field}干货合集｜${audience}建议截图保存`, reason: `抖音图文：截图保存型，传播性强` },
      { title: `${audience}做${field}必须知道的5件事`, reason: `抖音图文：数字型标题，清晰直接` },
      { title: `${field}最全对比图，一眼看懂怎么选`, reason: `抖音图文：对比图形式，视觉冲击强` },
      { title: `${field}新手到高手的进阶路线图`, reason: `抖音图文：路线图形式，适合图文展示` },
      { title: `${audience}做${field}，这张清单帮你少走3年弯路`, reason: `抖音图文：清单型内容，实用收藏率高` },
      { title: `${field}核心公式｜一张图看懂`, reason: `抖音图文：公式化内容，易于传播` },
      { title: `${audience}必收！${field}最全知识框架`, reason: `抖音图文：框架型内容，建立权威感` },
      { title: `${field}避坑清单｜这些坑我替你踩了`, reason: `抖音图文：避坑清单，实用性强` },
      { title: `${field}入门到精通，只需掌握这几个关键词`, reason: `抖音图文：关键词型，搜索流量高` },
      { title: `${audience}做${field}的正确流程，收藏备用`, reason: `抖音图文：流程图形式，收藏率高` },
    ],
  };

  const key = `${platform}_${format}`;
  const pool = templateMap[key] || templateMap['xiaohongshu_口播'];

  // 随机抽取5条，避免每次重复
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 5);

  const now = Date.now();
  return picked.map((t, i) => ({
    id: 'topic_' + now + '_' + i,
    ipId: state.currentIpId,
    title: t.title,
    platform, format,
    reason: t.reason,
    starred: false,
    createdAt: new Date(now + i).toISOString()
  }));
}

// 字符级 Jaccard 相似度
function checkDuplicate(title) {
  const topics = currentTopics();
  if (!topics.length) return null;
  const setA = new Set(title.split(''));
  let best = null, bestScore = 0;
  for (const t of topics) {
    const setB = new Set(t.title.split(''));
    const inter = [...setA].filter(c => setB.has(c)).length;
    const union = new Set([...setA, ...setB]).size;
    const score = union ? inter / union : 0;
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return bestScore >= 0.7 ? { topic: best, score: bestScore } : null;
}

function buildKeywordTopicPrompt(keyword, platform, format) {
  const ip = currentIp();
  const platformName = platform === 'xiaohongshu' ? '小红书' : '抖音';
  const existingTitles = currentTopics().filter(t => t.platform === platform && t.format === format).map(t => t.title);
  const avoidSection = existingTitles.length > 0
    ? `\n\n## 已有选题（请勿重复）\n${existingTitles.map(t => `- ${t}`).join('\n')}`
    : '';
  return `你是内容策划专家，请结合当前热点趋势，为以下IP人设围绕关键词"${keyword}"生成5个${platformName}${format}选题。

## IP人设
- 名称：${ip?.name || '未设定'}
- 领域：${ip?.field || '内容创作'}
- 目标受众：${ip?.audience || '普通用户'}
- 内容风格：${ip?.style || ''}
${avoidSection}

## 要求
- 选题必须与关键词"${keyword}"强相关
- 结合当前互联网热点和趋势
- 严格返回JSON数组：[{"title": "...", "reason": "..."}]`;
}

function generateTopicsByKeyword() {
  const input = document.getElementById('topic-keyword-input');
  const keyword = input?.value.trim();
  if (!keyword) { showToast('请输入关键词'); input?.focus(); return; }
  const ip = currentIp();
  if (!ip) { alert('请先设定IP信息'); return; }

  const platform = document.querySelector('input[name="topic-platform"]:checked')?.value || 'xiaohongshu';
  const format = document.querySelector('input[name="topic-format"]:checked')?.value || '口播';

  if (state.apiConfig.apiKey) {
    const btn = document.getElementById('topic-kw-btn');
    btn.innerHTML = '<span class="inline-block animate-spin mr-1">⟳</span>AI生成中';
    btn.disabled = true;
    const prompt = buildKeywordTopicPrompt(keyword, platform, format);
    callAI(prompt).then(text => {
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const jsonStr = cleaned.match(/\[[\s\S]*\]/)?.[0] || '[]';
      const arr = JSON.parse(jsonStr);
      if (!arr.length) throw new Error('empty');
      const now = Date.now();
      const topics = arr.slice(0, 5).map((t, i) => ({
        id: 'topic_' + now + '_kw_' + i,
        ipId: state.currentIpId,
        title: t.title || t,
        platform, format,
        reason: t.reason || '',
        keyword,
        starred: false,
        createdAt: new Date(now + i).toISOString()
      }));
      state.topicList.unshift(...topics);
      saveTopicList();
      renderTopicList();
      showToast(`✅ 已生成 ${topics.length} 个"${keyword}"相关选题`);
    }).catch(err => {
      showToast('生成失败：' + err.message.slice(0, 50));
    }).finally(() => {
      btn.textContent = '联网生成';
      btn.disabled = false;
    });
  } else {
    // 无API Key：基于关键词+IP字段本地生成
    const field = ip.field || '内容创作';
    const audience = ip.audience || '普通用户';
    const platformName = platform === 'xiaohongshu' ? '小红书' : '抖音';
    const templates = [
      { title: `${keyword}+${field}，${audience}必看的实用指南`, reason: `${platformName}：关键词结合领域，精准触达目标用户` },
      { title: `做${field}的${audience}，如何用好${keyword}？`, reason: `${platformName}：问句式标题，引发思考` },
      { title: `${keyword}这件事，${field}领域的${audience}都做错了`, reason: `${platformName}：反转型，制造认知冲突` },
      { title: `${keyword}×${field}：${audience}的完整操作手册`, reason: `${platformName}：手册型，收藏价值高` },
      { title: `从${keyword}出发，${audience}做${field}的新思路`, reason: `${platformName}：角度新颖，差异化内容` },
    ];
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    const now = Date.now();
    const topics = shuffled.slice(0, 5).map((t, i) => ({
      id: 'topic_' + now + '_kw_' + i,
      ipId: state.currentIpId,
      title: t.title,
      platform, format,
      reason: t.reason,
      keyword,
      starred: false,
      createdAt: new Date(now + i).toISOString()
    }));
    state.topicList.unshift(...topics);
    saveTopicList();
    renderTopicList();
    showToast(`✅ 已生成 ${topics.length} 个"${keyword}"相关选题（演示模式）`);
  }
}

function starTopic(id) {
  const topic = state.topicList.find(t => t.id === id);
  if (!topic) return;
  topic.starred = !topic.starred;
  saveTopicList();
  renderTopicList();
}

function deleteTopic(id) {
  if (!confirm('确定删除该选题？')) return;
  state.topicList = state.topicList.filter(t => t.id !== id);
  saveTopicList();
  renderTopicList();
}

function useTopic(id) {
  const topic = state.topicList.find(t => t.id === id);
  if (!topic) return;
  selectedTopicId = id;
  createPlatform = topic.platform;
  createFormat = topic.format;
  switchSection('create');
  renderCreateHeader();
}

// ============================================================
// 创作模块
// ============================================================
function buildPrompt(topicId, platform, format, duration, wordCount, angle) {
  const ip = currentIp();
  const knowledge = currentKnowledge();
  const topic = state.topicList.find(t => t.id === topicId);
  const platformName = platform === 'xiaohongshu' ? '小红书' : '抖音';
  const customPrompt = document.getElementById('custom-prompt')?.value?.trim() || '';

  // 知识库带编号注入，便于引用标注
  const knowledgeSection = knowledge.length > 0
    ? '\n\n## 知识库（请在使用时标注来源编号，如[K1]）\n' +
      knowledge.map((k, i) => `[K${i + 1}] ${k.title}：${k.content}`).join('\n\n')
    : '';

  const platformGuide = platform === 'xiaohongshu'
    ? '小红书风格：标题吸引眼球，内容有干货，语言亲切，结尾引导互动'
    : '抖音风格：开头3秒必须抓人，节奏快，口语化，有反转或爆点';

  const formatGuide = format === '口播'
    ? `口播格式：口语化表达，有停顿节奏感，时长约${duration}秒，总字数约${wordCount}字`
    : `图文格式：分段清晰，每段有小标题，适合截图保存，总字数约${wordCount}字`;
  const durationLine = format === '口播' ? `\n- 时长：${duration}秒` : '';

  const customSection = customPrompt ? `\n\n## 额外要求\n${customPrompt}` : '';

  const angleMap = {
    'tutorial': '干货教程：系统化知识拆解，步骤清晰，让用户学到实用方法',
    'story': '故事案例：用真实经历或案例引入，情感共鸣，让用户感同身受',
    'opinion': '观点输出：鲜明立场，反常识角度，引发思考和讨论',
    'trending': '热点借势：结合当前热点话题，蹭流量，增加传播性'
  };
  const angleSection = angle && angleMap[angle] ? `\n\n## 写作角度\n${angleMap[angle]}` : '';

  const citationRule = knowledge.length > 0
    ? '\n- 重要：当你使用了知识库中的内容时，请在该句末尾标注来源编号，格式如[K1]、[K2]。未使用知识库的内容不需要标注。'
    : '';

  return `你是专业的短视频内容创作者，请根据以下信息创作内容脚本。

## IP人设
- 名称：${ip?.name || '未设定'}
- 领域：${ip?.field || '内容创作'}
- 目标受众：${ip?.audience || '普通用户'}
- 内容风格：${ip?.style || 'professional'}
${knowledgeSection}

## 本次创作任务
- 话题：${topic?.title || '（未选择话题）'}
- 平台：${platformName}
- 格式：${format}${durationLine}
- 字数：约${wordCount}字

## 创作要求
- ${platformGuide}
- ${formatGuide}
- 内容必须符合IP人设的风格和领域
- 如有知识库内容，请自然融入，体现IP的专业积累${citationRule}
${customSection}${angleSection}

请直接输出脚本内容，不需要额外说明。`;
}

function generateDemoContent(topicId, platform, format, duration, wordCount) {
  const ip = currentIp();
  const topic = state.topicList.find(t => t.id === topicId);
  const knowledge = currentKnowledge();
  const platformName = platform === 'xiaohongshu' ? '小红书' : '抖音';
  const topicTitle = topic?.title || '内容创作';
  const field = ip?.field || '内容创作';
  const audience = ip?.audience || '大家';

  // 知识库全量注入（与API模式一致）
  const knowledgeLines = knowledge.map(k =>
    `（知识库「${k.title}」：${k.content.slice(0, 80)}）`
  ).join('\n');
  const knowledgeBlock = knowledge.length > 0 ? `\n${knowledgeLines}` : '';

  // 根据字数决定内容密度
  // wordCount: 150=1min, 300=2min, 450=3min, 750=5min
  const isShort = wordCount <= 150;   // 1分钟
  const isMedium = wordCount <= 300;  // 2分钟
  // isLong = 3分钟及以上

  if (format === '口播') {
    if (isShort) {
      // 1分钟：极简结构，开场+1个核心点+收尾
      return `【${topicTitle}】${platformName}口播脚本（约${wordCount}字·1分钟版）

开场：
"${audience}，今天只说一件事——"

核心：
很多人做${field}，最大的问题就是想太多、做太少。
我的建议只有一条：先完成，再完美。
把这一条执行到位，你已经超过80%的人了。${knowledgeBlock}

收尾：
"就这一条，先去做。关注我，下期继续。"`;
    } else if (isMedium) {
      // 2分钟：开场+2个核心点+收尾
      return `【${topicTitle}】${platformName}口播脚本（约${wordCount}字·2分钟版）

开场（0-5秒）：
"${audience}，你有没有遇到过这种情况——明明很努力，但${field}就是没有进展？"

核心第一点（5-40秒）：
问题不在于努力程度，而在于方向。
很多${audience}在${field}上花了大量时间，却没有先想清楚"我要解决谁的问题"。
方向对了，事半功倍；方向错了，越努力越偏。${knowledgeBlock}

核心第二点（40-80秒）：
找对方向之后，最重要的是建立系统。
不要靠灵感，要靠流程。
把你在${field}上做的每一件事，都变成可以复制的动作。

收尾（最后10秒）：
"方向+系统，这是我做${field}最核心的两件事。关注我，持续分享。"`;
    } else {
      // 3分钟及以上：完整结构，开场+3个核心点+案例+收尾
      const extraPoints = wordCount >= 600 ? `
延伸思考（${Math.floor(duration * 0.6)}-${Math.floor(duration * 0.8)}秒）：
说到这里，我想多说一点。
${field}这件事，短期看技巧，长期看认知。
技巧可以学，但认知的升级需要时间积累。
所以不要焦虑，每天进步一点点，一年后你会感谢今天的自己。` : '';

      return `【${topicTitle}】${platformName}口播脚本（约${wordCount}字·${Math.floor(duration/60)}分钟版）

开场（0-5秒）：
"${audience}，今天我要聊一个很多人都想搞清楚的问题——"

背景铺垫（5-20秒）：
作为一个深耕${field}的创作者，我见过太多${audience}在这件事上走弯路。
今天我把最核心的三点拆解给你，希望能帮你少走一些弯路。${knowledgeBlock}

第一点（20-60秒）：
认知先行。
很多人在${field}上失败，不是因为不努力，而是底层认知没有建立起来。
你需要先搞清楚：这件事的本质是什么？核心逻辑是什么？
只有想清楚了，后面的行动才不会白费。

第二点（60-100秒）：
方法要系统。
零散的技巧无法形成竞争力。
你需要一套完整的框架，把每一个动作都纳入系统。
这样才能持续产出，而不是靠灵感。

第三点（100-${Math.floor(duration * 0.75)}秒）：
执行要持续。
知道和做到之间，隔着一道叫"坚持"的墙。
不要等到准备好了再开始，先开始，再优化。
${extraPoints}

收尾（最后10秒）：
"以上三点，是我在${field}领域最核心的方法论。如果对你有帮助，记得关注我。"`;
    }
  } else {
    // 图文格式
    if (isShort) {
      // 图文短版：封面+1个核心段落
      return `【${topicTitle}】${platformName}图文脚本（约${wordCount}字·简短版）

📌 封面标题：${topicTitle}

▌ 核心内容
${audience}做${field}，最重要的一件事：
先完成，再完美。

很多人迟迟不开始，是因为觉得自己还没准备好。
但真相是：你永远不会完全准备好。
开始了，才有机会变好。${knowledgeBlock}

💬 你现在在做${field}吗？评论区聊聊 👇`;
    } else if (isMedium) {
      return `【${topicTitle}】${platformName}图文脚本（约${wordCount}字·标准版）

📌 封面标题：${topicTitle}

▌ 为什么要看这篇
${audience}在${field}上最常见的困惑，我整理成了这篇笔记。
建议收藏，反复看。${knowledgeBlock}

▌ 核心要点一：方向比努力更重要
先想清楚你要解决谁的问题，再开始行动。
方向对了，事半功倍。

▌ 核心要点二：系统比技巧更持久
把你做的每件事变成可复制的流程。
不靠灵感，靠系统。

▌ 总结
做好${field}，方向+系统，缺一不可。

💬 你在${field}上最大的困惑是什么？评论区告诉我 👇`;
    } else {
      const extraSection = wordCount >= 600 ? `
▌ 进阶思考：长期主义
${field}这件事，短期看技巧，长期看认知。
不要只盯着眼前的结果，要关注自己的成长曲线。
每天进步1%，一年后你会超越大多数人。` : '';

      return `【${topicTitle}】${platformName}图文脚本（约${wordCount}字·详细版）

📌 封面标题：${topicTitle}

▌ 写在前面
这篇笔记是我在${field}领域积累了很长时间后，整理出来的核心方法论。
专门写给${audience}，建议收藏。${knowledgeBlock}

▌ 第一步：建立正确认知
很多${audience}在${field}上卡住，根本原因是认知没到位。
你需要先搞清楚：
- 这件事的本质是什么？
- 你的目标受众是谁？
- 你能提供什么独特价值？

▌ 第二步：搭建系统框架
认知清晰之后，下一步是建立系统。
推荐这套框架：
① 定位：明确你是谁，为谁服务
② 内容：持续输出有价值的内容
③ 互动：建立与受众的真实连接
④ 迭代：根据反馈不断优化
${extraSection}

▌ 第三步：持续执行
知道了方法，最后还是要靠执行。
建议：每天固定时间做${field}相关的事，哪怕只有30分钟。
积累的力量，比你想象的更强大。

▌ 总结
认知→系统→执行，这是做好${field}的完整路径。

💬 你在${field}上遇到过类似问题吗？评论区聊聊 👇
如果这篇对你有帮助，记得点赞收藏 ❤️`;
    }
  }
}

async function generateDraft() {
  const ip = currentIp();
  if (!ip) { alert('请先设定IP信息'); return; }
  if (!selectedTopicId) { alert('请先从选题库选择一个话题'); return; }

  let duration = 0;
  let wordCount = 0;

  if (createFormat === '图文') {
    wordCount = parseInt(document.getElementById('create-wordcount')?.value || '300');
    duration = 0;
  } else {
    duration = parseInt(document.getElementById('create-duration')?.value || '180');
    wordCount = Math.floor(duration / 60 * 150);
  }

  const mode = document.querySelector('input[name="create-mode"]:checked')?.value || 'demo';
  const angle = document.querySelector('input[name="create-angle"]:checked')?.value || '';
  const genBtn = document.getElementById('generate-btn');
  const draftEl = document.getElementById('draft-content');
  const wordCountEl = document.getElementById('draft-word-count');

  if (draftEl) { draftEl.textContent = ''; draftEl.dataset.content = ''; }
  if (wordCountEl) wordCountEl.textContent = '';

  if (mode === 'demo') {
    const content = generateDemoContent(selectedTopicId, createPlatform, createFormat, duration, wordCount);
    displayDraftResult(content);
    saveDraft(content, '', selectedTopicId, createPlatform, createFormat, duration, wordCount);
    showToast('✅ 已生成并保存到历史');
  } else {
    const prompt = buildPrompt(selectedTopicId, createPlatform, createFormat, duration, wordCount, angle);
    if (genBtn) { genBtn.innerHTML = '<span class="inline-block animate-spin mr-1">⟳</span>生成中'; genBtn.disabled = true; }
    if (draftEl) { draftEl.textContent = ''; draftEl.dataset.content = ''; }

    callAIStream(
      prompt,
      (chunk) => {
        if (!draftEl) return;
        draftEl.textContent += chunk;
        draftEl.dataset.content = draftEl.textContent;
        if (wordCountEl) {
          const len = draftEl.textContent.length;
          const secs = createFormat === '口播' ? Math.round(len / 150 * 60) : 0;
          wordCountEl.textContent = createFormat === '口播'
            ? `${len} 字 · 约 ${secs} 秒`
            : `${len} 字`;
        }
      },
      (fullText) => {
        displayDraftResult(fullText);
        saveDraft(fullText, prompt, selectedTopicId, createPlatform, createFormat, duration, wordCount);
        showToast('✅ 生成完成，已保存到历史');
        if (genBtn) { genBtn.textContent = createFormat === '图文' ? '生成图文脚本' : '生成口播脚本'; genBtn.disabled = false; }
      },
      (err) => {
        if (draftEl) draftEl.innerHTML = `<p class="text-red-500">生成失败：${escHtml(err.message)}</p>`;
        showToast('✗ 生成失败：' + err.message.slice(0, 40));
        if (err.message.includes('超时') || err.message.includes('网络错误') || err.message.includes('Failed to fetch')) {
          connStatus = 'failed';
          connStatusDetail = err.message.slice(0, 80);
          renderConnStatus();
        }
        if (genBtn) { genBtn.textContent = createFormat === '图文' ? '生成图文脚本' : '生成口播脚本'; genBtn.disabled = false; }
      }
    );
  }
}

function saveCurrentDraft() {
  const content = document.getElementById('draft-content').dataset.content;
  if (!content || content === '') { showToast('还没有生成内容'); return; }
  showToast('✅ 已保存到历史记录');
  renderDraftHistory();
}

function displayDraftResult(content) {
  const el = document.getElementById('draft-content');
  const knowledge = currentKnowledge();

  if (knowledge.length > 0) {
    // 解析 [K1] [K2] 等引用标注，高亮显示
    let html = escHtml(content);
    html = html.replace(/\[K(\d+)\]/g, (match, num) => {
      const idx = parseInt(num) - 1;
      const item = knowledge[idx];
      if (item) {
        return `<span class="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium cursor-help" title="引用自知识库：${escHtml(item.title)}">[K${num}]</span>`;
      }
      return match;
    });

    // 统计引用情况
    const cited = new Set();
    content.replace(/\[K(\d+)\]/g, (_, num) => { cited.add(parseInt(num)); });
    const citedCount = cited.size;
    const totalCount = knowledge.length;

    // 添加引用报告
    let report = `<div class="mt-4 pt-4 border-t border-gray-200">
      <div class="text-xs font-medium text-gray-500 mb-2">知识库引用报告</div>
      <div class="flex gap-3 text-xs">
        <span class="px-2 py-1 bg-amber-50 text-amber-700 rounded-md">引用 ${citedCount}/${totalCount} 条知识</span>`;
    if (citedCount < totalCount) {
      const unused = knowledge.filter((_, i) => !cited.has(i + 1)).map(k => k.title);
      report += `<span class="px-2 py-1 bg-gray-100 text-gray-500 rounded-md">未使用：${unused.join('、')}</span>`;
    }
    report += `</div></div>`;

    el.innerHTML = `<div class="whitespace-pre-wrap leading-relaxed">${html}</div>${report}`;
  } else {
    el.textContent = content;
  }
  el.dataset.content = content;
}

function saveDraft(content, prompt, topicId, platform, format, duration, wordCount) {
  const topic = state.topicList.find(t => t.id === topicId);
  const draft = {
    id: 'draft_' + Date.now(),
    ipId: state.currentIpId,
    ipName: currentIp()?.name || '',
    topicId,
    topicTitle: topic?.title || '',
    platform, format, duration, wordCount,
    content, prompt,
    createdAt: new Date().toISOString()
  };
  state.draftHistory.unshift(draft);
  if (state.draftHistory.length > 100) state.draftHistory = state.draftHistory.slice(0, 100);
  saveDraftHistory();
}

function copyDraftContent() {
  const content = document.getElementById('draft-content').dataset.content;
  if (!content) return;
  navigator.clipboard.writeText(content).then(() => showToast('✅ 已复制'));
}

function refineContent(type) {
  const draftEl = document.getElementById('draft-content');
  const content = draftEl?.dataset.content;
  if (!content) { showToast('请先生成内容'); return; }
  if (!state.apiConfig.apiKey) { showToast('优化功能需要配置API Key'); return; }

  const typeMap = {
    'shorten':  '请将以下内容精简约30%，保留核心观点，删除冗余表达，直接输出精简后的内容：',
    'expand':   '请将以下内容扩展约50%，补充细节、案例或论据，直接输出扩展后的内容：',
    'casual':   '请将以下内容改写得更口语化、更自然，像朋友聊天的语气，直接输出改写后的内容：',
    'reangle':  '请从一个全新的角度重新创作同一主题的内容，保持相同的平台和格式风格，直接输出新内容：',
    'reintro':  '请重新创作一个更吸引人的开头（前3-5句），其余内容保持不变，直接输出完整内容：'
  };
  const instruction = typeMap[type];
  if (!instruction) return;

  const prompt = `${instruction}\n\n${content}`;
  const refineBtn = document.getElementById('refine-menu-btn');
  const refineMenu = document.getElementById('refine-menu');
  if (refineMenu) refineMenu.classList.add('hidden');
  if (refineBtn) { refineBtn.innerHTML = '<span class="inline-block animate-spin mr-1">⟳</span>优化中'; refineBtn.disabled = true; }
  if (draftEl) { draftEl.textContent = ''; draftEl.dataset.content = ''; }

  const wordCountEl = document.getElementById('draft-word-count');
  callAIStream(
    prompt,
    (chunk) => {
      draftEl.textContent += chunk;
      draftEl.dataset.content = draftEl.textContent;
      if (wordCountEl) {
        const len = draftEl.textContent.length;
        wordCountEl.textContent = createFormat === '口播'
          ? `${len} 字 · 约 ${Math.round(len / 150 * 60)} 秒`
          : `${len} 字`;
      }
    },
    (fullText) => {
      displayDraftResult(fullText);
      saveDraft(fullText, prompt, selectedTopicId, createPlatform, createFormat, 0, fullText.length);
      showToast('✅ 优化完成');
      if (refineBtn) { refineBtn.textContent = '优化 ▾'; refineBtn.disabled = false; }
    },
    (err) => {
      showToast('✗ 优化失败：' + err.message.slice(0, 40));
      if (refineBtn) { refineBtn.textContent = '优化 ▾'; refineBtn.disabled = false; }
    }
  );
}

function toggleRefineMenu() {
  const menu = document.getElementById('refine-menu');
  if (menu) menu.classList.toggle('hidden');
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('settings-api-key');
  const eye = document.getElementById('api-key-eye');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (eye) eye.textContent = '🙈';
  } else {
    input.type = 'password';
    if (eye) eye.textContent = '👁';
  }
}

// ============================================================
// API 层（多 Provider）
// ============================================================
const PROVIDER_CONFIG = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    buildRequest(model, prompt, apiKey) {
      return {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.7 })
      };
    },
    extractText(json) { return json.choices[0].message.content; }
  },
  kimi: {
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    buildRequest(model, prompt, apiKey) {
      return {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.7 })
      };
    },
    extractText(json) { return json.choices[0].message.content; }
  },
  claude: {
    baseUrl: 'https://api.anthropic.com/v1/messages',
    models: ['claude-sonnet-4-20250514', 'claude-haiku-4-20250414'],
    buildRequest(model, prompt, apiKey) {
      return {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ model, max_tokens: 2048, messages: [{ role: 'user', content: prompt }] })
      };
    },
    extractText(json) { return json.content[0].text; }
  },
  doubao: {
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    models: ['doubao-pro-32k', 'doubao-lite-32k'],
    buildRequest(model, prompt, apiKey) {
      return {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.7 })
      };
    },
    extractText(json) { return json.choices[0].message.content; }
  }
};

async function callAI(prompt, timeoutMs = 30000) {
  const { provider, apiKey, model, baseUrl } = state.apiConfig;
  if (!apiKey) throw new Error('请先在设置中配置API密钥');
  const config = PROVIDER_CONFIG[provider];
  if (!config) throw new Error('未知的API提供商');

  const targetUrl = baseUrl && baseUrl.trim() ? baseUrl.trim() : config.baseUrl;
  const effectiveModel = model || config.models[0];
  const req = config.buildRequest(effectiveModel, prompt, apiKey);

  // 所有请求强制走代理，消除 CORS 问题
  const proxyUrl = 'http://112.124.108.24:3011/proxy';
  const fetchUrl = proxyUrl;
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetUrl: targetUrl,
      headers: req.headers,
      data: JSON.parse(req.body)
    })
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(fetchUrl, { ...requestOptions, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 401) throw new Error('API密钥无效，请检查你的API Key是否正确');
      if (res.status === 403) throw new Error('访问被拒绝，请检查API密钥权限或账户余额');
      if (res.status === 404) throw new Error('API地址不存在，请检查填写的地址是否正确');
      if (res.status === 429) throw new Error('请求太频繁，请稍后再试');
      if (res.status >= 500) throw new Error('服务器出错了，请稍后再试或联系服务商');
      throw new Error(`连接失败(${res.status})：${errText.slice(0, 100)}`);
    }

    const json = await res.json();
    if (json.error) {
      const errMsg = json.error.message || JSON.stringify(json.error);
      throw new Error(`API返回错误：${errMsg.slice(0, 100)}`);
    }
    return config.extractText(json);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error(`连接超时了（等了${timeoutMs / 1000}秒），可能是网络太慢或代理服务器无响应`);
    if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) throw new Error('无法连接到代理服务器，请检查网络');
    throw err;
  }
}

// 流式输出：onChunk(text片段), onDone(fullText), onError(err)
async function callAIStream(prompt, onChunk, onDone, onError, timeoutMs = 60000) {
  const { provider, apiKey, model, baseUrl } = state.apiConfig;
  if (!apiKey) { onError(new Error('请先在设置中配置API密钥')); return; }
  const config = PROVIDER_CONFIG[provider];
  if (!config) { onError(new Error('未知的API提供商')); return; }

  const targetUrl = baseUrl && baseUrl.trim() ? baseUrl.trim() : config.baseUrl;
  const effectiveModel = model || config.models[0];
  const req = config.buildRequest(effectiveModel, prompt, apiKey);

  // 强制开启 streaming
  let data = JSON.parse(req.body);
  data.stream = true;

  // 所有请求强制走代理，格式统一
  const proxyUrl = 'http://112.124.108.24:3011/proxy';
  const fetchUrl = proxyUrl;
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetUrl: targetUrl,
      headers: req.headers,
      data: data,
      stream: true
    })
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(fetchUrl, { ...requestOptions, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 401) throw new Error('API密钥无效，请检查你的API Key是否正确');
      throw new Error(`连接失败(${res.status})：${errText.slice(0, 80)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') continue;
        try {
          const json = JSON.parse(dataStr);
          // 兼容 Claude 和 OpenAI 格式
          const chunk = json.delta?.text || json.choices?.[0]?.delta?.content || '';
          if (chunk) { fullText += chunk; onChunk(chunk); }
        } catch {}
      }
    }
    onDone(fullText);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') { onError(new Error(`连接超时了（等了${timeoutMs / 1000}秒），请检查网络`)); return; }
    if (err.message === 'Failed to fetch' || err.message.includes('fetch')) { onError(new Error('无法连接到代理服务器，请检查网络')); return; }
    onError(err);
  }
}

async function testConnection() {
  const btn = document.getElementById('test-conn-btn');
  if (!btn) return;

  // 防止重复点击
  if (btn.disabled) return;

  // 显示loading状态
  const originalText = btn.textContent;
  btn.textContent = '正在连接...';
  btn.disabled = true;
  btn.style.opacity = '0.6';

  // 先保存当前表单
  saveSettingsForm();

  const cfg = state.apiConfig;

  // 检查必填项
  if (!cfg.apiKey || !cfg.apiKey.trim()) {
    connStatus = 'failed';
    connStatusDetail = '请先填写API Key';
    renderConnStatus();
    showToast('❌ 请先填写API Key');
    btn.textContent = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';
    return;
  }

  const providerName = { deepseek: 'DeepSeek', claude: 'Claude', kimi: 'Kimi', doubao: '字节豆包' }[cfg.provider] || cfg.provider;
  const modelName = cfg.model || PROVIDER_CONFIG[cfg.provider]?.models[0] || '';

  try {
    // 显示测试中状态
    connStatus = 'testing';
    connStatusDetail = '正在测试连接...';
    renderConnStatus();

    const text = await callAI('请回复"连接成功"四个字，不要其他内容。', 30000);

    // 成功
    connStatus = 'connected';
    connStatusDetail = `${providerName} · ${modelName} · 刚刚测试通过`;
    renderConnStatus();
    showToast('✅ 连接成功！可以开始使用了');
  } catch (err) {
    // 失败
    connStatus = 'failed';
    connStatusDetail = err.message.slice(0, 100);
    renderConnStatus();

    // 显示详细错误
    const shortMsg = err.message.slice(0, 50);
    showToast('❌ ' + shortMsg);

    // 在控制台输出完整错误，方便调试
    console.error('API连接测试失败:', err);
  } finally {
    // 恢复按钮状态
    btn.textContent = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

// ============================================================
// 设置
// ============================================================

// 连接状态：'unconfigured' | 'saved' | 'connected' | 'failed'
let connStatus = 'unconfigured';
let connStatusDetail = '';
function saveSettingsForm() {
  const provider = document.querySelector('input[name="provider"]:checked')?.value || 'deepseek';
  const apiKey = document.getElementById('settings-api-key').value.trim();
  const model = document.getElementById('settings-model').value.trim();
  const baseUrl = document.getElementById('settings-base-url').value.trim();
  state.apiConfig = { provider, apiKey, model, baseUrl };
  saveApiConfig();
  if (apiKey && connStatus !== 'connected') {
    connStatus = 'saved';
    connStatusDetail = '';
  } else if (!apiKey) {
    connStatus = 'unconfigured';
    connStatusDetail = '';
  }
  renderConnStatus();
  showToast('✅ 设置已保存');
}

function onProviderChange(provider) {
  const config = PROVIDER_CONFIG[provider];
  if (!config) return;
  const modelEl = document.getElementById('settings-model');
  const baseUrlEl = document.getElementById('settings-base-url');
  modelEl.value = config.models[0];
  baseUrlEl.value = config.baseUrl;
  renderModelPresets(provider);
}

function renderModelPresets(provider) {
  const config = PROVIDER_CONFIG[provider];
  if (!config) return;
  const container = document.getElementById('model-presets');
  const hintEl = document.getElementById('model-cost-hint');
  if (!container) return;

  const modelMeta = {
    'deepseek-chat':            { label: 'DeepSeek Chat', tag: '推荐', hint: '性价比极高，中文创作能力强' },
    'deepseek-reasoner':        { label: 'DeepSeek R1', tag: '更强', hint: '推理能力更强，适合复杂任务' },
    'moonshot-v1-8k':           { label: 'v1-8k',      tag: '推荐', hint: '8K上下文，适合短内容生成' },
    'moonshot-v1-32k':          { label: 'v1-32k',     tag: '长文', hint: '32K上下文，适合长文档处理' },
    'moonshot-v1-128k':         { label: 'v1-128k',    tag: '超长', hint: '128K超长上下文' },
    'claude-sonnet-4-20250514': { label: 'Sonnet 4',   tag: '推荐', hint: '性价比高，速度快' },
    'claude-haiku-4-20250414':  { label: 'Haiku 4',    tag: '省钱', hint: '最便宜，适合大量生成' },
    'doubao-pro-32k':           { label: 'Pro 32k',    tag: '推荐', hint: '效果好，32K上下文' },
    'doubao-lite-32k':          { label: 'Lite 32k',   tag: '省钱', hint: '更轻量，成本更低' },
  };

  const currentModel = document.getElementById('settings-model')?.value || config.models[0];

  container.innerHTML = config.models.map(m => {
    const meta = modelMeta[m] || { label: m, tag: '', hint: '' };
    const isActive = m === currentModel;
    return `<button type="button" onclick="selectModelPreset('${m}')"
      class="px-3 py-1.5 text-xs rounded-lg border transition-all ${isActive ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-700 hover:border-gray-500'}">
      ${meta.label}${meta.tag ? ` <span class="opacity-60">${meta.tag}</span>` : ''}
    </button>`;
  }).join('');

  // 更新 hint
  const activeMeta = modelMeta[currentModel];
  if (hintEl) hintEl.textContent = activeMeta?.hint || '';
}

function selectModelPreset(model) {
  const modelEl = document.getElementById('settings-model');
  if (modelEl) modelEl.value = model;
  const provider = document.querySelector('input[name="provider"]:checked')?.value || 'claude';
  renderModelPresets(provider);
}

function renderConnStatus() {
  const card = document.getElementById('conn-status-card');
  const dot = document.getElementById('conn-status-dot');
  const title = document.getElementById('conn-status-title');
  const desc = document.getElementById('conn-status-desc');
  const disconnectBtn = document.getElementById('disconnect-btn');
  const clearBtn = document.getElementById('clear-settings-btn');

  const cfg = state.apiConfig;
  const providerName = { deepseek: 'DeepSeek', claude: 'Claude', kimi: 'Kimi', doubao: '字节豆包' }[cfg.provider] || cfg.provider;
  const modelName = cfg.model || PROVIDER_CONFIG[cfg.provider]?.models[0] || '';

  const statusMap = {
    unconfigured: {
      border: 'border-gray-200 bg-gray-50',
      dot: 'bg-gray-300',
      titleText: '未配置',
      descText: '请填写API Key并保存，然后点击"测试连接"验证',
    },
    saved: {
      border: 'border-yellow-200 bg-yellow-50',
      dot: 'bg-yellow-400',
      titleText: '已保存，未测试',
      descText: `${providerName} · ${modelName} · 点击"测试连接"验证是否可用`,
    },
    testing: {
      border: 'border-blue-200 bg-blue-50',
      dot: 'bg-blue-400 animate-pulse',
      titleText: '正在测试连接...',
      descText: `${providerName} · ${modelName} · 请稍候`,
    },
    connected: {
      border: 'border-green-200 bg-green-50',
      dot: 'bg-green-500',
      titleText: '✅ 已连接',
      descText: connStatusDetail || `${providerName} · ${modelName}`,
    },
    failed: {
      border: 'border-red-200 bg-red-50',
      dot: 'bg-red-500',
      titleText: '❌ 连接失败',
      descText: connStatusDetail || '请检查API Key和网络连接',
    },
  };

  const s = statusMap[connStatus] || statusMap.unconfigured;

  // 设置页状态卡片
  if (card) {
    card.className = `mb-6 max-w-2xl rounded-xl border p-4 flex items-center gap-4 transition-all ${s.border}`;
    dot.className = `w-3 h-3 rounded-full shrink-0 ${s.dot}`;
    title.textContent = s.titleText;
    desc.textContent = s.descText;
    const hasKey = !!cfg.apiKey;
    disconnectBtn?.classList.toggle('hidden', !hasKey || connStatus === 'unconfigured');
    clearBtn?.classList.toggle('hidden', !hasKey);
  }

  // 侧边栏全局状态
  const sidebarDot = document.getElementById('sidebar-conn-dot');
  const sidebarText = document.getElementById('sidebar-conn-text');
  const sidebarSub = document.getElementById('sidebar-conn-sub');
  if (sidebarDot && sidebarText) {
    const dotColorMap = {
      unconfigured: 'bg-gray-300',
      saved: 'bg-yellow-400',
      testing: 'bg-blue-400 animate-pulse',
      connected: 'bg-green-500',
      failed: 'bg-red-500'
    };
    sidebarDot.className = `w-2 h-2 rounded-full shrink-0 ${dotColorMap[connStatus] || 'bg-gray-300'}`;
    const textMap = {
      unconfigured: '未配置 API',
      saved: '已保存，未测试',
      testing: '正在测试...',
      connected: '✅ 已连接',
      failed: '❌ 连接失败'
    };
    sidebarText.textContent = textMap[connStatus] || '未配置 API';
    if (connStatus === 'connected' && sidebarSub) {
      sidebarSub.textContent = `${providerName} · ${modelName}`;
      sidebarSub.classList.remove('hidden');
    } else if (sidebarSub) {
      sidebarSub.classList.add('hidden');
    }
  }
}

function disconnectApi() {
  connStatus = 'unconfigured';
  connStatusDetail = '';
  renderConnStatus();
  showToast('已断开连接（Key仍保留，可重新测试）');
}

function clearApiSettings() {
  if (!confirm('确定清除所有API设置？')) return;
  state.apiConfig = { provider: 'deepseek', apiKey: '', model: 'deepseek-chat', baseUrl: '' };
  saveApiConfig();
  connStatus = 'unconfigured';
  connStatusDetail = '';
  renderSettingsForm();
  renderConnStatus();
  showToast('✅ 已清除API设置');
}

function renderSettingsForm() {
  const cfg = state.apiConfig;
  const radio = document.querySelector(`input[name="provider"][value="${cfg.provider}"]`);
  if (radio) radio.checked = true;
  const apiKeyEl = document.getElementById('settings-api-key');
  const modelEl = document.getElementById('settings-model');
  const baseUrlEl = document.getElementById('settings-base-url');
  if (apiKeyEl) apiKeyEl.value = cfg.apiKey || '';
  if (modelEl) modelEl.value = cfg.model || PROVIDER_CONFIG[cfg.provider]?.models[0] || '';
  if (baseUrlEl) baseUrlEl.value = cfg.baseUrl || '';

  // 初始化连接状态
  if (!cfg.apiKey) connStatus = 'unconfigured';
  else if (connStatus === 'unconfigured') connStatus = 'saved';

  renderModelPresets(cfg.provider);
  renderConnStatus();
}
function renderAll() {
  renderIpSelector();
  renderIpForm();
  renderKnowledgeList();
  renderTopicList();
  renderDraftHistory();
  renderCreateHeader();
  renderConnStatus();
}

function renderIpSelector() {
  const sel = document.getElementById('ip-selector');
  if (!sel) return;
  sel.innerHTML = state.ipList.map(ip =>
    `<option value="${ip.id}" ${ip.id === state.currentIpId ? 'selected' : ''}>${ip.name}</option>`
  ).join('');
}

function renderIpForm() {
  const ip = currentIp();
  if (!ip) return;
  const nameEl = document.getElementById('ip-name');
  const fieldEl = document.getElementById('ip-field');
  const audienceEl = document.getElementById('ip-audience');
  if (nameEl) nameEl.value = ip.name || '';
  if (fieldEl) fieldEl.value = ip.field || '';
  if (audienceEl) audienceEl.value = ip.audience || '';
  const styleRadio = document.querySelector(`input[name="ip-style"][value="${ip.style || 'professional'}"]`);
  if (styleRadio) styleRadio.checked = true;
  updateStyleTags('ip-style');
}

function renderKnowledgeList() {
  const list = document.getElementById('knowledge-list');
  if (!list) return;
  const items = currentKnowledge();
  if (items.length === 0) {
    list.innerHTML = '<p class="text-sm text-gray-400 py-4 text-center">暂无知识条目，在下方添加</p>';
    return;
  }
  list.innerHTML = items.map(item => `
    <div class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex-1 min-w-0">
        <div class="font-medium text-sm text-gray-900 mb-1">${escHtml(item.title)}</div>
        <div class="text-sm text-gray-600 line-clamp-2">${escHtml(item.content.slice(0, 120))}${item.content.length > 120 ? '...' : ''}</div>
      </div>
      <div class="flex gap-2 shrink-0">
        <button onclick="editKnowledgeItem('${item.id}')" class="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded border border-gray-200 hover:border-gray-400 transition-colors">编辑</button>
        <button onclick="deleteKnowledgeItem('${item.id}')" class="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded border border-red-200 hover:border-red-400 transition-colors">删除</button>
      </div>
    </div>
  `).join('');
}

function highlightText(text, query) {
  if (!query) return escHtml(text);
  const escaped = escHtml(text);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(new RegExp(escapedQuery, 'gi'), m => `<mark class="bg-yellow-200 rounded">${m}</mark>`);
}

function renderTopicList() {
  const list = document.getElementById('topic-list');
  const countEl = document.getElementById('topic-count');
  if (!list) return;

  let topics = currentTopics();

  // 平台筛选
  if (topicPlatformFilter !== 'all') topics = topics.filter(t => t.platform === topicPlatformFilter);
  // 格式筛选
  if (topicFormatFilter !== 'all') topics = topics.filter(t => t.format === topicFormatFilter);
  // 收藏筛选
  if (topicStarredFilter) topics = topics.filter(t => t.starred);
  // 时间筛选
  if (topicTimeFilter !== 'all') {
    const now = new Date();
    topics = topics.filter(t => {
      const d = new Date(t.createdAt);
      if (topicTimeFilter === 'today') {
        return d.toDateString() === now.toDateString();
      } else if (topicTimeFilter === 'week') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      } else if (topicTimeFilter === 'month') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      return true;
    });
  }
  // 全文搜索
  if (topicSearch) {
    const q = topicSearch.toLowerCase();
    topics = topics.filter(t =>
      t.title.toLowerCase().includes(q) || (t.reason || '').toLowerCase().includes(q)
    );
  }

  // 收藏置顶
  const sorted = [...topics].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));

  if (countEl) countEl.textContent = `共 ${sorted.length} 条`;

  if (sorted.length === 0) {
    const msg = (topicSearch || topicPlatformFilter !== 'all' || topicFormatFilter !== 'all' || topicStarredFilter || topicTimeFilter !== 'all')
      ? '当前筛选条件下没有选题'
      : '还没有选题，点击上方"生成一批选题"按钮';
    list.innerHTML = `<div class="col-span-3 py-12 text-center text-sm text-gray-400">${msg}</div>`;
    return;
  }

  list.innerHTML = sorted.map(topic => {
    const isXhs = topic.platform === 'xiaohongshu';
    const platformLabel = isXhs ? '小红书' : '抖音';
    const platformColor = isXhs ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200';
    const formatColor = topic.format === '口播' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    return `
    <div class="bg-white rounded-xl border ${topic.starred ? 'border-yellow-300' : 'border-gray-200'} shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex gap-1.5 flex-wrap">
          <span class="inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${platformColor}">${platformLabel}</span>
          <span class="inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${formatColor}">${topic.format}</span>
        </div>
        <div class="flex gap-1.5 shrink-0">
          <button onclick="starTopic('${topic.id}')" class="text-lg leading-none ${topic.starred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'} transition-colors" title="${topic.starred ? '取消收藏' : '收藏'}">★</button>
          <button onclick="deleteTopic('${topic.id}')" class="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none" title="删除">×</button>
        </div>
      </div>
      <div class="font-medium text-gray-900 mb-2 leading-snug flex-1">${highlightText(topic.title, topicSearch)}</div>
      ${topic.reason ? `<div class="text-xs text-gray-500 mb-3 leading-relaxed">${highlightText(topic.reason, topicSearch)}</div>` : ''}
      <button onclick="useTopic('${topic.id}')" class="w-full mt-auto py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">用此话题创作 →</button>
    </div>`;
  }).join('');
}

function renderCreateHeader() {
  const el = document.getElementById('create-header-info');
  if (!el) return;
  const ip = currentIp();
  const topic = state.topicList.find(t => t.id === selectedTopicId);
  const platformLabel = createPlatform === 'xiaohongshu' ? '小红书' : '抖音';
  el.innerHTML = `
    <div class="flex flex-wrap gap-3 text-sm">
      <span class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
        <span class="text-gray-500">IP</span>
        <span class="font-medium text-gray-900">${escHtml(ip?.name || '未设定')}</span>
      </span>
      <span class="flex items-center gap-1.5 px-3 py-1.5 ${topic ? 'bg-blue-50' : 'bg-gray-100'} rounded-lg">
        <span class="text-gray-500">话题</span>
        <span class="font-medium ${topic ? 'text-blue-800' : 'text-gray-400'}">${topic ? escHtml(topic.title.slice(0, 24) + (topic.title.length > 24 ? '...' : '')) : '未选择 — 请先去选题库选择'}</span>
      </span>
      <span class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
        <span class="text-gray-500">平台</span>
        <span class="font-medium text-gray-900">${platformLabel}</span>
      </span>
      <span class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
        <span class="text-gray-500">格式</span>
        <span class="font-medium text-gray-900">${createFormat}</span>
      </span>
    </div>
  `;

  // 根据格式切换参数面板
  const durationPanel = document.getElementById('param-duration');
  const wordcountPanel = document.getElementById('param-wordcount');
  const genBtn = document.getElementById('generate-btn');
  if (createFormat === '图文') {
    durationPanel?.classList.add('hidden');
    wordcountPanel?.classList.remove('hidden');
    if (genBtn) genBtn.textContent = '生成图文脚本';
  } else {
    durationPanel?.classList.remove('hidden');
    wordcountPanel?.classList.add('hidden');
    if (genBtn) genBtn.textContent = '生成口播脚本';
  }
}

// 历史记录筛选状态：'current'=当前IP, 'all'=全部
let historyFilter = 'current';

function setHistoryFilter(filter) {
  historyFilter = filter;
  document.getElementById('history-filter-current')?.classList.toggle('bg-gray-900', filter === 'current');
  document.getElementById('history-filter-current')?.classList.toggle('text-white', filter === 'current');
  document.getElementById('history-filter-current')?.classList.toggle('border-gray-300', filter !== 'current');
  document.getElementById('history-filter-current')?.classList.toggle('text-gray-700', filter !== 'current');
  document.getElementById('history-filter-all')?.classList.toggle('bg-gray-900', filter === 'all');
  document.getElementById('history-filter-all')?.classList.toggle('text-white', filter === 'all');
  document.getElementById('history-filter-all')?.classList.toggle('border-gray-300', filter !== 'all');
  document.getElementById('history-filter-all')?.classList.toggle('text-gray-700', filter !== 'all');
  renderDraftHistory();
}

function deleteDraft(id) {
  if (!confirm('确定删除这条历史记录？')) return;
  state.draftHistory = state.draftHistory.filter(d => d.id !== id);
  saveDraftHistory();
  renderDraftHistory();
}

function renderDraftHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;

  const drafts = historyFilter === 'current'
    ? state.draftHistory.filter(d => d.ipId === state.currentIpId)
    : state.draftHistory;

  if (drafts.length === 0) {
    const msg = historyFilter === 'current' ? '当前IP暂无历史记录' : '暂无历史记录';
    list.innerHTML = `<div class="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">${msg}</div>`;
    return;
  }

  list.innerHTML = drafts.map(draft => {
    const isXhs = draft.platform === 'xiaohongshu';
    const platformLabel = isXhs ? '小红书' : '抖音';
    const platformColor = isXhs
      ? 'bg-red-100 text-red-700 border border-red-200'
      : 'bg-blue-100 text-blue-700 border border-blue-200';
    const formatColor = draft.format === '口播'
      ? 'bg-purple-100 text-purple-700 border border-purple-200'
      : 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    const date = new Date(draft.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const paramLabel = draft.format === '图文'
      ? `约${draft.wordCount}字`
      : `${draft.duration}秒·约${draft.wordCount}字`;
    return `
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1 min-w-0 pr-4">
          <div class="font-semibold text-gray-900 mb-2 leading-snug">${escHtml(draft.topicTitle || '未知话题')}</div>
          <div class="flex flex-wrap gap-1.5 items-center">
            <span class="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">${escHtml(draft.ipName || '未知IP')}</span>
            <span class="inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${platformColor}">${platformLabel}</span>
            <span class="inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${formatColor}">${draft.format}</span>
            <span class="text-xs text-gray-400">${paramLabel}</span>
            <span class="text-xs text-gray-400">· ${date}</span>
          </div>
        </div>
        <div class="flex gap-2 shrink-0">
          <button onclick="copyDraftById('${draft.id}')" class="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">复制</button>
          <button onclick="deleteDraft('${draft.id}')" class="text-sm px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">删除</button>
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed max-h-36 overflow-hidden">${escHtml(draft.content.slice(0, 400))}${draft.content.length > 400 ? '...' : ''}</div>
    </div>`;
  }).join('');
}

// ============================================================
// 导航
// ============================================================
function switchSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(i => {
    i.classList.remove('text-gray-900', 'bg-gray-100', 'font-medium');
    i.classList.add('text-gray-600');
  });
  const sectionEl = document.getElementById(`${section}-section`);
  if (sectionEl) sectionEl.classList.remove('hidden');
  const navEl = document.querySelector(`[data-section="${section}"]`);
  if (navEl) {
    navEl.classList.remove('text-gray-600');
    navEl.classList.add('text-gray-900', 'bg-gray-100', 'font-medium');
  }
  if (section === 'create') renderCreateHeader();
  if (section === 'history') renderDraftHistory();
}

// ============================================================
// 工具函数
// ============================================================
function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50 transition-opacity';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

function copyDraftById(id) {
  const draft = state.draftHistory.find(d => d.id === id);
  if (draft) navigator.clipboard.writeText(draft.content).then(() => showToast('✅ 已复制'));
}

function updateStyleTags(name) {
  document.querySelectorAll(`.style-tag-${name}`).forEach(label => {
    const input = label.querySelector('input');
    const span = label.querySelector('span');
    if (!input || !span) return;
    if (input.checked) {
      span.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-200');
      span.classList.remove('border-gray-300', 'text-gray-700');
    } else {
      span.classList.remove('bg-blue-50', 'text-blue-700', 'border-blue-200');
      span.classList.add('border-gray-300', 'text-gray-700');
    }
  });
}

// ============================================================
// 初始化
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  renderWorkspaceInfo();
  loadState();
  renderAll();
  renderSettingsForm();

  // IP选择器切换
  document.getElementById('ip-selector')?.addEventListener('change', e => {
    switchIp(e.target.value);
  });

  // 风格标签点击效果
  document.querySelectorAll('.style-tag-ip-style').forEach(label => {
    label.addEventListener('click', () => setTimeout(() => updateStyleTags('ip-style'), 0));
  });
});
