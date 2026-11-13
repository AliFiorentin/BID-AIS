"use client"

import React from "react"
import {
  EyeOff,
  PanelLeft,
  LayoutGrid,
  Building2,
  GraduationCap,
  HeartPulse,
  Sprout,
  Wrench,
  Users,
  Waves,
  Info,
} from "lucide-react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  C,
  AGRI_BOUNDS,
  INFRAESTRUTURA_CONFIG,
  MUNICIPIOS,
  PIORES_CENARIOS,
  cenarioLabel,
} from "@/lib/constants"
import { ResumoTab } from "@/components/tabs/ResumoTab"
import { EmpresasTab } from "@/components/tabs/EmpresasTab"
import { EducacaoTab } from "@/components/tabs/EducacaoTab"
import { SaudeTab } from "@/components/tabs/SaudeTab"
import { AgriculturaTab } from "@/components/AgriculturaTab"
import { InfraTab } from "@/components/tabs/InfraTab"
import { CotasPanel } from "@/components/tabs/CotasPanel"
import { popAtingidaNaCota } from "@/hooks/useCotaRaster"
import { findCenarioData } from "@/lib/geo-utils"
import { rotuloPopulacao, AVISO_COTAS_SIMULACAO } from "@/lib/avisos"
import { MetricInfoPopover } from "@/components/MetricInfoPopover"
import type { DashboardState } from "@/hooks/useDashboard"

interface AnalysisPanelProps {
  dash: DashboardState
}

const glassStyle = (opacity = 0.8) =>
  ({
    backgroundColor: `rgba(255,255,255,${opacity})`,
    backdropFilter: "blur(24px) saturate(190%)",
    WebkitBackdropFilter: "blur(24px) saturate(190%)",
    border: "0.5px solid rgba(255,255,255,0.75)",
    boxShadow:
      "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04), inset 0 0.5px 0 0 rgba(255,255,255,0.9)",
  }) as const

