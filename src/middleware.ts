import { auth } from "@/server/auth"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Checking auth for path: ${request.nextUrl.pathname}`)

  const session = await auth()
  console.log("[Middleware] Session status:", session ? "Authenticated" : "Unauthenticated")

  return auth()
}

export const config = {
  matcher: ["/dashboard/:path*", "/vendor-manager/:path*"],
}
