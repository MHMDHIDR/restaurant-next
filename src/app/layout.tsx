import "@/styles/globals.css"
import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"
import Nav from "@/app/_components/custom/nav"
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
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
