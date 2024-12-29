// middleware.ts
import { NextResponse } from "next/server"
import { auth } from "@/server/auth"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()
  console.log("Middleware session check:", {
    url: request.url,
    hasSession: !!session,
  })
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Add your protected routes here
    "/dashboard/:path*",
    "/vendor-manager/:path*",
    "/account/:path*",
    "/checkout/:path*",
  ],
}
// import { auth } from "@/server/auth"

// export default auth(req => {
//   if (!req.auth && req.nextUrl.pathname !== "/signin") {
//     const newUrl = new URL("/signin", req.nextUrl.origin)
//     return Response.redirect(newUrl)
//   }
// })

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// }
