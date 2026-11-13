"use client"

import type { DanosCtx } from "./ctx"

export function DanosIndice({ ctx }: { ctx: DanosCtx }) {
  const { aba, visao, visaoPerdas, cotaAtivo, expo, semCurva } = ctx

  const itens =
    aba === "dala"
      ? visaoPerdas === "cota"
        ? [
            ["#resumo-cota", "1. Resumo por Cota"],
            ["#evolucao-cota", "2. Evolução Hidrométrica"],
            ["#tabela-cotas", "3. Tabela por Cota"],
            ["/metodologia#limitacoes", "Limitações (Metodologia) ↗"],
          ]
        : [
            ["#resumo", "1. Resumo Geral"],
            ["#cenarios", "2. Análise por Cenário"],
            ["#sensib", "3. Sensibilidade por Duração"],
            ["/metodologia#limitacoes", "Limitações (Metodologia) ↗"],
          ]
      : visao === "cenario"
        ? [
            ["#resumo-cenarios", "1. Resumo dos Cenários"],
            ["#detalhe-cenario", "2. Detalhe do Cenário"],
            ["#tabela-cenarios", "3. Tabela de Cenários"],
            ["/metodologia#limitacoes", "Limitações (Metodologia) ↗"],
          ]
        : semCurva
          ? cotaAtivo
            ? [
                ["#c-como-ler", "1. Como ler os resultados"],
                ["#c-resumo", "2. Resumo"],
                ["#c-tabela", "3. Valor exposto por cota"],
                ...(expo?.detalhe
                  ? [
                      ["#c-empresas", "4. Empresas"],
                      ["#c-saude", "5. Saúde"],
                      ["#c-educacao", "6. Educação"],
                      ["#c-agricultura", "7. Agricultura"],
                    ]
                  : []),
                [
                  "#c-mapa",
                  expo?.detalhe ? "8. Mapa por cota" : "4. Mapa por cota",
                ],
                ["/metodologia#limitacoes", "Limitações (Metodologia) ↗"],
              ]
            : [
                ["#c-resumo", "1. Resumo"],
                ["#c-faixas", "2. Faixas de Profundidade"],
                ["#c-eai", "3. Exposição Anual Esperada"],
                ["#c-projecao", "4. Projeção 2025→2050"],
                ["#c-comparativo", "5. Comparativo por RP"],
                ["#c-medidas", "6. Medidas de Adaptação"],
                ["/metodologia#limitacoes", "Limitações (Metodologia) ↗"],
              ]
          : cotaAtivo
            ? [
                ["#c-resumo", "1. Resumo"],
                ["#c-curva", "2. Dano por Cota"],
                ["#c-tabela", "3. Tabela por Cota"],
                ["/metodologia#limitacoes", "Limitações (Metodologia) ↗"],
              ]
            : [
                ["#c-resumo", "1. Resumo"],
                ["#c-eai", "2. Risco Anual Esperado"],
                ["#c-projecao", "3. Projeção 2025→2050"],
                ["#c-comparativo", "4. Comparativo por RP"],
                ["#c-medidas", "5. Medidas de Adaptação"],
                ["/metodologia#limitacoes", "Limitações (Metodologia) ↗"],
              ]

  return (
    <aside className="hidden w-52 shrink-0 lg:block print:hidden">
      <div className="sticky top-[56px] flex flex-col gap-3">
        <nav className="rounded-2xl border border-[#b3cdd8]/60 bg-white/85 p-4 shadow-sm backdrop-blur-xl">
          <p className="mb-2 text-[11px] font-black tracking-wider text-[#055071] uppercase">
            Índice
          </p>
          <ol className="flex flex-col gap-1">
            {itens.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="block py-1 px-1.5 rounded-lg text-[11px] leading-snug font-medium text-[#055071] transition-all hover:bg-slate-100/70 active:scale-[0.98]"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </aside>
  )
}
