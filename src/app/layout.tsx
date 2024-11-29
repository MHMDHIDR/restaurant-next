import "@/styles/globals.css"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"
import { extractRouterConfig } from "uploadthing/server"
import Nav from "@/app/_components/custom/nav"
import { ourFileRouter } from "@/app/api/uploadthing/core"
import { Providers } from "./providers"
import { ThemeProvider } from "./providers/theme-provider"

export const metadata: Metadata = {
  title: "Restaurant App",
  description: "Restaurant | Order your favorite food online",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`} suppressHydrationWarning>
      <body>
        <Nav />
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
