import type { Viewport } from "next"

import "./globals.css"

export const metadata = {
  title: "Avaliação de Impactos Socioeconômicos — BID",
  description:
    "Painel de monitoramento dos impactos socioeconômicos das enchentes de 2024 no Rio Grande do Sul — projeto BID.",
}

// Bloqueia qualquer tema escuro dos navegadores/SO: força controles nativos,
// inputs, seletores e scrollbars para o modo claro estrito.
export const viewport: Viewport = {
  colorScheme: "only light",
  themeColor: "#055071",
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
      className="light antialiased font-sans"
      style={{ colorScheme: "light" }}
    >
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen font-sans bg-white text-slate-900"
        style={{ colorScheme: "light" }}
      >
        {children}
        {modal}
      </body>
    </html>
  )
}
