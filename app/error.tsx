"use client"

import Link from "next/link"
import { useEffect } from "react"

// Tela de erro das páginas (substitui o "This page couldn't load" genérico): mostra a causa para
// facilitar o diagnóstico e oferece recarregar. Erros de carregamento de pedaços de código
// (ChunkLoadError, comum logo após um novo deploy/build) recarregam a página uma única vez.
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const chunk = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    `${error.name} ${error.message}`,
  )

  useEffect(() => {
    console.error("Erro na página:", error)
    if (chunk) {
      try {
        if (sessionStorage.getItem("bid-recarregou-chunk") !== "1") {
          sessionStorage.setItem("bid-recarregou-chunk", "1")
          window.location.reload()
        }
      } catch { /* sessionStorage indisponível */ }
    }
  }, [error, chunk])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f0f7fa] px-6 text-slate-800">
      <div className="max-w-xl w-full rounded-3xl border border-white/80 bg-white/90 backdrop-blur-2xl p-8 shadow-2xl">
        <h1 className="text-xl font-black text-[#055071]">Não foi possível carregar esta página</h1>
        <p className="mt-2 text-sm text-slate-600">
          {chunk
            ? "Uma parte do código não foi encontrada (provavelmente o painel foi atualizado enquanto esta aba estava aberta). Recarregue a página."
            : "Ocorreu um erro inesperado ao montar a página."}
        </p>
        <pre className="mt-3 max-h-40 overflow-auto rounded-xl bg-slate-100/80 border border-slate-200/60 p-3.5 text-[11px] text-slate-700 whitespace-pre-wrap font-mono">
          {error.name}: {error.message}
          {error.digest ? `\n(digest ${error.digest})` : ""}
        </pre>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => { try { sessionStorage.removeItem("bid-recarregou-chunk") } catch { /* ok */ } window.location.reload() }}
            className="rounded-full bg-[#055071] hover:bg-[#06628b] px-5 py-2.5 text-sm font-semibold text-white shadow-xs active:scale-[0.97] transition-all"
          >
            Recarregar
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-[#b3cdd8] bg-white/60 hover:bg-white px-5 py-2.5 text-sm font-semibold text-[#055071] active:scale-[0.97] transition-all"
          >
            Tentar de novo
          </button>
          <Link
            href="/"
            className="rounded-full border border-[#b3cdd8] bg-white/60 hover:bg-white px-5 py-2.5 text-sm font-semibold text-[#055071] active:scale-[0.97] transition-all"
          >
            Ir ao Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
