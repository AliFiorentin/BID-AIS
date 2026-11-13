"use client"

import { cenarioLabel } from "@/lib/constants"
import type {
  CenarioDanos,
  DanosData,
  SetorResultado,
  CotaSetor,
} from "./types"
import {
  MUN_COLORS,
  COMP_COLORS,
  DIAS_OPCOES,
  SETOR_COLORS,
  scaleTo,
  escalaAgradavel,
  fmtCompacto,
} from "./helpers"
import type { DiasOpcao } from "./helpers"

const CENARIOS_PRINCIPAIS_PADRAO: Record<string, string> = {
  "Eldorado do Sul": "Cenario ADA",
  Lajeado: "Cenario 27m",
  "Porto Alegre": "Climada Evento 2024",
  "Rio Grande": "Cenario Maio 2024",
}

// ─── Gráficos SVG — Danos Operacionais ──────────────────────────────────────────

export function CompositionBar({ v }: { v: CenarioDanos }) {
  const comps = [
    { value: v.empresas_vab, color: COMP_COLORS.empresas },
    {
      value: v.educacao_perdas + v.educacao_custo_adicional,
      color: COMP_COLORS.educacao,
    },
    { value: v.saude_producao, color: COMP_COLORS.saude },
    { value: v.agricultura_perdas, color: COMP_COLORS.agricultura },
  ].filter((c) => c.value > 0)
  const total = comps.reduce((s, c) => s + c.value, 0)
  return (
    <div
      className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
      role="img"
      aria-label="Composição das perdas por componente"
    >
      {comps.map((c, i) => (
        <div
          key={i}
          style={{
            width: `${(c.value / (total || 1)) * 100}%`,
            minWidth: 2,
            backgroundColor: c.color,
          }}
        />
      ))}
    </div>
  )
}

/** Nome do município em até 2 linhas (nomes compostos quebram no 1º espaço após a 1ª palavra) para caber sob a barra. */
function linhasMunicipio(mun: string): string[] {
  const [primeira, ...resto] = mun.split(" ")
  return resto.length === 0 ? [mun] : [primeira, resto.join(" ")]
}

/** Rótulo curto do cenário quebrado em até 2 linhas para nunca truncar "+ 50%" ou "UNU/EHS". */
function linhasCenario(cen: string): string[] {
  const limpo = cenarioLabel(cen).replace(/^Cenário\s*/i, "").trim()
  if (limpo.length <= 11) return [limpo]
  if (limpo.includes(" + ")) {
    const [a, b] = limpo.split(" + ")
    return [a, `+ ${b}`]
  }
  if (limpo.includes(" - ")) {
    const [a, b] = limpo.split(" - ")
    return [`${a} -`, b]
  }
  const palavras = limpo.split(" ")
  if (palavras.length >= 2) {
    return [palavras[0], palavras.slice(1).join(" ")]
  }
  return [limpo]
}

