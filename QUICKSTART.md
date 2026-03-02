# 快速开始指南

## 项目已成功创建！

IP 内容生成平台已经完成基础搭建，所有核心功能已实现。

## 当前状态

✅ 项目初始化完成
✅ 数据库配置完成（SQLite + Prisma）
✅ API 路由已创建
✅ 所有页面已实现
✅ 开发服务器可以正常运行

## 下一步操作

### 1. 配置 API Key

编辑 `.env.local` 文件，添加你的 Anthropic API Key：

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
DATABASE_URL="file:./dev.db"
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 3. 使用流程

1. **设置 IP 身份** (http://localhost:3000/ip-profile)
   - 填写 IP 名称、简介
   - 定义 IP 人设和风格
   - 添加擅长话题标签

2. **添加内容到内容库** (http://localhost:3000/content-library)
   - 点击"添加内容"按钮
   - 填写标题、分类、内容等信息
   - 可以添加标签和逐字稿

3. **内容创作** (http://localhost:3000/create)
   - 选择一个或多个历史内容作为参考
   - 输入创作要求
   - AI 生成新的短视频脚本
   - 可以保存到内容库

4. **内容优化** (http://localhost:3000/optimize)
   - 粘贴视频逐字稿
   - 选择优化目标
   - AI 优化内容
   - 查看对比结果

## 项目结构

```
ip-content-platform/
├── app/                    # Next.js 页面和 API
│   ├── api/               # API 路由
│   ├── ip-profile/        # IP 设置页面
│   ├── content-library/   # 内容库页面
│   ├── create/            # 内容创作页面
│   └── optimize/          # 内容优化页面
├── lib/                   # 工具库
│   ├── db.ts             # 数据库客户端
│   ├── ai.ts             # Claude API 封装
│   └── utils.ts          # 工具函数
├── types/                 # TypeScript 类型
├── prisma/               # 数据库
│   ├── schema.prisma     # 数据库模型
│   └── migrations/       # 数据库迁移
└── components/           # React 组件（待扩展）
```

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 打开数据库管理界面
npx prisma studio

# 创建新的数据库迁移
npx prisma migrate dev --name migration_name

# 生成 Prisma 客户端
npx prisma generate
```

## 功能特性

### 已实现
- ✅ IP 身份配置管理
- ✅ 内容库 CRUD 操作
- ✅ 内容分类和搜索
- ✅ 基于历史内容的 AI 二创
- ✅ 逐字稿 AI 优化
- ✅ 创作历史记录

### 待扩展
- ⏳ 热点内容搜集
- ⏳ 多平台发布
- ⏳ 内容日历
- ⏳ 数据分析
- ⏳ 多 IP 管理
- ⏳ 团队协作

## 注意事项

1. **API 成本**: Claude API 按 token 计费，建议：
   - 在测试时使用较短的内容
   - 设置合理的 max_tokens 限制
   - 监控 API 使用情况

2. **数据安全**:
   - 不要将 `.env.local` 提交到 Git
   - 定期备份 `dev.db` 数据库文件
   - 生产环境建议使用云数据库

3. **性能优化**:
   - SQLite 适合 MVP 和小规模使用
   - 如果数据量大，考虑迁移到 PostgreSQL
   - 可以添加缓存层提升性能

## 故障排除

### 数据库连接错误
```bash
# 重新生成 Prisma 客户端
npx prisma generate

# 重置数据库
npx prisma migrate reset
```

### API 调用失败
- 检查 `.env.local` 中的 API Key 是否正确
- 确认网络连接正常
- 查看浏览器控制台的错误信息

### 构建错误
```bash
# 清理缓存
rm -rf .next node_modules
npm install
npm run build
```

## 获取帮助

- 查看 README.md 了解详细文档
- 检查 Prisma Studio 查看数据库状态
- 查看浏览器控制台和服务器日志

## 部署

### Vercel 部署
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量 `ANTHROPIC_API_KEY`
4. 部署

注意：Vercel 上的 SQLite 是只读的，建议使用 Vercel Postgres。

---

祝你使用愉快！🎉
