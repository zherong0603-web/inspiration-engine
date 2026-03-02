# 用户认证系统使用说明

## 功能概述

已为 IP 内容生成平台添加完整的用户认证系统，包括：

✅ 用户注册（支持邀请码）
✅ 用户登录
✅ 会话管理
✅ 路由保护
✅ 用户账号管理

## 初始邀请码

系统已预置 10 个邀请码供测试使用：

```
WELCOME1
WELCOME2
WELCOME3
WELCOME4
WELCOME5
BETA2026
CREATOR1
CREATOR2
CREATOR3
CREATOR4
```

**注意**：邀请码是可选的，用户可以直接注册，无需邀请码。

## 使用流程

### 1. 注册新用户

访问 `http://localhost:3000/login`，点击"注册"标签：

- 输入邮箱（必填）
- 输入密码（至少6个字符，必填）
- 输入用户名（可选）
- 输入邀请码（可选）

注册成功后会自动登录并跳转到首页。

### 2. 登录

访问 `http://localhost:3000/login`：

- 输入邮箱
- 输入密码

登录成功后跳转到首页。

### 3. 查看账号信息

访问 `http://localhost:3000/account` 可以：

- 查看个人信息
- 复制自己的邀请码（分享给朋友）
- 退出登录

### 4. 数据隔离

每个用户的数据完全隔离：

- IP 身份配置
- 内容库
- 创作历史

用户只能看到和管理自己的数据。

## 技术实现

### 数据库模型

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String   // 加密后的密码
  name          String?
  inviteCode    String?  @unique // 用户的邀请码
  invitedBy     String?  // 被谁邀请
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  ipProfiles    IPProfile[]
  contents      Content[]
  creations     Creation[]
}

model InviteCode {
  id          String   @id @default(cuid())
  code        String   @unique
  createdBy   String?
  usedBy      String?
  isUsed      Boolean  @default(false)
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### API 端点

- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户信息

### 路由保护

使用 Next.js Middleware 保护所有路由：

- 未登录用户访问任何页面都会被重定向到登录页
- 已登录用户访问登录页会被重定向到首页
- 公开路由：`/login`、`/api/auth/*`

## 管理邀请码

### 查看所有邀请码

```bash
cd ~/ip-content-platform
npx prisma studio
```

在 Prisma Studio 中可以查看和管理所有邀请码。

### 创建新邀请码

可以通过 Prisma Studio 手动创建，或者运行脚本：

```bash
npx tsx scripts/init-invites.ts
```

### 邀请码规则

- 8位大写字母和数字组合
- 每个邀请码只能使用一次
- 可设置过期时间（可选）
- 用户注册后会自动获得自己的邀请码

## 安全注意事项

⚠️ **当前实现使用简单的 Base64 编码存储密码，仅供开发测试使用。**

**生产环境部署前必须：**

1. 安装 bcrypt：
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

2. 更新 `lib/auth.ts` 中的密码加密函数：
```typescript
import bcrypt from 'bcrypt'

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}
```

3. 设置环境变量：
```env
SESSION_SECRET=your-random-secret-key
```

4. 考虑使用 HTTPS
5. 添加速率限制
6. 添加邮箱验证

## 下一步优化建议

- [ ] 使用 bcrypt 加密密码
- [ ] 添加邮箱验证
- [ ] 添加忘记密码功能
- [ ] 添加用户头像
- [ ] 添加用户资料编辑
- [ ] 添加邀请统计（查看通过自己邀请码注册的用户）
- [ ] 添加管理员后台
- [ ] 添加速率限制防止暴力破解
