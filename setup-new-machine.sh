#!/bin/bash
# ============================================================
# 灵感引擎 - 新设备初始化脚本
# 在任何新电脑上运行此脚本，即可获得完整的开发+部署能力
# 用法：bash setup-new-machine.sh
# ============================================================

SERVER="root@112.124.108.24"
GITHUB_REPO="https://github.com/zherong0603-web/inspiration-engine.git"

echo "🔧 灵感引擎 - 新设备初始化"
echo "=========================="
echo ""

# Step 1: 检查/生成 SSH Key
echo "📌 Step 1: 检查 SSH Key..."
if [ ! -f ~/.ssh/id_ed25519 ] && [ ! -f ~/.ssh/id_rsa ]; then
  echo "  未找到 SSH Key，正在生成..."
  ssh-keygen -t ed25519 -C "linggan-engine-deploy" -f ~/.ssh/id_ed25519 -N ""
  echo "  ✅ SSH Key 已生成"
else
  echo "  ✅ SSH Key 已存在"
fi

# 获取公钥
PUB_KEY=$(cat ~/.ssh/id_ed25519.pub 2>/dev/null || cat ~/.ssh/id_rsa.pub 2>/dev/null)
echo ""
echo "  你的公钥："
echo "  $PUB_KEY"
echo ""

# Step 2: 尝试连接服务器
echo "📌 Step 2: 测试服务器连接..."
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes "$SERVER" "echo OK" 2>/dev/null | grep -q "OK"; then
  echo "  ✅ 服务器连接正常，已有部署权限"
else
  echo "  ⚠️  无法连接服务器（首次使用需要添加公钥）"
  echo ""
  echo "  请将以下公钥发给管理员，或在已有权限的电脑上运行："
  echo "  ssh root@112.124.108.24 \"echo '$PUB_KEY' >> ~/.ssh/authorized_keys\""
  echo ""
  echo "  添加后重新运行此脚本即可。"
  echo ""
  read -p "  公钥是否已添加？(y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SERVER" "echo OK" 2>/dev/null | grep -q "OK"; then
      echo "  ✅ 连接成功！"
    else
      echo "  ❌ 仍然无法连接，请检查公钥是否正确添加"
      exit 1
    fi
  else
    echo "  ⏸️  请添加公钥后重新运行此脚本"
    exit 0
  fi
fi

# Step 3: 克隆代码仓库
echo ""
echo "📌 Step 3: 克隆代码仓库..."
CURRENT_DIR=$(pwd)
if [ -d ".git" ] && git remote -v 2>/dev/null | grep -q "inspiration-engine"; then
  echo "  ✅ 已在项目目录中，跳过克隆"
else
  echo "  正在克隆 $GITHUB_REPO ..."
  git clone "$GITHUB_REPO" linggan-engine 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "  ✅ 克隆成功，项目在 ./linggan-engine/"
    echo "  请进入目录：cd linggan-engine"
  else
    echo "  ⚠️  克隆失败（可能是私有仓库，需要配置 GitHub token）"
    echo "  手动克隆：git clone https://<TOKEN>@github.com/zherong0603-web/inspiration-engine.git"
  fi
fi

echo ""
echo "=========================="
echo "✅ 初始化完成！"
echo ""
echo "日常工作流程："
echo "  1. 编辑代码"
echo "  2. git add . && git commit -m '描述'"
echo "  3. git push（备份到 GitHub）"
echo "  4. bash deploy.sh（部署到服务器）"
echo ""
echo "服务器地址：http://112.124.108.24:3010"
echo "=========================="
