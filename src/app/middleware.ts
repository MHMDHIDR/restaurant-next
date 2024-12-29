import { NextResponse } from "next/server"
import { auth } from "@/server/auth"

export default auth(req => {
  if (!req.auth && req.nextUrl.pathname !== "/signin") {
    const newUrl = new URL("/signin", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/vendor-manager/:path*", "/account/:path*", "/checkout/:path*"],
}

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// }
