"use client"

import { DIAS_OPCOES, RP_ANOS } from "./helpers"
import type { DanosCtx } from "./ctx"
import { CENARIO_FISICO_LABELS } from "./ctx"

const PRIMARY = "#055071"

export function DanosToolbar({ ctx }: { ctx: DanosCtx }) {
  const {
    aba,
    cotaAtiva,
    cotasDisponiveis,
    dadosClimada,
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
    // Novos campos Danos Físicos (Cenários):
    cenarioFisicoAtivo,
    cenariosFisicosDisponiveis,
    setCenarioFisico,
    // Novos campos Perdas Operacionais (Cotas):
    visaoPerdas,
    setVisaoPerdas,
    munPerdasAtivo,
    munsPerdas,
    setMunPerdas,
    cotaPerdasAtiva,
    cotasPerdasDisponiveis,
    setCotaPerdas,
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
            {/* Seletor de Visão em Perdas: Cenário vs Cota */}
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-black tracking-wider uppercase"
                style={{ color: PRIMARY }}
              >
                Visão
              </span>
              <div className="flex gap-1">
                {(
                  [
                    ["cenario", "Por cenário"],
                    ["cota", "Por cota"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => setVisaoPerdas(v)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-black transition-all duration-150 ${
                      visaoPerdas === v
                        ? "border-[#055071] bg-[#055071] text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#055071] hover:text-[#055071]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden w-px self-stretch bg-slate-200 sm:block" />

            {/* Quando visão por cota em Perdas: Seletor de município e cota */}
            {visaoPerdas === "cota" && (
              <>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-black tracking-wider uppercase"
                    style={{ color: PRIMARY }}
                  >
                    Município
                  </span>
                  {munsPerdas.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMunPerdas(m)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-black transition-all duration-150 ${
                        munPerdasAtivo === m
                          ? "border-[#055071] bg-[#055071] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#055071] hover:text-[#055071]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="hidden w-px self-stretch bg-slate-200 sm:block" />

                {cotasPerdasDisponiveis.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-[340px]">
                    <span
                      className="text-[10px] font-black tracking-wider uppercase shrink-0"
                      style={{ color: PRIMARY }}
                    >
                      Cota
                    </span>
                    <div className="flex gap-1">
                      {cotasPerdasDisponiveis.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCotaPerdas(c)}
                          className={`rounded-full border px-2 py-0.5 text-[10.5px] font-bold transition-all duration-150 shrink-0 ${
                            cotaPerdasAtiva === c
                              ? "border-[#055071] bg-[#055071] text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-[#055071] hover:text-[#055071]"
                          }`}
                        >
                          {c.replace(".", ",")}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="hidden w-px self-stretch bg-slate-200 sm:block" />
              </>
            )}

            {/* Duração da interrupção (dias efetivos) */}
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-black tracking-wider uppercase"
                style={{ color: PRIMARY }}
              >
                Duração
              </span>
              <div className="flex gap-1">
                {DIAS_OPCOES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDias(d)}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-black transition-all duration-150"
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
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1.5 whitespace-nowrap">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16a34a]" />
              <span
                className="text-[10px] font-medium text-slate-500"
                title="f = fator de interrupção: fração do ano em que a atividade ficou parada (dias efetivos ÷ 365)."
              >
                f = {(dias / 365).toFixed(4)} · Atualizado
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Seletor de Município em Danos Físicos */}
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

            <div className="hidden w-px self-stretch bg-slate-200 sm:block" />

            {/* Seletor de Visão em Danos Físicos: Cenário vs Cota vs RP */}
            <div className="flex gap-1.5">
              {(
                [
                  ["cenario", "Por cenário"],
                  ["cota", "Por cota"],
                  ...(dadosClimada ? [["rp", "CLIMADA (RP)"]] : []),
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setVisao(v as "cenario" | "cota" | "rp")}
                  className={`rounded-full border px-3 py-1 text-[11px] font-black transition-all duration-150 ${
                    visao === v
                      ? "border-[#055071] bg-[#055071] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#055071] hover:text-[#055071]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="hidden w-px self-stretch bg-slate-200 sm:block" />

            {/* Sub-seletor baseado na visão ativa */}
            {visao === "cenario" ? (
              cenariosFisicosDisponiveis.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[10px] font-black tracking-wider uppercase"
                    style={{ color: PRIMARY }}
                  >
                    Cenário
                  </span>
                  {cenariosFisicosDisponiveis.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCenarioFisico(c)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all duration-150 ${
                        cenarioFisicoAtivo === c
                          ? "border-[#055071] bg-[#055071] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#055071] hover:text-[#055071]"
                      }`}
                    >
                      {CENARIO_FISICO_LABELS[c] ?? c}
                    </button>
                  ))}
                </div>
              )
            ) : visao === "cota" ? (
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
                      {c.replace(".", ",")}
                    </button>
                  ))}
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
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rpsDisponiveis.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRp(r)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-black transition-all duration-150 ${
                        rpAtivo === r
                          ? "border-[#055071] bg-[#055071] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#055071] hover:text-[#055071]"
                      }`}
                    >
                      {r}
                      <span className="ml-1 text-[9px] font-normal opacity-80">
                        ({RP_ANOS[r]}a)
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
