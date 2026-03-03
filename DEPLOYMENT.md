# 部署指南

## 环境要求

- Node.js 18+
- npm 或 pnpm
- 支持 SQLite 的服务器（或使用 PostgreSQL/MySQL）

## 环境变量配置

创建 `.env.production` 文件：

```env
# 数据库配置
DATABASE_URL="file:./prod.db"

# Anthropic API Key（必需）
ANTHROPIC_API_KEY="your_anthropic_api_key_here"

# 应用配置
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Session 密钥（建议生成随机字符串）
SESSION_SECRET="your_random_secret_key_here"
```

## 本地构建测试

```bash
# 1. 安装依赖
npm install

# 2. 生成 Prisma Client
npx prisma generate

# 3. 初始化数据库
npm run db:init

# 4. 构建项目
npm run build

# 5. 启动生产服务器
npm start
```

## Vercel 部署（推荐）

### 1. 准备工作

- 将代码推送到 GitHub
- 注册 Vercel 账号

### 2. 部署步骤

1. 在 Vercel 导入 GitHub 仓库
2. 配置环境变量：
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL`（使用 Vercel Postgres）
3. 点击 Deploy

### 3. 数据库配置

**注意：** SQLite 在 Vercel 上是只读的，需要使用 Vercel Postgres 或其他云数据库。

#### 使用 Vercel Postgres

```bash
# 安装 Vercel CLI
npm i -g vercel

# 创建 Postgres 数据库
vercel postgres create

# 链接到项目
vercel link

# 拉取环境变量
vercel env pull .env.local
```

修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}
```

运行迁移：

```bash
npx prisma migrate deploy
```

## 其他部署平台

### Railway

1. 连接 GitHub 仓库
2. 添加 PostgreSQL 插件
3. 配置环境变量
4. 自动部署

### Render

1. 创建 Web Service
2. 连接 GitHub 仓库
3. 添加 PostgreSQL 数据库
4. 配置环境变量
5. 部署

## 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 用户注册/登录功能正常
- [ ] 邀请码系统工作正常
- [ ] AI 功能可以正常调用
- [ ] 数据库读写正常
- [ ] 反馈功能正常
- [ ] 移动端显示正常

## 性能优化建议

1. **启用 CDN**
   - 静态资源使用 CDN 加速
   - 图片使用 Next.js Image 组件

2. **数据库优化**
   - 添加必要的索引
   - 定期备份数据

3. **监控和日志**
   - 使用 Vercel Analytics
   - 配置错误监控（Sentry）

## 安全建议

1. **环境变量**
   - 不要将 API Key 提交到代码仓库
   - 使用强密码和随机密钥

2. **API 限流**
   - 添加 API 调用频率限制
   - 防止恶意请求

3. **HTTPS**
   - 确保使用 HTTPS
   - 配置 HSTS

## 故障排查

### 数据库连接失败

```bash
# 检查数据库 URL
echo $DATABASE_URL

# 测试连接
npx prisma db push
```

### API 调用失败

- 检查 ANTHROPIC_API_KEY 是否正确
- 检查 API 配额是否用完
- 查看服务器日志

### 构建失败

```bash
# 清除缓存
rm -rf .next node_modules
npm install
npm run build
```

## 备份和恢复

### 备份数据库

```bash
# SQLite
cp prod.db prod.db.backup

# PostgreSQL
pg_dump $DATABASE_URL > backup.sql
```

### 恢复数据库

```bash
# SQLite
cp prod.db.backup prod.db

# PostgreSQL
psql $DATABASE_URL < backup.sql
```

## 更新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
npm install

# 3. 运行数据库迁移
npx prisma migrate deploy

# 4. 重新构建
npm run build

# 5. 重启服务
pm2 restart app
```

## 联系支持

如有问题，请提交 Issue 或通过反馈功能联系我们。
