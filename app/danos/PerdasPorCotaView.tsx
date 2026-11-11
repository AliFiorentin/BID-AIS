"use client"

import React from "react"
import Link from "next/link"
import { Building2, GraduationCap, HeartPulse, Sprout, TrendingDown } from "lucide-react"
import type { DanosCtx } from "./ctx"
import { Section, SubTitle, DataTable, Note, DiasBadge } from "./ui"
import { fmtBRL, fmtN } from "./helpers"

export function PerdasPorCotaView({ ctx }: { ctx: DanosCtx }) {
  const {
    munPerdasAtivo,
    cotaPerdasAtiva,
    cotasPerdasDisponiveis,
    cotasPerdasMunEscaladas,
    cotaPerdasAtualEscalada,
    setCotaPerdas,
    dias,
  } = ctx

  if (!cotaPerdasAtualEscalada) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Nenhum dado de perdas por cota disponível para {munPerdasAtivo}.
      </div>
    )
  }

  const v = cotaPerdasAtualEscalada
  const cotasLista = cotasPerdasDisponiveis
  const cotaMin = cotasLista[0]
  const cotaMax = cotasLista[cotasLista.length - 1]

  // Dados para o gráfico de evolução por cota
  const serie = cotasLista.map((c) => ({
    cota: parseFloat(c),
    label: c.replace(".", ","),
    total: cotasPerdasMunEscaladas[c]?.total ?? 0,
    emp: cotasPerdasMunEscaladas[c]?.empresas_vab ?? 0,
  }))
  const maxSerie = Math.max(...serie.map((s) => s.total), 1)

  return (
    <>
      {/* ═══ 1. RESUMO DAS PERDAS OPERACIONAIS POR COTA ═══ */}
      <Section id="resumo-cota" num="1" title={`Perdas Operacionais por Cota: ${munPerdasAtivo}`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <DiasBadge dias={dias} />
          <span className="rounded-md border border-[#055071]/30 bg-[#055071]/10 px-2 py-0.5 text-xs font-bold text-[#055071]">
            Cota Ativa: {cotaPerdasAtiva.replace(".", ",")} m
          </span>
        </div>

        <Note type="info">
          <strong>Metodologia DaLA aplicada a Cotas:</strong> As perdas operacionais estimam o fluxo de produção e
          serviços interrompidos durante a paralisação provocada pela água em cada cota altimétrica do rio. O cálculo
          avalia o VAB perdido das empresas (a partir da massa salarial e insumo-produto), perda de dias letivos e custo
          de reposição escolar (LDB/FUNDEB), interrupção de produção ambulatorial do SUS e perdas de safra agrícola.
        </Note>

        {/* Seletor de Cota */}
        {cotasLista.length > 1 && (
          <div className="mt-4 mb-6">
            <span className="text-[10px] font-black uppercase text-[#055071] block mb-1.5">
              Selecionar Cota Altimétrica (m):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cotasLista.map((c) => (
                <button
                  key={c}
                  onClick={() => setCotaPerdas(c)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-bold transition-all duration-150 ${
                    cotaPerdasAtiva === c
                      ? "border-[#055071] bg-[#055071] text-white shadow-sm"
                      : "border-slate-300 bg-white text-slate-600 hover:border-[#055071] hover:text-[#055071]"
                  }`}
                >
                  {c.replace(".", ",")} m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5 Cards de KPI da Cota Selecionada */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          <div className="rounded-xl border border-[#055071] bg-gradient-to-br from-[#055071] to-[#0a6e9a] p-4 text-white shadow-sm lg:col-span-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
              <TrendingDown size={13} strokeWidth={2.5} /> Total ({dias} dias)
            </div>
            <div className="mt-2 text-2xl font-black">{fmtBRL(v.total)}</div>
            <div className="mt-1 text-[10px] text-white/70">Cota {cotaPerdasAtiva.replace(".", ",")} m</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#055071]">
              <Building2 size={13} strokeWidth={2.5} /> Empresas (VAB)
            </div>
            <div className="mt-2 text-xl font-black text-slate-800">{fmtBRL(v.empresas_vab)}</div>
            <div className="mt-1 text-[11px] text-slate-500">
              <strong>{fmtN(v.empresas_n)}</strong> empresas atingidas
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2da8cc]">
              <GraduationCap size={13} strokeWidth={2.5} /> Educação
            </div>
            <div className="mt-2 text-xl font-black text-slate-800">
              {fmtBRL(v.educacao_perdas + v.educacao_custo_adicional)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              <strong>{fmtN(v.educacao_n)}</strong> escolas atingidas
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#e35d4b]">
              <HeartPulse size={13} strokeWidth={2.5} /> Saúde (SUS)
            </div>
            <div className="mt-2 text-xl font-black text-slate-800">{fmtBRL(v.saude_producao)}</div>
            <div className="mt-1 text-[11px] text-slate-500">
              <strong>{fmtN(v.saude_n)}</strong> unidades afetadas
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#16a34a]">
              <Sprout size={13} strokeWidth={2.5} /> Agricultura
            </div>
            <div className="mt-2 text-xl font-black text-slate-800">{fmtBRL(v.agricultura_perdas)}</div>
            <div className="mt-1 text-[11px] text-slate-500">
              <strong>{fmtN(v.agricultura_ha)}</strong> ha atingidos
            </div>
          </div>
        </div>

        {/* Composição Setorial na Cota */}
        <div className="rounded-xl border border-[#b3cdd8] bg-white p-5 shadow-sm">
          <SubTitle>Composição Setorial das Perdas na Cota {cotaPerdasAtiva.replace(".", ",")} m</SubTitle>
          <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-slate-100 flex">
            {v.total > 0 ? (
              <>
                <div
                  style={{
                    width: `${(v.empresas_vab / v.total) * 100}%`,
                    backgroundColor: "#055071",
                  }}
                  title={`Empresas: ${fmtBRL(v.empresas_vab)}`}
                />
                <div
                  style={{
                    width: `${((v.educacao_perdas + v.educacao_custo_adicional) / v.total) * 100}%`,
                    backgroundColor: "#2da8cc",
                  }}
                  title={`Educação: ${fmtBRL(v.educacao_perdas + v.educacao_custo_adicional)}`}
                />
                <div
                  style={{
                    width: `${(v.saude_producao / v.total) * 100}%`,
                    backgroundColor: "#e35d4b",
                  }}
                  title={`Saúde: ${fmtBRL(v.saude_producao)}`}
                />
                <div
                  style={{
                    width: `${(v.agricultura_perdas / v.total) * 100}%`,
                    backgroundColor: "#16a34a",
                  }}
                  title={`Agricultura: ${fmtBRL(v.agricultura_perdas)}`}
                />
              </>
            ) : (
              <div className="w-full bg-slate-200" />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#055071]" />
              <span>
                Empresas (VAB): <strong>{fmtBRL(v.empresas_vab)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#2da8cc]" />
              <span>
                Educação: <strong>{fmtBRL(v.educacao_perdas + v.educacao_custo_adicional)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#e35d4b]" />
              <span>
                Saúde: <strong>{fmtBRL(v.saude_producao)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#16a34a]" />
              <span>
                Agricultura: <strong>{fmtBRL(v.agricultura_perdas)}</strong>
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 2. EVOLUÇÃO HIDROMÉTRICA DAS PERDAS ═══ */}
      <Section id="evolucao-cota" num="2" title="Evolução das Perdas Conforme o Nível do Rio Sobe">
        <p className="mb-4">
          Comportamento acumulado das perdas operacionais ({dias} dias) da menor cota ({cotaMin.replace(".", ",")} m)
          até o pico modelado ({cotaMax.replace(".", ",")} m).
        </p>

        {/* Gráfico SVG de curva de perdas por cota */}
        <div className="rounded-xl border border-[#b3cdd8] bg-white p-5 shadow-sm">
          <div className="h-64 w-full">
            <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-full">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="#cbd5e1" strokeWidth="1" />

              {/* Area and Line */}
              {serie.length > 1 && (
                <>
                  <polygon
                    points={`40,170 ${serie
                      .map((s, i) => {
                        const x = 40 + (i / (serie.length - 1)) * 540
                        const y = 170 - (s.total / maxSerie) * 150
                        return `${x.toFixed(1)},${y.toFixed(1)}`
                      })
                      .join(" ")} 580,170`}
                    fill="#05507115"
                  />
                  <polyline
                    points={serie
                      .map((s, i) => {
                        const x = 40 + (i / (serie.length - 1)) * 540
                        const y = 170 - (s.total / maxSerie) * 150
                        return `${x.toFixed(1)},${y.toFixed(1)}`
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#055071"
                    strokeWidth="2.5"
                  />
                </>
              )}

              {/* Marcador da cota ativa */}
              {(() => {
                const idx = cotasLista.indexOf(cotaPerdasAtiva)
                if (idx < 0 || serie.length < 2) return null
                const x = 40 + (idx / (serie.length - 1)) * 540
                const y = 170 - (v.total / maxSerie) * 150
                return (
                  <g>
                    <line x1={x} y1="20" x2={x} y2="170" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx={x} cy={y} r="5" fill="#d97706" stroke="#fff" strokeWidth="2" />
                  </g>
                )
              })()}
            </svg>
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-mono mt-2 px-2">
            <span>Cota mínima: {cotaMin.replace(".", ",")} m</span>
            <span className="font-bold text-[#055071]">
              Cota selecionada: {cotaPerdasAtiva.replace(".", ",")} m ({fmtBRL(v.total)})
            </span>
            <span>Cota máxima: {cotaMax.replace(".", ",")} m</span>
          </div>
        </div>
      </Section>

      {/* ═══ 3. TABELA COMPLETA POR COTA ═══ */}
      <Section id="tabela-cotas" num="3" title={`Tabela Completa de Perdas por Cota: ${munPerdasAtivo}`}>
        <p className="mb-4">
          Todas as cotas hidrométricas com detalhamento setorial recalculado para <strong>{dias} dias</strong> de
          interrupção.
        </p>

        <DataTable
          rows={[
            [
              "Cota (m)",
              "Empresas (VAB)",
              "Educação",
              "Saúde (SUS)",
              "Agricultura",
              `Total (${dias}d)`,
            ],
            ...cotasLista.map((c) => {
              const cv = cotasPerdasMunEscaladas[c]
              const ativa = c === cotaPerdasAtiva
              return [
                <button
                  key="c"
                  onClick={() => setCotaPerdas(c)}
                  className={`font-mono text-xs font-bold hover:underline ${
                    ativa ? "text-[#055071] underline font-black" : "text-slate-700"
                  }`}
                >
                  {c.replace(".", ",")} m {ativa && "◀"}
                </button>,
                cv ? `${fmtBRL(cv.empresas_vab)} (${fmtN(cv.empresas_n)})` : "—",
                cv ? fmtBRL(cv.educacao_perdas + cv.educacao_custo_adicional) : "—",
                cv ? fmtBRL(cv.saude_producao) : "—",
                cv ? fmtBRL(cv.agricultura_perdas) : "—",
                cv ? (
                  <strong
                    key="t"
                    className={ativa ? "text-[#055071] font-black" : "text-slate-900"}
                  >
                    {fmtBRL(cv.total)}
                  </strong>
                ) : (
                  "—"
                ),
              ]
            }),
          ]}
        />

        <Note type="warning">
          Para ver a destruição e exposição do estoque de capital (prédios, equipamentos e patrimônio físico sob água),
          acesse a página de{" "}
          <Link href="/danos-fisicos" className="font-bold underline underline-offset-2">
            Danos Físicos
          </Link>
          .
        </Note>
      </Section>
    </>
  )
}
