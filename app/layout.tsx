import type { Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Avaliação de Impactos Socioeconômicos — BID",
  description:
    "Painel de monitoramento dos impactos socioeconômicos das enchentes de 2024 no Rio Grande do Sul — projeto BID.",
}

// Sem tema escuro: força controles nativos (`<input type="range">`, barras de rolagem etc.)
// para o modo claro mesmo quando o navegador/SO está em dark mode.
export const viewport: Viewport = {
  colorScheme: "only light",
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body suppressHydrationWarning className="min-h-screen font-sans">
        {children}
        {modal}
      </body>
    </html>
  )
}
