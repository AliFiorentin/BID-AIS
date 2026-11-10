"use client"

import { DIAS_OPCOES, RP_ANOS, RP_PROBABILIDADE } from "./helpers"
import type { DanosCtx } from "./ctx"

const PRIMARY = "#055071"

export function DanosToolbar({ ctx }: { ctx: DanosCtx }) {
  const {
    aba,
    cotaAtiva,
    cotaAtivo,
    cotasDisponiveis,
    dadosClimada,
    dadosCotas,
    dias,
    munClimadaAtivo,
    munsClimada,
    rpAtivo,
    rpsDisponiveis,
    setCota,
    setDias,
    setMunClimada,
    setRp,
    setVisao,
    visao,
  } = ctx

  return (
    <div
      role="navigation"
      aria-label="Município, visão e parâmetros"
      className="sticky top-0 z-30 border-b border-[#b3cdd8] bg-white/90 shadow-sm print:hidden"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 px-6 py-2.5">
        {aba === "dala" ? (
          <>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-black tracking-wider uppercase"
                style={{ color: PRIMARY }}
              >
                Duração da interrupção
              </span>
              <span className="text-[9px] text-slate-500">(dias efetivos)</span>
            </div>
            <div className="flex gap-1.5">
              {DIAS_OPCOES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDias(d)}
                  className="rounded-full border px-3 py-1 text-[11px] font-black transition-all duration-150"
                  style={
                    dias === d
                      ? {
                          backgroundColor: PRIMARY,
                          color: "#fff",
                          borderColor: PRIMARY,
                        }
                      : {
                          backgroundColor: "#fff",
                          color: "#64748b",
                          borderColor: "#e2e8f0",
                        }
                  }
                >
                  {d} dias
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1.5 whitespace-nowrap">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16a34a]" />
              <span
                className="text-[10px] font-medium text-slate-500"
                title="f = fator de interrupção: fração do ano em que a atividade ficou parada (dias efetivos ÷ 365)."
              >
                f = {(dias / 365).toFixed(4)} · Todos os resultados atualizados
              </span>
            </div>
          </>
        ) : (
          <>
            {munsClimada.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span
                  className="mr-1 text-[10px] font-black tracking-wider uppercase"
                  style={{ color: PRIMARY }}
                >
                  Município
                </span>
                {munsClimada.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMunClimada(m)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-black transition-all duration-150 ${
                      munClimadaAtivo === m
                        ? "border-[#055071] bg-[#055071] text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#055071] hover:text-[#055071]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
            {dadosClimada && dadosCotas && (
              <>
                <div className="hidden w-px self-stretch bg-slate-200 sm:block" />
                <div className="flex gap-1.5">
                  {(
                    [
                      ["cota", "Por cota"],
                      ["rp", "CLIMADA (RP)"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => setVisao(v)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-black transition-all duration-150 ${
                        visao === v
                          ? "border-amber-700 bg-amber-700 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="hidden w-px self-stretch bg-slate-200 sm:block" />
            {cotaAtivo ? (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-black tracking-wider uppercase"
                    style={{ color: PRIMARY }}
                  >
                    Cota (m)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cotasDisponiveis.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCota(c)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-black transition-all duration-150 ${
                        cotaAtiva === c
                          ? "border-[#055071] bg-[#055071] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#055071] hover:text-[#055071]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  <span className="text-[10px] font-medium text-slate-600">
                    Sem período de retorno: sem EAI
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-black tracking-wider uppercase"
                    style={{ color: PRIMARY }}
                  >
                    Período de retorno
                  </span>
                  <span className="text-[9px] text-slate-500">
                    (cenário sintético CLIMADA)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rpsDisponiveis.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRp(r)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-black transition-all duration-150 ${
                        rpAtivo === r
                          ? "border-amber-700 bg-amber-700 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-800"
                      }`}
                      title={`Período de retorno de ${RP_ANOS[r]}, ${RP_PROBABILIDADE[r]} de chance/ano de ocorrer`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  <span className="text-[10px] font-medium text-slate-600">
                    RP200 é a âncora de calibração usada pelo CLIMADA
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
