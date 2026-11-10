import React, { useMemo } from "react"
import Link from "next/link"
import { TabsContent } from "@/components/ui/tabs"
import { DonutChart } from "@/components/ui/donut-chart"
import { C, COLORS, DONUT_COLORS, PANEL_CARD_BG } from "@/lib/constants"
import { compactoBr, inteiroBr, calcPct, formatName, formatoBr } from "@/lib/geo-utils"
import { detectarPilha, pontosNaPilha } from "@/lib/pilhas"
import { KPIRow } from "@/components/KPIRow"
import type { DashboardState } from "@/hooks/useDashboard"

const PANEL_HDR = {
  background: "linear-gradient(135deg, #055071 0%, #0a6e9a 100%)",
} as const
const PANEL_GLASS: React.CSSProperties = {
  border: "1px solid rgba(5,80,113,0.15)",
  backgroundColor: PANEL_CARD_BG,
}

interface Props {
  dash: Pick<
    DashboardState,
    | "setoresChart"
    | "setoresEmpregadosChart"
    | "metricasEmp"
    | "mostraImpacto"
    | "baseEmpresas"
    | "atingidosEmpresas"
    | "filtroSetor"
    | "setFiltroSetor"
  >
}

export function EmpresasTab({ dash }: Props) {
  const {
    setoresChart,
    setoresEmpregadosChart,
    metricasEmp,
    mostraImpacto,
    baseEmpresas,
    atingidosEmpresas,
    filtroSetor,
    setFiltroSetor,
  } = dash

  const pilhaInfo = useMemo(() => {
    const featsBase = baseEmpresas?.features ?? []
    const pilha = detectarPilha(featsBase)
    if (!pilha) return null
    const nAtg = mostraImpacto
      ? pontosNaPilha(atingidosEmpresas?.features ?? [], pilha)
      : 0
    return { pilha, nAtg }
  }, [baseEmpresas, atingidosEmpresas, mostraImpacto])

  const { donutData, total, totalAtg, setorColorMap } = useMemo(() => {
    const colorMap: Record<string, string> = {}
    const data = setoresChart.map((item, i) => {
      const color = DONUT_COLORS[i % DONUT_COLORS.length]
      colorMap[item.setor] = color
      return {
        label: formatName(item.setor),
        value: mostraImpacto ? item.atg : item.base,
        color,
      }
    })
    const t = setoresChart.reduce((s, d) => s + d.base, 0)
    const tAtg = setoresChart.reduce((s, d) => s + d.atg, 0)
    return {
      donutData: data,
      total: t,
      totalAtg: tAtg,
      setorColorMap: colorMap,
    }
  }, [setoresChart, mostraImpacto])

  const toggleSetor = (setor: string) => {
    setFiltroSetor(filtroSetor === setor ? "(todos)" : setor)
  }

  return (
    <TabsContent
      value="empresas"
      className="mt-3 flex-1 overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent"
    >
      {pilhaInfo && (
        <div
          role="note"
          className="mb-2.5 rounded-lg border border-amber-300/80 bg-amber-50/90 px-2.5 py-2 text-[10px] leading-snug text-amber-950"
        >
          <strong>Geocodificação aproximada:</strong>{" "}
          {formatoBr(pilhaInfo.pilha.n)} estabelecimentos
          {pilhaInfo.pilha.ceps > 0
            ? ` (de ${formatoBr(pilhaInfo.pilha.ceps)} CEPs diferentes)`
            : ""}{" "}
          caíram num mesmo ponto padrão da cidade quando o endereço não foi
          localizado
          {mostraImpacto ? (
            pilhaInfo.nAtg > 0 ? (
              <>
                {" "}
                — neste cenário esse ponto está na mancha e responde por{" "}
                <strong>
                  {formatoBr(pilhaInfo.nAtg)} dos atingidos
                </strong>
              </>
            ) : (
              <> — neste cenário esse ponto ficou fora da mancha</>
            )
          ) : null}
          .{" "}
          <Link
            href="/metodologia#limitacoes"
            className="font-semibold underline hover:no-underline"
          >
            Entenda na Metodologia →
          </Link>
        </div>
      )}

      {setoresChart.length > 0 && (
        <div
          className="mb-3 overflow-hidden rounded-lg"
          style={{ border: "1px solid rgba(5,80,113,0.15)" }}
        >
          <div
            className="flex items-center justify-between px-2.5 py-1.5"
            style={PANEL_HDR}
          >
            <h3 className="text-[10px] font-black tracking-wider text-white uppercase">
              Empresas por Setor
            </h3>
            {filtroSetor !== "(todos)" && (
              <button
                onClick={() => setFiltroSetor("(todos)")}
                className="text-[9px] font-bold text-white/85 hover:text-white"
              >
                ✕ Limpar filtro
              </button>
            )}
          </div>
          <div
            className="flex flex-col"
            style={{ backgroundColor: PANEL_CARD_BG }}
          >
            <div className="flex items-center justify-center py-2">
              <DonutChart
                data={donutData}
                size={165}
                strokeWidth={22}
                centerContent={
                  <div className="flex flex-col items-center justify-center text-center">
                    <span
                      className="text-2xl leading-none font-black"
                      style={{ color: C.primary }}
                    >
                      {mostraImpacto ? inteiroBr(totalAtg) : inteiroBr(total)}
                    </span>
                    <span
                      className="mt-1 text-[9px] leading-none"
                      style={{ color: C.muted }}
                    >
                      {mostraImpacto
                        ? `de ${inteiroBr(total)} (${total > 0 ? Math.round((totalAtg / total) * 100) : 0}%)`
                        : "empresas"}
                    </span>
                  </div>
                }
              />
            </div>
            <div className="flex flex-col gap-1 px-2.5 pb-2.5">
              {setoresChart.map((item, i) => {
                const isSelected = filtroSetor === item.setor
                return (
                  <button
                    type="button"
                    key={item.setor}
                    onClick={() => toggleSetor(item.setor)}
                    className={`flex items-center gap-2 rounded px-1 py-0.5 text-left transition-colors ${isSelected ? "bg-[#055071]/15 font-bold" : "hover:bg-slate-200/50"}`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length],
                      }}
                    />
                    <span
                      className="flex-1 truncate text-[10px]"
                      style={{ color: isSelected ? C.primary : C.muted }}
                      title={item.setor}
                    >
                      {item.setor}
                    </span>
                    <span
                      className="text-[10px] font-bold tabular-nums"
                      style={{ color: C.primary }}
                    >
                      {mostraImpacto
                        ? `${inteiroBr(item.atg)}/${inteiroBr(item.base)}`
                        : inteiroBr(item.base)}
                    </span>
                    <span
                      className="w-9 text-right text-[10px] tabular-nums"
                      style={{ color: C.muted }}
                    >
                      {mostraImpacto
                        ? `${item.base > 0 ? Math.round((item.atg / item.base) * 100) : 0}%`
                        : `${total > 0 ? Math.round((item.base / total) * 100) : 0}%`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2 pb-2">
        <KPIRow
          titulo="Empregados"
          cor={COLORS.empresas}
          valor={compactoBr(
            mostraImpacto ? metricasEmp.impacto.emp : metricasEmp.base.emp,
            0
          )}
          sub={mostraImpacto ? "Atingidos" : "Total"}
          delta={
            mostraImpacto
              ? `de ${compactoBr(metricasEmp.base.emp, 0)} (${calcPct(metricasEmp.impacto.emp, metricasEmp.base.emp)})`
              : undefined
          }
        />
        {setoresEmpregadosChart.length > 0 && (
          <div className="-mt-1 mb-1 overflow-hidden rounded-lg">
            <div className="flex items-center px-2.5 py-1.5" style={PANEL_HDR}>
              <span className="text-[10px] font-black tracking-wider text-white uppercase">
                Empregados por Setor
              </span>
            </div>
            <div
              className="flex flex-col gap-1 px-2.5 py-2.5"
              style={PANEL_GLASS}
            >
              {setoresEmpregadosChart.map(({ setor, base, atg }, i) => {
                const barColor =
                  setorColorMap[setor] ?? DONUT_COLORS[i % DONUT_COLORS.length]
                const totalBase = setoresEmpregadosChart.reduce(
                  (s, r) => s + r.base,
                  0
                )
                return (
                  <div key={setor} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: barColor }}
                    />
                    <span
                      className="flex-1 truncate text-[10px]"
                      style={{ color: C.muted }}
                      title={setor}
                    >
                      {setor}
                    </span>
                    <span
                      className="text-[10px] font-bold tabular-nums"
                      style={{ color: C.primary }}
                    >
                      {mostraImpacto
                        ? `${inteiroBr(atg)}/${inteiroBr(base)}`
                        : inteiroBr(base)}
                    </span>
                    <span
                      className="w-9 text-right text-[10px] tabular-nums"
                      style={{ color: C.muted }}
                    >
                      {mostraImpacto
                        ? `${base > 0 ? Math.round((atg / base) * 100) : 0}%`
                        : `${totalBase > 0 ? Math.round((base / totalBase) * 100) : 0}%`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <KPIRow
          titulo="Massa Salarial"
          cor={COLORS.empresas}
          valor={`R$ ${compactoBr(mostraImpacto ? metricasEmp.impacto.massa : metricasEmp.base.massa, 1)}`}
          sub="Mensal Estimada"
          delta={
            mostraImpacto
              ? `de R$ ${compactoBr(metricasEmp.base.massa, 1)} (${calcPct(metricasEmp.impacto.massa, metricasEmp.base.massa)})`
              : undefined
          }
        />
        <KPIRow
          titulo="Média Salarial"
          cor={COLORS.empresas}
          valor={`R$ ${compactoBr(mostraImpacto ? metricasEmp.impacto.media : metricasEmp.base.media, 1)}`}
          sub="Por Estabelecimento"
        />
      </div>
      <p
        className="mt-2 border-t pt-2 text-[9px] italic"
        style={{ color: C.muted, borderColor: C.border }}
      >
        Fonte: RAIS — Relação Anual de Informações Sociais
      </p>
    </TabsContent>
  )
}
