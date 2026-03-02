import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value
  const { pathname } = request.nextUrl

  // 公开路由（不需要登录）
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/register']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // 如果是公开路由，直接放行
  if (isPublicPath) {
    // 如果已登录用户访问登录页，重定向到首页
    if (userId && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // 如果未登录，重定向到登录页
  if (!userId) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 文件夹
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
