"use client";

import Link from "next/link";
import { TrendingDown } from "lucide-react";
import { HeaderLogos } from "@/components/HeaderLogos";
import { CopyLinkButton } from "@/components/CopyLinkButton";

export function DanosHeader() {
  const linkClass = "active-press hover-lift text-[11px] font-semibold text-white/95 hover:text-white transition-all duration-150 px-3.5 py-1.5 rounded-full border border-white/20 hover:border-white/40 bg-white/10 hover:bg-white/20 active:scale-[0.97] flex items-center gap-1.5 shadow-xs";
  return (
      <header className="bg-gradient-to-br from-[#055071] via-[#075d83] to-[#0a6e9a] text-white px-6 py-10 print:py-5 border-b border-white/10 shadow-lg">
        <div className="max-w-[1200px] mx-auto flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-5 print:hidden">
              <Link href="/" className={linkClass}>← Dashboard</Link>
              <Link href="/metodologia" className={linkClass}>← Metodologia</Link>
              <CopyLinkButton label="Copiar link" title="Copiar link desta configuração (aba, município, período de retorno, cota...)" className={linkClass} />
            </div>
            <h1 className="text-4xl font-black leading-none mb-2 tracking-tight flex items-center gap-3">
              <TrendingDown size={36} strokeWidth={2.5} className="opacity-80 shrink-0" />
              Danos & Risco de Inundação
            </h1>
            <p className="text-base opacity-75 font-medium">
              Perdas Econômicas e Dano Físico Estimado: Enchentes no Rio Grande do Sul
            </p>
            <p className="text-[11px] opacity-75 mt-3 font-mono">
              Metodologia DaLA (CEPAL/BID), Maio 2024 e Setembro 2023 · Danos Físicos por cota, Porto Alegre, Lajeado, Eldorado do Sul e Rio Grande
            </p>
          </div>
          <HeaderLogos />
        </div>
      </header>
  );
}
