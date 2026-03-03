# 安全措施

本项目实施了多层安全措施，保护用户数据和系统资源。

## 1. API 限流

### 限流策略

为防止 API 滥用，我们对关键接口实施了限流：

| 接口类型 | 限制 | 说明 |
|---------|------|------|
| AI 生成 | 5次/分钟 | 防止 API 成本过高 |
| 登录 | 5次/分钟 | 防止暴力破解 |
| 注册 | 3次/小时 | 防止批量注册 |
| 反馈提交 | 10次/小时 | 防止垃圾信息 |
| 一般 API | 30次/分钟 | 基础保护 |

### 限流实现

- 使用内存存储（开发环境）
- 基于 IP 地址或用户 ID
- 超过限制返回 429 状态码
- 提供 Retry-After 头部

### 生产环境建议

生产环境建议使用 Redis 实现分布式限流：

```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function rateLimit(key: string, limit: number, window: number) {
  const current = await redis.incr(key)
  if (current === 1) {
    await redis.expire(key, window)
  }
  return current <= limit
}
```

## 2. 数据隔离

### 用户数据隔离

- 所有查询都包含 `userId` 过滤
- 使用 Prisma 的关系查询确保数据安全
- 禁止跨用户访问数据

### 权限检查

```typescript
// ✅ 正确：包含用户过滤
const content = await prisma.content.findFirst({
  where: { id, userId: user.id }
})

// ❌ 错误：缺少用户过滤
const content = await prisma.content.findFirst({
  where: { id }
})
```

## 3. 身份验证

### Session 管理

- 使用 HTTP-only Cookie
- 7 天过期时间
- 生产环境启用 Secure 标志

### 密码安全

⚠️ **当前实现**：使用 Base64 编码（仅用于演示）

🔒 **生产环境建议**：使用 bcrypt

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

```typescript
import bcrypt from 'bcrypt'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

## 4. 输入验证

### API 输入验证

- 验证必填字段
- 检查数据类型
- 限制字符串长度
- 过滤特殊字符

### 示例

```typescript
// 验证邮箱格式
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
}

// 限制内容长度
if (content.length > 10000) {
  return NextResponse.json({ error: '内容过长' }, { status: 400 })
}
```

## 5. SQL 注入防护

使用 Prisma ORM 自动防止 SQL 注入：

```typescript
// ✅ 安全：Prisma 自动转义
await prisma.user.findFirst({
  where: { email: userInput }
})

// ❌ 危险：原始 SQL
await prisma.$queryRaw`SELECT * FROM User WHERE email = ${userInput}`
```

## 6. XSS 防护

### 前端

- React 自动转义输出
- 避免使用 `dangerouslySetInnerHTML`
- 使用 Content Security Policy

### 后端

- 验证和清理用户输入
- 设置正确的 Content-Type
- 使用 HTTP 安全头部

## 7. CSRF 防护

Next.js 自动提供 CSRF 保护：

- 使用 SameSite Cookie
- 验证 Origin 头部
- 使用 CSRF Token（如需要）

## 8. 环境变量安全

### 敏感信息保护

- ✅ 使用 `.env.local` 存储密钥
- ✅ 添加到 `.gitignore`
- ✅ 提供 `.env.example` 模板
- ❌ 不要在代码中硬编码

### 生产环境

- 使用环境变量管理服务
- 定期轮换密钥
- 限制访问权限

## 9. 日志和监控

### 活动日志

- 记录关键操作（登录、AI 调用等）
- 包含 IP 地址和 User-Agent
- 记录错误和异常

### 监控建议

- 监控 API 调用频率
- 追踪异常错误率
- 设置告警阈值

## 10. 安全检查清单

部署前检查：

- [ ] 所有 API 都有身份验证
- [ ] 关键接口已添加限流
- [ ] 密码使用 bcrypt 加密
- [ ] 环境变量已正确配置
- [ ] 数据库查询包含用户过滤
- [ ] 启用 HTTPS
- [ ] 设置安全头部
- [ ] 定期备份数据库
- [ ] 监控系统已配置
- [ ] 错误日志已启用

## 报告安全问题

如果发现安全漏洞，请通过以下方式报告：

- 邮箱：security@example.com
- 不要公开披露，直到问题修复

## 更新日志

- 2026-03-03: 添加 API 限流
- 2026-03-03: 实现数据隔离
- 2026-03-03: 添加活动日志
