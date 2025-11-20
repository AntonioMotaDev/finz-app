export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/accounts/:path*',
    '/transactions/:path*',
    '/budgets/:path*',
    '/goals/:path*',
    '/reports/:path*',
    '/settings/:path*',
  ]
}
