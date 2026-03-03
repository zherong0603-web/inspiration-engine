# 灵感引擎 - 阿里云部署指南

## 服务器信息
- IP: 112.124.108.24
- 用户: root
- 密码: Suweif873
- 系统: Ubuntu 22.04

## 快速部署（复制粘贴执行）

### 1. 连接到服务器
```bash
ssh root@112.124.108.24
# 输入密码: Suweif873
```

### 2. 安装 Node.js 和必要软件
```bash
# 更新系统
apt-get update

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 安装 Git
apt-get install -y git

# 安装 PM2（进程管理器）
npm install -g pm2

# 验证安装
node -v
npm -v
git --version
pm2 -v
```

### 3. 配置 GitHub SSH 密钥
```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "server@aliyun.com" -f ~/.ssh/id_ed25519 -N ""

# 显示公钥（需要添加到 GitHub）
cat ~/.ssh/id_ed25519.pub
```

**重要：** 复制上面显示的公钥，然后：
1. 访问 https://github.com/settings/ssh/new
2. Title: `阿里云服务器`
3. Key: 粘贴公钥
4. 点击 "Add SSH key"

### 4. 克隆代码
```bash
# 创建应用目录
mkdir -p /var/www
cd /var/www

# 克隆代码
git clone git@github.com:zherong0603-web/inspiration-engine.git
cd inspiration-engine
```

### 5. 配置环境变量
```bash
cat > .env << 'EOF'
# Anthropic API Key
ANTHROPIC_API_KEY=sk-x3YDgqPpnjbVCxwa9AsFjA37fKXoaynBGkHuaPhvF7fE0elT
ANTHROPIC_BASE_URL=https://hone.vvvv.ee

# Database
DATABASE_URL="file:./dev.db"

# Node Environment
NODE_ENV=production
EOF
```

### 6. 安装依赖并构建
```bash
# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 初始化数据库
npx prisma db push

# 构建项目
npm run build
```

### 7. 启动服务
```bash
# 启动应用
pm2 start npm --name "inspiration-engine" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs inspiration-engine
```

### 8. 配置防火墙（阿里云控制台）
在阿里云控制台配置安全组规则：
1. 进入 ECS 控制台
2. 点击实例 → 安全组 → 配置规则
3. 添加入方向规则：
   - 端口范围: 3009/3009
   - 授权对象: 0.0.0.0/0
   - 描述: 灵感引擎应用端口

## 访问应用
http://112.124.108.24:3009

## 常用命令
```bash
# 查看日志
pm2 logs inspiration-engine

# 重启服务
pm2 restart inspiration-engine

# 停止服务
pm2 stop inspiration-engine

# 更新代码
cd /var/www/inspiration-engine
git pull origin main
npm install
npm run build
pm2 restart inspiration-engine
```

## 未来更新流程
1. 本地开发完成后提交代码
   ```bash
   git add .
   git commit -m "更新说明"
   git push origin main
   ```

2. 服务器更新
   ```bash
   ssh root@112.124.108.24
   cd /var/www/inspiration-engine
   git pull origin main
   npm install
   npm run build
   pm2 restart inspiration-engine
   ```
