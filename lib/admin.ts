// 获取管理员邮箱列表
export function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || 'admin@example.com'
  return adminEmailsEnv.split(',').map(email => email.trim()).filter(Boolean)
}

// 检查用户是否为管理员
export function isAdminEmail(email: string): boolean {
  const adminEmails = getAdminEmails()
  return adminEmails.includes(email)
}
