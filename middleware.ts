import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Para NextAuth v5, la autenticación se maneja en las páginas
  // Este middleware solo previene el cache de rutas autenticadas
  const response = NextResponse.next()
  
  const protectedPaths = ['/dashboard', '/accounts', '/transactions', '/budgets', '/goals', '/reports', '/settings']
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  if (isProtectedRoute) {
    response.headers.set('x-middleware-cache', 'no-cache')
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