export function TotaisBarChart({
  todosCenarios,
  maxTotal,
}: {
  todosCenarios: { mun: string; cen: string; v: CenarioDanos }[]
  maxTotal: number
}) {
  const barW = 52
  const gap = 14
  const chartH = 140
  const pT = 16
  const pL = 60
  const pB = 72
  const W = pL + todosCenarios.length * (barW + gap) - gap + 12
  const esc = escalaAgradavel(maxTotal)

  return (
    <svg
      viewBox={`0 0 ${W} ${pT + chartH + pB}`}
      className="w-full overflow-visible"
    >
      {esc.ticks.map((val, i) => {
        const y = pT + chartH - (val / esc.max) * chartH
        return (
          <g key={i}>
            <line
              x1={pL - 4}
              y1={y}
              x2={W}
              y2={y}
              stroke="#e2eef3"
              strokeWidth={i === 0 ? 1.5 : 0.75}
            />
            <text
              x={pL - 8}
              y={y + 3}
              textAnchor="end"
              fontSize="8"
              fill="#6b7280"
            >
              {fmtCompacto(val)}
            </text>
          </g>
        )
      })}
      {todosCenarios.map(({ mun, cen, v }, i) => {
        const barH = Math.max((v.total / esc.max) * chartH, 2)
        const x = pL + i * (barW + gap)
        const y = pT + chartH - barH
        const color = MUN_COLORS[mun] ?? "#055071"
        const munLines = linhasMunicipio(mun)
        const cenLines = linhasCenario(cen)
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={color}
              rx="3"
              opacity="0.9"
            />
            <text
              x={x + barW / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="7.5"
              fill={color}
              fontWeight="bold"
            >
              {fmtCompacto(v.total)}
            </text>
            <text
              x={x + barW / 2}
              y={pT + chartH + 14}
              textAnchor="middle"
              fontSize="7.5"
              fill="#374151"
              fontWeight="bold"
            >
              {munLines.map((l, li) => (
                <tspan key={li} x={x + barW / 2} dy={li === 0 ? 0 : 9}>
                  {l}
                </tspan>
              ))}
            </text>
            <text
              x={x + barW / 2}
              y={pT + chartH + 14 + 9 * munLines.length + 2}
              textAnchor="middle"
              fontSize="6.5"
              fill="#6b7280"
            >
              {cenLines.map((l, li) => (
                <tspan key={li} x={x + barW / 2} dy={li === 0 ? 0 : 8}>
                  {l}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function SensibChart({
  dados,
  diasSelecionado,
  cenariosPrincipais = CENARIOS_PRINCIPAIS_PADRAO,
}: {
  dados: DanosData
  diasSelecionado: DiasOpcao
  cenariosPrincipais?: Record<string, string>
}) {
  const municipios = Object.entries(dados).map(([mun, cens]) => {
    const fixo = cenariosPrincipais[mun]
    const entry =
      fixo && cens[fixo]
        ? ([fixo, cens[fixo]] as [string, CenarioDanos])
        : Object.entries(cens).reduce((a, b) =>
            b[1].total > a[1].total ? b : a
          )
    return { mun, cenNome: entry[0], cenValOrig: entry[1] }
  })

  const allVals = municipios.flatMap(({ cenValOrig }) =>
    DIAS_OPCOES.map((d) => scaleTo(cenValOrig, d).total)
  )
  const maxVal = Math.max(...allVals, 1)
  const esc = escalaAgradavel(maxVal)

  const bW = 22
  const bGap = 5
  const gGap = 26
  const gW = DIAS_OPCOES.length * bW + (DIAS_OPCOES.length - 1) * bGap
  const chartH = 120
  const pT = 16
  const pL = 55
  const pB = 56
  const W = pL + municipios.length * (gW + gGap) - gGap + 12

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${pT + chartH + pB}`}
        className="w-full overflow-visible"
      >
        {esc.ticks.map((val, i) => {
          const y = pT + chartH - (val / esc.max) * chartH
          return (
            <g key={i}>
              <line
                x1={pL - 4}
                y1={y}
                x2={W}
                y2={y}
                stroke="#e2eef3"
                strokeWidth={i === 0 ? 1.5 : 0.75}
              />
              <text
                x={pL - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="7.5"
                fill="#6b7280"
              >
                {fmtCompacto(val)}
              </text>
            </g>
          )
        })}
        {municipios.map(({ mun, cenNome, cenValOrig }, gi) => {
          const gx = pL + gi * (gW + gGap)
          const subLabel = cenarioLabel(cenNome).replace(/^Cenário\s*/i, "")
          return (
            <g key={mun}>
              {DIAS_OPCOES.map((d, di) => {
                const sc = scaleTo(cenValOrig, d)
                const barH = Math.max((sc.total / esc.max) * chartH, 1)
                const bx = gx + di * (bW + bGap)
                const by = pT + chartH - barH
                const isSel = d === diasSelecionado
                const color = MUN_COLORS[mun] ?? "#055071"
                return (
                  <g key={d}>
                    <rect
                      x={bx}
                      y={by}
                      width={bW}
                      height={barH}
                      fill={color}
                      opacity={isSel ? 1 : 0.3}
                      rx="2"
                      style={{ transition: "opacity 0.2s" }}
                    />
                    {isSel && (
                      <text
                        x={bx + bW / 2}
                        y={by - 4}
                        textAnchor="middle"
                        fontSize="7"
                        fill={color}
                        fontWeight="bold"
                      >
                        {fmtCompacto(sc.total)}
                      </text>
                    )}
                  </g>
                )
              })}
              <text
                x={gx + gW / 2}
                y={pT + chartH + 14}
                textAnchor="middle"
                fontSize="7.5"
                fill="#374151"
                fontWeight="bold"
              >
                {mun}
              </text>
              <text
                x={gx + gW / 2}
                y={pT + chartH + 24}
                textAnchor="middle"
                fontSize="6.5"
                fill="#6b7280"
              >
                {subLabel}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="mt-2 flex flex-wrap justify-center gap-5">
        {DIAS_OPCOES.map((d) => (
          <div key={d} className="flex items-center gap-1.5">
            <div
              className="h-3 w-4 rounded-sm bg-[#055071]"
              style={{ opacity: d === diasSelecionado ? 1 : 0.3 }}
            />
            <span
              className={`text-[11px] font-medium ${d === diasSelecionado ? "text-[#055071]" : "text-slate-600"}`}
            >
              {d} dias{d === diasSelecionado ? " ◀" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Gráficos SVG — CLIMADA ──────────────────────────────────────────────────────

export function CompositionBarClimada({
  atual,
  setores,
}: {
  atual: Record<string, SetorResultado>
  setores: string[]
}) {
  const total =
    setores.reduce((s, k) => s + atual[k].dano_fisico_total_brl, 0) || 1
  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
      {setores.map((s) => (
        <div
          key={s}
          style={{
            width: `${(atual[s].dano_fisico_total_brl / total) * 100}%`,
            backgroundColor: SETOR_COLORS[s],
          }}
        />
      ))}
    </div>
  )
}

export function RpBarChart({
  rpsDisponiveis,
  resultados,
  setores,
  maxTotal,
  rpAtivo,
}: {
  rpsDisponiveis: string[]
  resultados: Record<string, Record<string, SetorResultado>>
  setores: string[]
  maxTotal: number
  rpAtivo: string
}) {
  const barW = 56
  const gap = 14
  const chartH = 150
  const pT = 16
  const pL = 54
  const pB = 24
  const W = pL + rpsDisponiveis.length * (barW + gap) - gap + 10
  const esc = escalaAgradavel(maxTotal)

  return (
    <svg
      viewBox={`0 0 ${W} ${pT + chartH + pB}`}
      className="w-full overflow-visible"
    >
      {esc.ticks.map((val, i) => {
        const y = pT + chartH - (val / esc.max) * chartH
        return (
          <g key={i}>
            <line
              x1={pL - 4}
              y1={y}
              x2={W}
              y2={y}
              stroke="#e2eef3"
              strokeWidth={i === 0 ? 1.5 : 0.75}
            />
            <text
              x={pL - 8}
              y={y + 3}
              textAnchor="end"
              fontSize="8"
              fill="#6b7280"
            >
              {fmtCompacto(val)}
            </text>
          </g>
        )
      })}
      {rpsDisponiveis.map((r, i) => {
        const d = resultados[r]
        const x = pL + i * (barW + gap)
        let yTop = pT + chartH
        const segs = setores.map((s) => {
          const h = Math.max(
            (d[s].dano_fisico_total_brl / esc.max) * chartH,
            d[s].dano_fisico_total_brl > 0 ? 1 : 0
          )
          yTop -= h
          return { s, y: yTop, h }
        })
        const total = setores.reduce(
          (sum, k) => sum + d[k].dano_fisico_total_brl,
          0
        )
        return (
          <g key={r} opacity={r === rpAtivo ? 1 : 0.55}>
            {segs.map(({ s, y, h }) => (
              <rect
                key={s}
                x={x}
                y={y}
                width={barW}
                height={h}
                fill={SETOR_COLORS[s]}
              />
            ))}
            <rect
              x={x}
              y={pT + chartH - Math.max((total / esc.max) * chartH, 1)}
              width={barW}
              height={Math.max((total / esc.max) * chartH, 1)}
              fill="none"
              stroke={r === rpAtivo ? "#d97706" : "none"}
              strokeWidth="2"
              rx="2"
            />
            <text
              x={x + barW / 2}
              y={yTop - 5}
              textAnchor="middle"
              fontSize="8"
              fill="#374151"
              fontWeight="bold"
            >
              {fmtCompacto(total)}
            </text>
            <text
              x={x + barW / 2}
              y={pT + chartH + 16}
              textAnchor="middle"
              fontSize="9"
              fill={r === rpAtivo ? "#b45309" : "#6b7280"}
              fontWeight="bold"
            >
              {r}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function CotaBarChart({
  cotas,
  resultados,
  setores,
  maxTotal,
  cotaAtiva,
}: {
  cotas: string[]
  resultados: Record<string, Record<string, CotaSetor>>
  setores: string[]
  maxTotal: number
  cotaAtiva: string
}) {
  const barW = 26
  const gap = 8
  const chartH = 150
  const pT = 16
  const pL = 54
  const pB = 24
  const W = pL + cotas.length * (barW + gap) - gap + 10
  const esc = escalaAgradavel(maxTotal)

  return (
    <svg
      viewBox={`0 0 ${W} ${pT + chartH + pB}`}
      className="w-full overflow-visible"
    >
      {esc.ticks.map((val, i) => {
        const y = pT + chartH - (val / esc.max) * chartH
        return (
          <g key={i}>
            <line
              x1={pL - 4}
              y1={y}
              x2={W}
              y2={y}
              stroke="#e2eef3"
              strokeWidth={i === 0 ? 1.5 : 0.75}
            />
            <text
              x={pL - 8}
              y={y + 3}
              textAnchor="end"
              fontSize="8"
              fill="#6b7280"
            >
              {fmtCompacto(val)}
            </text>
          </g>
        )
      })}
      {cotas.map((c, i) => {
        const d = resultados[c]
        const x = pL + i * (barW + gap)
        let yTop = pT + chartH
        const segs = setores.map((st) => {
          const v = d[st].dano_fisico_brl_poa ?? 0
          const h = Math.max((v / esc.max) * chartH, v > 0 ? 1 : 0)
          yTop -= h
          return { st, y: yTop, h }
        })
        const crua = setores.reduce(
          (sum, k) => sum + (d[k].dano_fisico_brl_jrc_crua ?? 0),
          0
        )
        const yCrua = pT + chartH - (crua / esc.max) * chartH
        const ativa = c === cotaAtiva
        return (
          <g key={c} opacity={ativa ? 1 : 0.6}>
            {segs.map(({ st, y, h }) => (
              <rect
                key={st}
                x={x}
                y={y}
                width={barW}
                height={h}
                fill={SETOR_COLORS[st]}
              />
            ))}
            <line
              x1={x - 2}
              x2={x + barW + 2}
              y1={yCrua}
              y2={yCrua}
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            {ativa && (
              <rect
                x={x - 2}
                y={yCrua - 2}
                width={barW + 4}
                height={pT + chartH - yCrua + 2}
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                rx="2"
              />
            )}
            <text
              x={x + barW / 2}
              y={pT + chartH + 16}
              textAnchor="middle"
              fontSize="8"
              fill={ativa ? "#b45309" : "#6b7280"}
              fontWeight="bold"
            >
              {c}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
