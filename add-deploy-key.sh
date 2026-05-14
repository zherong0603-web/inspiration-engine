#!/bin/bash
# ============================================================
# 添加新设备的 SSH 公钥到服务器
# 在已有权限的电脑上运行，为新电脑授权
# 用法：bash add-deploy-key.sh "ssh-ed25519 AAAA... user@host"
# ============================================================

SERVER="root@112.124.108.24"

if [ -z "$1" ]; then
  echo "用法：bash add-deploy-key.sh \"<公钥内容>\""
  echo ""
  echo "在新电脑上运行以下命令获取公钥："
  echo "  cat ~/.ssh/id_ed25519.pub"
  echo ""
  echo "然后将输出的内容作为参数传入此脚本。"
  exit 1
fi

PUB_KEY="$1"

echo "📌 正在添加公钥到服务器..."
ssh -o StrictHostKeyChecking=no "$SERVER" "echo '$PUB_KEY' >> ~/.ssh/authorized_keys && echo '✅ 公钥已添加'"

if [ $? -eq 0 ]; then
  echo "✅ 完成！新设备现在可以部署了。"
else
  echo "❌ 添加失败，请检查网络连接。"
fi
