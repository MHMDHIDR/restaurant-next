import { GeistSans } from "geist/font/sans"
import { SessionProvider } from "next-auth/react"
import { Providers } from "@/app/providers"
import { ThemeProvider } from "@/app/providers/theme-provider"
import Nav from "@/components/custom/nav"
import { auth } from "@/server/auth"
import type { Metadata } from "next"
import "../styles/globals.css"

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
      <head>
        <meta content="width=device-width, initial-scale=1 maximum-scale=1" name="viewport" />
        <link href="/logo.svg" rel="icon" type="image/svg+xml" />
        <script
          defer
          src="https://analytics.technodevlabs.com/script.js"
          data-website-id="fe55d0ec-b756-4bcc-8e05-4490451bec0a"
        ></script>
      </head>
      <body>
        <SessionProvider>
          <Providers>
            <Nav user={user} key={user?.image} isHidden />
            <ThemeProvider
              attribute="class"
              defaultTheme={session?.user.theme ?? "light"}
              disableTransitionOnChange
              enableSystem
            >
              {children}
            </ThemeProvider>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  )
}