export function AnalysisPanel({ dash }: AnalysisPanelProps) {
  const {
    showPainelAnalise,
    setShowPainelAnalise,
    municipio,
    cenario,
    mostraImpacto,
    isVisaoGeral,
    tabAtiva,
    setTabAtiva,
    camadas,
    infraAtivas,
    isCenarioAtivo,
    setoresChart,
    setoresEmpregadosChart,
    metricasEmp,
    baseEmpresas,
    atingidosEmpresas,
    filtroSetor,
    setFiltroSetor,
    metricasEdu,
    professoresDepChart,
    metricasSau,
    atingidosEducacao,
    baseEducacao,
    showListaEscolas,
    setShowListaEscolas,
    atingidosSaude,
    showListaHospitais,
    setShowListaHospitais,
    showListaUBS,
    setShowListaUBS,
    showListaAmbulat,
    setShowListaAmbulat,
    baseAgriStats,
    atingidosAgriStats,
    allMunAgriStats,
    allMunAgriAtingidosStats,
    infraPainel,
    infraAtg,
    areaCotaKm2,
    allMunInfraStats,
    showListaLogradouros,
    setShowListaLogradouros,
    showListaEixos,
    setShowListaEixos,
    popData,
    areaData,
    cotasAtivo,
    cotaRaster,
    cotaDetalhe,
    headerBottom,
    mostrarAvisoMancha,
    avisoDoCenario,
  } = dash

  // Ao entrar no cenário "Todas as cotas", abre a aba "Por cota" e exibe aviso de 10s no mapa; ao sair, volta ao Resumo.
  React.useEffect(() => {
    if (cotasAtivo) {
      setTabAtiva("cotas")
      mostrarAvisoMancha(AVISO_COTAS_SIMULACAO)
    } else if (tabAtiva === "cotas") {
      setTabAtiva("resumo")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cotasAtivo])

  // Population KPI
  const popMunData =
    !isVisaoGeral && popData ? (popData[municipio] ?? null) : null
  const popCenData = (() => {
    if (popMunData && cotasAtivo) {
      const atg = popAtingidaNaCota(cotaRaster.meta, cotaRaster.cota)
      if (atg !== null) {
        return {
          pop_atingida: atg,
          pct_atingida:
            popMunData.pop_total > 0
              ? (100 * atg) / popMunData.pop_total
              : 0,
        }
      }
      const fallback = findCenarioData(popMunData.cenarios, cenario)
      if (fallback) return fallback
      return null
    }
    if (!popMunData || !cenario || cenario === "(nenhum)") return null
    return findCenarioData(popMunData.cenarios, cenario)
  })()

  const popGeralTotal =
    isVisaoGeral && popData
      ? MUNICIPIOS.reduce((acc, m) => acc + (popData[m]?.pop_total ?? 0), 0)
      : null
  const popGeralAtingida =
    isVisaoGeral && popData
      ? MUNICIPIOS.reduce((acc, m) => {
          const d = popData[m]
          if (!d) return acc
          const cen = PIORES_CENARIOS[m]
          const cenData = cen ? findCenarioData(d.cenarios, cen) : null
          return acc + (cenData?.pop_atingida ?? 0)
        }, 0)
      : null
  const popGeralPct =
    popGeralTotal && popGeralAtingida != null && popGeralTotal > 0
      ? (popGeralAtingida / popGeralTotal) * 100
      : null

  const temTrilhoCota =
    cotasAtivo && !cotaRaster.erro && cotaRaster.cota !== null

  const rotuloPop = !isVisaoGeral ? rotuloPopulacao(popCenData) : null

  return (
    <>
      {showPainelAnalise && (
        <div
          role="region"
          aria-label="Painel de análise"
          className={`absolute bottom-1.5 left-3 z-20 flex w-[420px] flex-col overflow-hidden p-4 shadow-2xl print:static print:flex print:h-auto print:max-h-none print:w-full print:overflow-visible print:border-slate-200 print:shadow-none ${
            temTrilhoCota ? "rounded-l-2xl" : "rounded-2xl"
          }`}
          style={{
            top: headerBottom,
            ...glassStyle(0.8),
            animation: "panelSlideIn 320ms var(--ease-drawer) both",
          }}
        >
          <div className="mb-2.5 shrink-0">
            <h2
              className="flex items-center justify-between text-base font-black tracking-tight"
              style={{ color: C.primary }}
            >
              Painel
              <div className="flex gap-1 print:hidden">
                {!isVisaoGeral && cenario !== "(nenhum)" && (
                  <button
                    onClick={() => mostrarAvisoMancha(avisoDoCenario(cenario))}
                    title="Sobre o cenário de inundação"
                    className="active-press hover-lift flex h-6 w-6 items-center justify-center rounded-full bg-slate-200/80 text-slate-700 hover:bg-slate-300 active:scale-[0.95] transition-all"
                  >
                    <Info size={12} strokeWidth={2.5} />
                  </button>
                )}
                <button
                  onClick={() => setShowPainelAnalise(false)}
                  className="active-press hover-lift flex h-6 items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 px-2.5 text-[11px] font-bold text-slate-700 hover:bg-white active:scale-[0.96] transition-all"
                >
                  <EyeOff size={10} strokeWidth={2.5} />
                  Ocultar
                </button>
              </div>
            </h2>
            <p className="mt-0.5 text-xs leading-tight" style={{ color: C.muted }}>
              <strong style={{ color: C.primary }}>{isVisaoGeral ? "Visão Geral" : municipio}</strong>
              {(mostraImpacto || cotasAtivo) &&
                (isVisaoGeral
                  ? " · 4 municípios · Cenário ADA"
                  : ` · ${cenarioLabel(cenario)}`)}
            </p>
          </div>

          <Tabs
            value={tabAtiva}
            className="flex flex-1 flex-col overflow-hidden print:h-auto print:overflow-visible"
          >
            <div className="flex shrink-0 flex-wrap gap-1 pb-2">
              {(
                [
                  ...(cotasAtivo
                    ? [
                        {
                          value: "cotas",
                          label: "Por cota",
                          icon: <Waves size={11} strokeWidth={2.5} />,
                        },
                      ]
                    : []),
                  {
                    value: "resumo",
                    label: "Resumo",
                    icon: <LayoutGrid size={11} strokeWidth={2.5} />,
                  },
                  {
                    value: "empresas",
                    label: "Empresas",
                    icon: <Building2 size={11} strokeWidth={2.5} />,
                  },
                  {
                    value: "educacao",
                    label: "Educação",
                    icon: <GraduationCap size={11} strokeWidth={2.5} />,
                  },
                  {
                    value: "saude",
                    label: "Saúde",
                    icon: <HeartPulse size={11} strokeWidth={2.5} />,
                  },
                  ...(camadas.includes("Agricultura") &&
                  (isVisaoGeral || AGRI_BOUNDS[municipio])
                    ? [
                        {
                          value: "agricultura",
                          label: "Agricultura",
                          icon: <Sprout size={11} strokeWidth={2.5} />,
                        },
                      ]
                    : []),
                  ...(isVisaoGeral ||
                  (INFRAESTRUTURA_CONFIG[municipio]?.length ?? 0) > 0
                    ? [
                        {
                          value: "infra",
                          label: "Infraestrutura",
                          icon: <Wrench size={11} strokeWidth={2.5} />,
                        },
                      ]
                    : []),
                ] as { value: string; label: string; icon: React.ReactNode }[]
              ).map(({ value, label, icon }) => {
                const isActive = tabAtiva === value
                return (
                  <button
                    key={value}
                    onClick={() => {
                      setTabAtiva(value)
                      if (value === "cotas") {
                        mostrarAvisoMancha(AVISO_COTAS_SIMULACAO)
                      }
                    }}
                    className={`active-press hover-lift flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      isActive
                        ? "border-transparent text-white shadow-sm"
                        : "border-[#b3cdd8] bg-white/70 text-[#055071] hover:bg-white"
                    }`}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(135deg, #055071 0%, #0a6e9a 100%)",
                          }
                        : undefined
                    }
                  >
                    {icon}
                    {label}
                  </button>
                )
              })}
            </div>

            {/* KPI fixo de população — largura total, abaixo das abas */}
            {(popMunData || isVisaoGeral) &&
              (popMunData || popGeralTotal != null) && (
                <div
                  className="mb-1 shrink-0 overflow-hidden rounded-lg border"
                  style={{
                    borderColor: "#e9d5ff",
                    background:
                      "linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)",
                  }}
                >
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <Users
                      size={13}
                      strokeWidth={2.5}
                      className="shrink-0 text-purple-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-end justify-between gap-1">
                        <div className="min-w-0">
                          <div className="mb-0.5 flex items-center gap-1">
                            <span className="text-[11px] leading-none font-bold tracking-wider text-purple-500 uppercase">
                              Pop. Total
                            </span>
                            <MetricInfoPopover metricKey="populacao" title="População Residente" corIcone="#a855f7" iconSize={10} />
                          </div>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xs font-black text-purple-800 tabular-nums">
                              {(isVisaoGeral
                                ? popGeralTotal
                                : popMunData?.pop_total
                              )?.toLocaleString("pt-BR")}
                            </span>
                            <span className="text-[11px] text-purple-400">
                              hab.
                            </span>
                          </div>
                        </div>
                        {(isVisaoGeral
                          ? popGeralAtingida != null
                          : cenario !== "(nenhum)") && (
                          <div className="min-w-0 shrink-0 text-right">
                            <div className="mb-0.5 text-[11px] leading-none font-bold tracking-wider text-red-500 uppercase">
                              {isVisaoGeral
                                ? "Atingida (piores)"
                                : rotuloPop?.estimado
                                  ? "Atingida (estimada)"
                                  : "Atingida"}
                            </div>
                            {isVisaoGeral || popCenData ? (
                              <div className="flex items-baseline justify-end gap-0.5">
                                <span className="text-xs font-black text-red-700 tabular-nums">
                                  {(isVisaoGeral
                                    ? popGeralAtingida
                                    : popCenData?.pop_atingida
                                  )?.toLocaleString("pt-BR")}
                                </span>
                                <span className="text-[11px] text-red-400">
                                  (
                                  {(isVisaoGeral
                                    ? popGeralPct
                                    : popCenData?.pct_atingida
                                  )?.toFixed(1)}
                                  %)
                                </span>
                              </div>
                            ) : (
                              <div className="text-[11px] font-semibold text-slate-500">
                                {rotuloPop?.texto}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {(isVisaoGeral ? popGeralPct != null : !!popCenData) && (
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-purple-100">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(isVisaoGeral ? (popGeralPct ?? 0) : (popCenData?.pct_atingida ?? 0), 100)}%`,
                              background:
                                "linear-gradient(to right, #9333ea, #dc2626)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {cotasAtivo && (
              <TabsContent
                value="cotas"
                className="mt-2 flex flex-1 flex-col overflow-hidden"
              >
                <CotasPanel
                  raster={cotaRaster}
                  detalhe={cotaDetalhe}
                  municipio={municipio}
                  cenario={cenario}
                  isVisaoGeral={isVisaoGeral}
                  mostraImpacto={mostraImpacto}
                />
              </TabsContent>
            )}

            <ResumoTab
              dash={{
                municipio,
                cenario,
                mostraImpacto,
                isVisaoGeral,
                isCenarioAtivo,
                metricasEmp,
                metricasEdu,
                metricasSau,
                baseAgriStats,
                atingidosAgriStats,
                allMunAgriStats,
                allMunAgriAtingidosStats,
                infraPainel,
                infraAtg,
                allMunInfraStats,
                areaData,
                areaCotaKm2,
              }}
            />

            <EmpresasTab
              dash={{
                setoresChart,
                setoresEmpregadosChart,
                metricasEmp,
                mostraImpacto,
                baseEmpresas,
                atingidosEmpresas,
                filtroSetor,
                setFiltroSetor,
              }}
            />

            <EducacaoTab
              dash={{
                metricasEdu,
                professoresDepChart,
                mostraImpacto,
                isVisaoGeral,
                atingidosEducacao,
                baseEducacao,
                showListaEscolas,
                setShowListaEscolas,
              }}
            />

            <SaudeTab
              dash={{
                metricasSau,
                mostraImpacto,
                isVisaoGeral,
                atingidosSaude,
                showListaHospitais,
                setShowListaHospitais,
                showListaUBS,
                setShowListaUBS,
                showListaAmbulat,
                setShowListaAmbulat,
              }}
            />

            {camadas.includes("Agricultura") &&
              (isVisaoGeral || AGRI_BOUNDS[municipio]) && (
                <AgriculturaTab
                  municipio={municipio}
                  cenario={cenario}
                  isVisaoGeral={isVisaoGeral}
                  isCenarioAtivo={isCenarioAtivo}
                  baseAgriStats={baseAgriStats}
                  atingidosAgriStats={atingidosAgriStats}
                  allMunAgriStats={allMunAgriStats ?? undefined}
                  allMunAgriAtingidosStats={
                    allMunAgriAtingidosStats ?? undefined
                  }
                />
              )}

            {(isVisaoGeral ||
              (INFRAESTRUTURA_CONFIG[municipio]?.length ?? 0) > 0) && (
              <InfraTab
                dash={{
                  municipio,
                  cenario,
                  isVisaoGeral,
                  mostraImpacto,
                  isCenarioAtivo,
                  infraPainel,
                  infraAtg,
                  allMunInfraStats,
                  showListaLogradouros,
                  setShowListaLogradouros,
                  showListaEixos,
                  setShowListaEixos,
                  areaData,
                  areaCotaKm2,
                  camadas,
                  infraAtivas,
                }}
              />
            )}
          </Tabs>
        </div>
      )}

      {!showPainelAnalise && (
        <button
          onClick={() => setShowPainelAnalise(true)}
          className="active-press hover-lift absolute left-4 z-20 flex h-9 items-center gap-2 rounded-full px-4 text-xs font-bold shadow-2xl active:scale-[0.97] transition-all duration-150 print:hidden"
          style={{
            top: headerBottom,
            ...glassStyle(0.8),
            color: C.primary,
          }}
        >
          <PanelLeft size={13} strokeWidth={2.5} />
          Abrir Painel de Análise
        </button>
      )}
    </>
  )
}
