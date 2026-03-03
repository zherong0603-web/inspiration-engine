#!/usr/bin/expect -f

# 阿里云自动化部署脚本
set timeout 300
set server_ip "112.124.108.24"
set password "Suweif873"

# 第一步：添加 SSH 公钥到服务器
puts "🔑 第一步：配置 SSH 免密登录..."
spawn ssh-copy-id -o StrictHostKeyChecking=no root@$server_ip
expect {
    "password:" {
        send "$password\r"
        expect eof
    }
    "All keys were skipped" {
        puts "SSH 密钥已存在"
    }
}

# 第二步：执行部署命令
puts "\n🚀 第二步：开始部署..."
spawn ssh root@$server_ip

expect "# "
send "echo '=== 安装 Node.js 和必要软件 ==='\r"

expect "# "
send "apt-get update -y\r"

expect "# "
send "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -\r"

expect "# "
send "apt-get install -y nodejs git\r"

expect "# "
send "npm install -g pm2\r"

expect "# "
send "echo '✅ 环境安装完成'\r"
send "node -v\r"
send "npm -v\r"

expect "# "
send "echo '\n=== 配置 GitHub SSH 密钥 ==='\r"

expect "# "
send "ssh-keygen -t ed25519 -C 'server@aliyun.com' -f ~/.ssh/id_ed25519 -N ''\r"

expect "# "
send "echo '请将以下公钥添加到 GitHub:'\r"
send "cat ~/.ssh/id_ed25519.pub\r"

expect "# "
send "echo '\n按回车继续...'\r"
send "read\r"

interact
