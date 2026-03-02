'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  phone: string | null
  name: string | null
  inviteCode: string | null
  createdAt: string
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 编辑状态
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editName, setEditName] = useState('')

  // 修改密码状态
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setEditEmail(data.user.email)
        setEditPhone(data.user.phone || '')
        setEditName(data.user.name || '')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile() {
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editEmail,
          phone: editPhone || null,
          name: editName || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('资料更新成功')
        setUser({ ...user!, ...data.user })
        setIsEditingProfile(false)
      } else {
        alert(data.error || '更新失败')
      }
    } catch (error) {
      console.error('更新资料失败:', error)
      alert('更新失败，请重试')
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }

    if (newPassword.length < 6) {
      alert('新密码至少需要6个字符')
      return
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('密码修改成功')
        setIsChangingPassword(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        alert(data.error || '修改失败')
      }
    } catch (error) {
      console.error('修改密码失败:', error)
      alert('修改失败，请重试')
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  function copyInviteCode() {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode)
      alert('邀请码已复制到剪贴板')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center text-slate-600">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-10 px-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">账号管理</h1>
          <p className="text-white/90">
            管理你的账号信息、密码和邀请码
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>👤</span>
              基本信息
            </h2>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium"
              >
                编辑资料
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  邮箱 *
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  手机号（备用登录方式）
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="请输入11位手机号"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-slate-800"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateProfile}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsEditingProfile(false)
                    setEditEmail(user.email)
                    setEditPhone(user.phone || '')
                    setEditName(user.name || '')
                  }}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  邮箱
                </label>
                <div className="text-lg text-slate-800">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  手机号
                </label>
                <div className="text-lg text-slate-800">
                  {user.phone || (
                    <span className="text-slate-400">未设置（建议添加备用登录方式）</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  用户名
                </label>
                <div className="text-lg text-slate-800">{user.name || '未设置'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  注册时间
                </label>
                <div className="text-lg text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 修改密码 */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>🔒</span>
              密码管理
            </h2>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium"
              >
                修改密码
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  当前密码
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  新密码（至少6个字符）
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  确认新密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-slate-800"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleChangePassword}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium"
                >
                  确认修改
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-600">
              定期修改密码可以提高账号安全性。如果忘记密码，可以使用备用邮箱或手机号找回。
            </p>
          )}
        </div>

        {/* 邀请码 */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200 shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>🎟️</span>
            我的邀请码
          </h2>
          <p className="text-slate-600 mb-4">
            分享你的邀请码，邀请朋友一起使用平台
          </p>
          <div className="bg-white rounded-xl p-4 border-2 border-violet-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">邀请码</div>
                <div className="text-2xl font-bold text-violet-600 tracking-wider">
                  {user.inviteCode}
                </div>
              </div>
              <button
                onClick={copyInviteCode}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                复制邀请码
              </button>
            </div>
          </div>
        </div>

        {/* 退出登录 */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>🚪</span>
            账号操作
          </h2>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}
