import { NextRequest, NextResponse } from "next/server"

/**
 * Proxy (antes "middleware") de seguridad:
 *  1. Content-Security-Policy con nonce por petición (bloquea XSS por scripts inyectados).
 *  2. Protección CSRF para la API: rechaza peticiones mutantes de otro origen.
 *  3. Redirección optimista a /signin si no hay cookie de sesión en rutas privadas
 *     (la verificación real la sigue haciendo auth() en el servidor).
 */

const PROTECTED_PATHS = [
  "/dashboard",
  "/accounts",
  "/transactions",
  "/categories",
  "/budgets",
  "/goals",
  "/reports",
  "/settings",
]

const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"]
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV !== "production"
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Recharts y atributos style requieren estilos inline
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://lh3.googleusercontent.com`,
    `font-src 'self'`,
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    // El login con Google redirige tras enviar el formulario
    `form-action 'self' https://accounts.google.com`,
    `manifest-src 'self'`,
    `worker-src 'self' blob:`,
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ")
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- API: sólo CSRF por origen + sin caché ---
  if (pathname.startsWith("/api/")) {
    if (!SAFE_METHODS.has(request.method) && !pathname.startsWith("/api/auth/")) {
      const origin = request.headers.get("origin")
      if (origin && origin !== request.nextUrl.origin) {
        return NextResponse.json({ error: "Origen no permitido" }, { status: 403 })
      }
    }
    const res = NextResponse.next()
    res.headers.set("Cache-Control", "no-store, max-age=0")
    return res
  }

  // --- Rutas privadas: redirección temprana sin tocar la BD ---
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  if (isProtected && !SESSION_COOKIES.some((c) => request.cookies.has(c))) {
    const url = request.nextUrl.clone()
    url.pathname = "/signin"
    url.search = ""
    return NextResponse.redirect(url)
  }

  // --- Páginas: CSP con nonce ---
  const nonce = btoa(crypto.randomUUID())
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set("Content-Security-Policy", csp)
  if (isProtected) {
    response.headers.set("Cache-Control", "private, no-store")
  }
  return response
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
      // No ejecutar en prefetch de enlaces (ahorra trabajo y mantiene el nonce coherente)
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
