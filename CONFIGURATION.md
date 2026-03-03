# 配置指南

## 环境变量配置

### 1. 复制环境变量模板

```bash
cp .env.example .env.local
```

### 2. 配置 Anthropic API

编辑 `.env.local` 文件，填入你的 API Key：

```env
ANTHROPIC_API_KEY=your_actual_api_key_here
```

**获取 API Key：**
- 访问 [Anthropic Console](https://console.anthropic.com/)
- 注册/登录账号
- 创建 API Key

**使用中转服务（可选）：**

如果你使用 API 中转服务，可以配置 Base URL：

```env
ANTHROPIC_BASE_URL=https://your-proxy-url.com
```

### 3. 数据库配置

**开发环境（默认）：**

使用 SQLite，无需额外配置：

```env
DATABASE_URL="file:./dev.db"
```

**生产环境（推荐）：**

使用 PostgreSQL 以支持更多并发用户：

```env
DATABASE_URL="postgresql://username:password@host:5432/database"
```

### 4. 应用配置

```env
# 应用名称
NEXT_PUBLIC_APP_NAME=灵感引擎

# 应用 URL（用于生成链接）
NEXT_PUBLIC_APP_URL=http://localhost:3009
```

## 部署配置

### Vercel 部署

1. 在 Vercel 导入项目
2. 在 Environment Variables 中添加：
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL`（使用 Vercel Postgres）
3. 部署

### Docker 部署

```bash
# 构建镜像
docker build -t inspiration-engine .

# 运行容器
docker run -p 3009:3009 \
  -e ANTHROPIC_API_KEY=your_key \
  -e DATABASE_URL=your_db_url \
  inspiration-engine
```

### 服务器部署

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env.local
# 编辑 .env.local
```

3. 初始化数据库：
```bash
npx prisma migrate deploy
npx prisma generate
```

4. 构建项目：
```bash
npm run build
```

5. 启动服务：
```bash
npm start
```

## 安全建议

1. **不要提交 .env.local 到 Git**
   - 已在 .gitignore 中配置
   - 确保敏感信息不会泄露

2. **定期更换 API Key**
   - 如果怀疑泄露，立即更换

3. **使用环境变量**
   - 不要在代码中硬编码敏感信息

4. **生产环境使用 HTTPS**
   - 保护数据传输安全

5. **限制 API 访问**
   - 在 Anthropic Console 设置 API 使用限制

## 常见问题

### Q: API Key 无效？

A: 检查：
1. Key 是否正确复制（无多余空格）
2. Key 是否已激活
3. 账户是否有余额

### Q: 数据库连接失败？

A: 检查：
1. DATABASE_URL 格式是否正确
2. 数据库服务是否运行
3. 网络连接是否正常

### Q: 如何切换到生产数据库？

A: 
1. 准备 PostgreSQL 数据库
2. 更新 `DATABASE_URL`
3. 运行 `npx prisma migrate deploy`
4. 重启应用

## 更多帮助

- [Prisma 文档](https://www.prisma.io/docs)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)
- [Anthropic API 文档](https://docs.anthropic.com/)
