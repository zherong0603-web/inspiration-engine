# IP 内容生成平台

帮助 IP（个人品牌）生成短视频内容的工具，核心功能包括：
- IP 身份管理（第二大脑）
- 内容库管理
- 基于历史内容的二次创作
- 逐字稿优化

## 技术栈

- **前端**: Next.js 14 (App Router) + React + TailwindCSS
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **AI**: Anthropic Claude API (claude-sonnet-4-6)

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd ip-content-platform
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，添加你的 Anthropic API Key：

```env
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL="file:./dev.db"
```

### 4. 初始化数据库

```bash
# 推送数据库 schema
npx prisma db push

# 生成 Prisma Client
npx prisma generate

# 添加示例数据（可选）
npm run db:seed
```

### 5. 启动开发服务器

# 生成 Prisma Client
npx prisma generate

# 初始化管理员账号和邀请码
npm run db:init
```

初始化后会显示管理员账号信息和邀请码。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3009

## 演示账号

如果运行了 `npm run db:seed`，可以使用以下演示账号快速体验：

- **邮箱**: demo@example.com
- **密码**: demo123456

演示账号包含：
- ✅ 完整的 IP 身份设置
- ✅ 3 条示例内容
- ✅ 2 条示例选题
- ✅ 默认分类和内容类型

### 6. 注册账号

使用初始化脚本生成的邀请码注册新账号，或使用管理员账号登录。

## 部署

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 功能说明

### 1. IP 身份设置 (`/ip-profile`)
- 设置 IP 名称、简介
- 定义 IP 人设（性格、价值观、说话风格）
- 设置擅长领域和话题标签
- 定义内容风格偏好

### 2. 内容库 (`/content-library`)
- 添加、查看、编辑、删除内容
- 按分类筛选（职场/家庭/生活/学习/其他）
- 搜索功能
- 支持添加标签和逐字稿

### 3. 内容创作 (`/create`)
- 选择历史内容作为参考（支持多选）
- 输入创作意图
- AI 生成新的短视频脚本
- 保存生成结果到内容库

### 4. 内容优化 (`/optimize`)
- 输入视频逐字稿
- 选择优化目标（更口语化/更专业/增加金句等）
- AI 优化内容
- 对比原文和优化后的版本
- 保存优化结果

## 项目结构

```
ip-content-platform/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── ip/           # IP 配置 API
│   │   ├── content/      # 内容管理 API
│   │   ├── ai/           # AI 服务 API
│   │   └── creation/     # 创作历史 API
│   ├── ip-profile/       # IP 设置页面
│   ├── content-library/  # 内容库页面
│   ├── create/           # 内容创作页面
│   └── optimize/         # 内容优化页面
├── lib/                   # 工具库
│   ├── db.ts             # Prisma 客户端
│   ├── ai.ts             # Claude API 封装
│   └── utils.ts          # 工具函数
├── types/                 # TypeScript 类型
├── prisma/               # 数据库
│   └── schema.prisma     # 数据库模型
└── components/           # React 组件（待扩展）
```

## 数据库模型

### IPProfile - IP 身份配置
- name: IP 名称
- description: IP 简介
- persona: IP 人设
- style: 内容风格
- topics: 擅长话题

### Content - 内容库
- title: 标题
- category: 分类
- type: 类型
- content: 内容正文
- transcript: 逐字稿
- tags: 标签

### Creation - 创作历史
- sourceIds: 源内容 ID
- prompt: 创作提示词
- result: 生成结果
- type: 创作类型
- status: 状态

## API 端点

### IP 相关
- `GET /api/ip` - 获取 IP 配置
- `POST /api/ip` - 创建/更新 IP 配置

### 内容管理
- `GET /api/content` - 获取内容列表
- `POST /api/content` - 创建内容
- `GET /api/content/[id]` - 获取内容详情
- `PUT /api/content/[id]` - 更新内容
- `DELETE /api/content/[id]` - 删除内容

### AI 服务
- `POST /api/ai/create` - 内容二创
- `POST /api/ai/optimize` - 逐字稿优化

### 创作历史
- `GET /api/creation` - 获取创作历史

## 开发工具

```bash
# 启动开发服务器
npm run dev

# 打开 Prisma Studio（数据库管理界面）
npx prisma studio

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量 `ANTHROPIC_API_KEY`
4. 部署

注意：SQLite 在 Vercel 上是只读的，建议使用 Vercel Postgres 或其他云数据库。

## 注意事项

1. **API 成本**: Claude API 按 token 计费，请合理控制使用
2. **数据安全**: 妥善保管 API Key，不要提交到代码仓库
3. **数据备份**: 定期备份 SQLite 数据库文件 `dev.db`

## 未来扩展

- 热点内容搜集
- 多平台发布
- 内容日历
- 数据分析
- 多 IP 管理
- 团队协作

## License

MIT

