#!/bin/bash

# 服务器信息
SERVER="root@112.124.108.24"
REPO_URL="git@github.com:zherong0603-web/inspiration-engine.git"
APP_DIR="/var/www/inspiration-engine"

echo "🚀 开始自动化部署到阿里云..."
echo "服务器: 112.124.108.24"
echo ""

# 第一步：安装环境
echo "📦 第一步：安装 Node.js 和必要软件..."
ssh $SERVER bash << 'EOF'
set -e

# 更新系统
echo "更新系统包..."
apt-get update -y > /dev/null 2>&1

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo "安装 Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
else
    echo "Node.js 已安装: $(node -v)"
fi

# 安装 Git
if ! command -v git &> /dev/null; then
    echo "安装 Git..."
    apt-get install -y git > /dev/null 2>&1
else
    echo "Git 已安装: $(git --version)"
fi

# 安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo "安装 PM2..."
    npm install -g pm2 > /dev/null 2>&1
else
    echo "PM2 已安装: $(pm2 -v)"
fi

echo "✅ 环境安装完成"
echo "   Node.js: $(node -v)"
echo "   npm: $(npm -v)"
echo "   Git: $(git --version | head -n1)"
echo "   PM2: $(pm2 -v)"
EOF

if [ $? -ne 0 ]; then
    echo "❌ 环境安装失败"
    exit 1
fi

# 第二步：配置 GitHub SSH 密钥
echo ""
echo "🔑 第二步：配置 GitHub SSH 密钥..."
ssh $SERVER bash << 'EOF'
set -e

# 检查是否已有 SSH 密钥
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "生成 SSH 密钥..."
    ssh-keygen -t ed25519 -C "server@aliyun.com" -f ~/.ssh/id_ed25519 -N "" > /dev/null 2>&1
    echo "✅ SSH 密钥已生成"
else
    echo "✅ SSH 密钥已存在"
fi

# 显示公钥
echo ""
echo "📋 请将以下公钥添加到 GitHub:"
echo "   https://github.com/settings/ssh/new"
echo ""
cat ~/.ssh/id_ed25519.pub
echo ""
EOF

echo ""
echo "⏸️  请完成以下操作后按回车继续："
echo "   1. 复制上面的 SSH 公钥"
echo "   2. 访问 https://github.com/settings/ssh/new"
echo "   3. Title: 阿里云服务器"
echo "   4. Key: 粘贴公钥"
echo "   5. 点击 'Add SSH key'"
read -p "完成后按回车继续..."

# 第三步：克隆代码
echo ""
echo "📥 第三步：克隆代码..."
ssh $SERVER bash << EOF
set -e

# 添加 GitHub 到已知主机
ssh-keyscan -H github.com >> ~/.ssh/known_hosts 2>/dev/null

# 创建应用目录
mkdir -p /var/www

# 克隆或更新代码
if [ -d "$APP_DIR" ]; then
    echo "目录已存在，拉取最新代码..."
    cd $APP_DIR
    git pull origin main
else
    echo "克隆代码..."
    git clone $REPO_URL $APP_DIR
fi

echo "✅ 代码已准备好"
EOF

if [ $? -ne 0 ]; then
    echo "❌ 代码克隆失败，请检查 GitHub SSH 密钥是否已添加"
    exit 1
fi

# 第四步：配置环境变量
echo ""
echo "⚙️ 第四步：配置环境变量..."
ssh $SERVER bash << 'EOF'
set -e

cd /var/www/inspiration-engine

cat > .env << 'ENVEOF'
# Anthropic API Key
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_BASE_URL=https://hone.vvvv.ee

# Database
DATABASE_URL="file:./dev.db"

# Node Environment
NODE_ENV=production
ENVEOF

echo "✅ 环境变量已配置"
EOF

# 第五步：安装依赖
echo ""
echo "📦 第五步：安装依赖..."
ssh $SERVER bash << 'EOF'
set -e

cd /var/www/inspiration-engine

echo "安装 npm 依赖..."
npm install > /dev/null 2>&1

echo "生成 Prisma Client..."
npx prisma generate > /dev/null 2>&1

echo "初始化数据库..."
npx prisma db push > /dev/null 2>&1

echo "✅ 依赖已安装"
EOF

# 第六步：构建项目
echo ""
echo "🏗️ 第六步：构建项目..."
ssh $SERVER bash << 'EOF'
set -e

cd /var/www/inspiration-engine

echo "构建 Next.js 项目..."
npm run build

echo "✅ 项目已构建"
EOF

# 第七步：启动服务
echo ""
echo "🚀 第七步：启动服务..."
ssh $SERVER bash << 'EOF'
set -e

cd /var/www/inspiration-engine

# 停止旧进程
pm2 delete inspiration-engine 2>/dev/null || true

# 启动应用
pm2 start npm --name "inspiration-engine" -- start

# 设置开机自启
pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
pm2 save

# 查看状态
pm2 status

echo "✅ 服务已启动"
EOF

echo ""
echo "🎉 部署完成！"
echo ""
echo "📍 访问地址: http://112.124.108.24:3009"
echo ""
echo "⚠️  重要：请在阿里云控制台配置安全组规则，开放 3009 端口"
echo "   1. 进入 ECS 控制台"
echo "   2. 点击实例 → 安全组 → 配置规则"
echo "   3. 添加入方向规则："
echo "      - 端口范围: 3009/3009"
echo "      - 授权对象: 0.0.0.0/0"
echo ""
echo "💡 常用命令："
echo "   查看日志: ssh root@112.124.108.24 'pm2 logs inspiration-engine'"
echo "   重启服务: ssh root@112.124.108.24 'pm2 restart inspiration-engine'"
echo "   停止服务: ssh root@112.124.108.24 'pm2 stop inspiration-engine'"
echo ""
