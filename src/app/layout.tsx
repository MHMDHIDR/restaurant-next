import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { GeistSans } from "geist/font/sans"
import { SessionProvider } from "next-auth/react"
import { extractRouterConfig } from "uploadthing/server"
import { ourFileRouter } from "@/app/api/uploadthing/core"
import Nav from "@/components/custom/nav"
import { auth } from "@/server/auth"
import { Providers } from "./providers"
import { ThemeProvider } from "./providers/theme-provider"
import "@/styles/globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Restaurant App",
  description: "Restaurant | Order your favorite food online",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const user = session?.user

  return (
    <html lang="en" className={`${GeistSans.variable}`} suppressHydrationWarning>
      <body>
        <SessionProvider>
          <Providers>
            <Nav user={user} isHidden />
            <ThemeProvider
              attribute="class"
              defaultTheme={session?.user.theme ?? "light"}
              disableTransitionOnChange
              enableSystem
            >
              <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
              {children}
            </ThemeProvider>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  )
}
