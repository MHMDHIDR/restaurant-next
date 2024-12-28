export { auth as middleware } from "@/server/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/vendor-manager/:path*"],
}
