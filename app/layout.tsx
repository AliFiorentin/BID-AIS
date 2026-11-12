import type { Viewport } from "next"

import "./globals.css"

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
      className="antialiased font-sans"
    >
      <body suppressHydrationWarning className="min-h-screen font-sans">
        {children}
        {modal}
      </body>
    </html>
  )
}
