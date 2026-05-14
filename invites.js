// ============================================================
// 邀请码数据管理（统一读写 localStorage，管理页和登录页共用）
// 唯一 localStorage key：linggan_invites
// ============================================================

const INVITE_STORAGE_KEY = 'linggan_invites';

// 内置初始邀请码（作为种子数据，首次运行时写入 localStorage）
const SEED_INVITE_CODES = [
  {
    inviteCode: 'BETA-A01',
    userId: 'userA',
    workspaceId: 'ws_userA',
    status: 'active',
    expiresAt: null,
    note: '首批内测用户A',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    inviteCode: 'BETA-B01',
    userId: 'userB',
    workspaceId: 'ws_userB',
    status: 'active',
    expiresAt: null,
    note: '首批内测用户B',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    inviteCode: 'BETA-C01',
    userId: 'userC',
    workspaceId: 'ws_userC',
    status: 'active',
    expiresAt: null,
    note: '首批内测用户C',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

// 读取邀请码列表（localStorage 优先，首次写入种子数据）
function getAllInviteCodes() {
  const raw = localStorage.getItem(INVITE_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // 数据损坏，重置
      console.warn('[invites] localStorage 数据损坏，重置为种子数据');
    }
  }
  // 首次或数据损坏：把种子数据写入 localStorage
  localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(SEED_INVITE_CODES));
  return JSON.parse(JSON.stringify(SEED_INVITE_CODES)); // 返回深拷贝
}

// 保存邀请码列表（写入 localStorage）
function saveAllInviteCodes(list) {
  localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(list));
}

// 验证邀请码（从 localStorage 读取，管理页修改后立即生效）
function validateInviteCode(code) {
  const list = getAllInviteCodes();
  const invite = list.find(i => i.inviteCode === code);
  if (!invite) return { valid: false, error: '邀请码不存在' };
  if (invite.status !== 'active') return { valid: false, error: '邀请码已停用' };
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return { valid: false, error: '邀请码已过期' };
  }
  return { valid: true, data: invite };
}
