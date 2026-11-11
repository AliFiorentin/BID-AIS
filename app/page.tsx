"use client"

import React, { useEffect, useRef } from "react"
import Image from "next/image"
import { AlertTriangle, X } from "lucide-react"

import {
  C,
  COLORS,
  INFRA_COLORS,
  AGRI_COLORS,
  AGRI_BOUNDS,
  MANCHA_DURACAO_CENARIO,
  MANCHA_DURACAO_GRADIENT_CSS,
  cenarioLabel,
} from "@/lib/constants"
import { DashboardMap } from "@/components/DashboardMap"
import { LegendItem } from "@/components/LegendItem"
import { useDashboard } from "@/hooks/useDashboard"
import { AnalysisPanel } from "@/components/AnalysisPanel"
import { CenariosComparatorModal } from "@/components/CenariosComparatorModal"
import { ScenarioCompareMap } from "@/components/map/ScenarioCompareMap"
import { DashboardHeader } from "@/components/DashboardHeader"
import { FiltersPanel } from "@/components/FiltersPanel"
import { CotaControle } from "@/components/CotaControle"
import { COR_ALAGADO, COR_FRENTE } from "@/hooks/useCotaRaster"

const BRAND_GRADIENT = "linear-gradient(135deg, #055071 0%, #0a6e9a 100%)"

const glassStyle = (opacity = 0.55) =>
  ({
    backgroundColor: `rgba(255,255,255,${opacity})`,
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    border: "0.5px solid rgba(255,255,255,0.6)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
  }) as const

export default function Dashboard() {
  const dash = useDashboard()
  const {
    municipio,
    cenario,
    camadas,
    infraAtivas,
    showPainelAnalise,
    showFiltros,
    showMancha,
    showLegenda,
    setShowLegenda,
    avisoMancha,
    setAvisoMancha,
    isLoading,
    manchaCenario,
    manchaRS,
    isVisaoGeral,
    isCenarioAtivo,
    temCamadaTabular,
    renderEmp,
    renderEdu,
    renderSau,
    popData,
    showDanoFisico,
    rpDanoFisico,
    renderMunicipio,
    manchaDuracaoClimada,
    cotasAtivo,
    cotaRaster,
    headerBottom,
    resetSeq,
  } = dash

  const mostraDuracaoClimada =
    renderMunicipio === "Porto Alegre" &&
    (cenario === MANCHA_DURACAO_CENARIO || cenario === "Climada Evento 2024")

  // Legenda: nasce aberta e se recolhe sozinha em 6 s se ninguém mexer, reabrindo ao trocar município/cenário ou reiniciar.
  const legendaInteragiu = useRef(false)
  const legendaJaRecolheu = useRef(false)
  const primeiraSelecao = useRef(true)

  useEffect(() => {
    if (primeiraSelecao.current) {
      primeiraSelecao.current = false
      return
    }
    legendaInteragiu.current = false
    legendaJaRecolheu.current = false
    setShowLegenda(true)
  }, [municipio, cenario, resetSeq, setShowLegenda])

  useEffect(() => {
    if (!showLegenda || legendaJaRecolheu.current) return
    const t = setTimeout(() => {
      legendaJaRecolheu.current = true
      if (!legendaInteragiu.current) setShowLegenda(false)
    }, 6000)
    return () => clearTimeout(t)
  }, [showLegenda, setShowLegenda])

  const filtrosVisiveis =
    showFiltros && (temCamadaTabular || isCenarioAtivo) && !isVisaoGeral

  return (
    <main
      className="relative h-screen w-screen overflow-hidden font-sans text-slate-900 print:h-auto print:w-full print:overflow-visible"
      style={{ backgroundColor: C.bg }}
    >
      {/* ── Aviso de tamanho: abaixo de 1150 x 650 px mostra só esta tela ── */}
      <div className="fixed inset-0 z-[100] hidden flex-col items-center justify-center gap-6 bg-white px-8 text-center telefone:flex">
        <Image
          src="/BID.webp"
          alt="BID"
          width={160}
          height={64}
          className="h-12 w-auto object-contain"
        />
        <div className="flex flex-col gap-2">
          <h1
            className="text-xl leading-tight font-black"
            style={{ color: C.primary }}
          >
            Avaliação de Impactos Socioeconômicos
          </h1>
          <p className="text-sm text-slate-500">Painel de Monitoramento</p>
        </div>
        <div
          className="flex max-w-sm flex-col items-center gap-3 rounded-2xl px-6 py-5"
          style={{ backgroundColor: C.cardBg, border: `1px solid ${C.border}` }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.primary}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <p className="text-sm font-bold" style={{ color: C.primary }}>
            Tamanho de tela insuficiente
          </p>
          <p className="text-xs leading-relaxed text-slate-500">
            O painel precisa de uma janela de, no mínimo,{" "}
            <strong>1150 × 650 px</strong>. Aumente a janela do navegador ou
            acesse em um computador.
          </p>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="relative h-11 w-20">
            <Image
              src="/GPEA.webp"
              alt="GPEa"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <div className="relative h-11 w-20">
            <Image
              src="/CIEX2.webp"
              alt="CIEX"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <div className="relative h-11 w-20">
            <Image
              src="/IPH.webp"
              alt="IPH"
              fill
              sizes="80px"
              className="rounded-sm object-contain"
            />
          </div>
        </div>
      </div>

      {/* ── Mapa (fundo) ─────────────────────────────────────────────── */}
      <DashboardMap dash={dash} />

      {/* ── Cartão de logos institucionais: alinhado ao grupo de zoom (128 px), à esquerda dele, na base ── */}
      <div className="pointer-events-none absolute right-[62px] bottom-[8px] z-10 print:hidden">
        <div
          className="flex h-[128px] w-[195px] flex-col items-center justify-center gap-2 rounded-[6px] bg-white/95 px-2.5 py-2 shadow-sm"
          style={{ boxShadow: "0 0 0 2px rgba(0,0,0,0.1)" }}
        >
          <div className="flex w-full items-center justify-center border-b border-black/10 pb-2 pt-0.5">
            <Image
              src="/GPEA.webp"
              alt="GPEa"
              width={140}
              height={44}
              className="object-contain"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "148px",
                maxHeight: "44px",
              }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
          <div className="flex w-full items-center justify-center gap-3 pt-0.5">
            <Image
              src="/CIEX2.webp"
              alt="CIEX"
              width={54}
              height={54}
              className="object-contain"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "52px",
                maxHeight: "48px",
              }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div className="h-8 w-px bg-black/10" />
            <Image
              src="/IPH.webp"
              alt="IPH · UFRGS"
              width={72}
              height={48}
              className="rounded-sm object-contain"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "76px",
                maxHeight: "46px",
              }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        </div>
      </div>

      {/* ── Loading ──────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-end justify-center pb-6 print:hidden">
          <div className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md">
            <svg
              className="h-4 w-4 animate-spin"
              style={{ color: C.primary }}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-xs font-bold text-slate-700">
              Carregando dados...
            </span>
          </div>
        </div>
      )}

      {/* ── Legenda: canto direito, acima do cartão de logos e dos controles do mapa ── */}
      <div
        onPointerDown={() => {
          legendaInteragiu.current = true
        }}
        onPointerEnter={() => {
          legendaInteragiu.current = true
        }}
        onFocus={() => {
          legendaInteragiu.current = true
        }}
        className="absolute right-[6px] bottom-[146px] z-10 flex w-[252px] flex-col justify-end print:hidden"
        style={{
          maxHeight: filtrosVisiveis
            ? "calc(100vh - 320px)"
            : `calc(100vh - ${146 + headerBottom + 44}px)`,
        }}
      >
        <div
          className="flex min-h-0 flex-col overflow-hidden rounded-xl"
          style={glassStyle(0.55)}
        >
          <button
            onClick={() => setShowLegenda((p) => !p)}
            className="flex w-full shrink-0 items-center justify-between gap-3 px-2 py-1.5"
            style={{ background: BRAND_GRADIENT }}
          >
            <span className="text-[8px] font-black tracking-wider text-white uppercase">
              Legenda
            </span>
            <span className="text-white/80" style={{ fontSize: 8 }}>
              {showLegenda ? "▼" : "▲"}
            </span>
          </button>
          {showLegenda && (
            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
              {(() => {
                const mostraDano =
                  showDanoFisico && renderMunicipio === "Porto Alegre"
                const pontos = mostraDano
                  ? []
                  : [
                      camadas.includes("Empresas") && renderEmp?.features && (
                        <LegendItem
                          key="emp"
                          cor={COLORS.empresas}
                          label="Empresas"
                        />
                      ),
                      camadas.includes("Saúde") && renderSau?.features && (
                        <LegendItem
                          key="sau"
                          cor={COLORS.saude}
                          label="Saúde"
                        />
                      ),
                      camadas.includes("Educação") && renderEdu?.features && (
                        <LegendItem
                          key="edu"
                          cor={COLORS.educacao}
                          label="Educação"
                        />
                      ),
                    ].filter(Boolean)

                const mostraInfra =
                  camadas.includes("Infraestrutura") && infraAtivas.length > 0
                const mostraAgri =
                  camadas.includes("Agricultura") &&
                  !isVisaoGeral &&
                  !!AGRI_BOUNDS[municipio]
                const mostraPop =
                  camadas.includes("População") &&
                  !isVisaoGeral &&
                  !!popData?.[municipio]
                const mostraCotas = cotasAtivo && showMancha
                const mostraMancha =
                  !cotasAtivo &&
                  ((!isVisaoGeral && !!manchaCenario && showMancha) ||
                    (isVisaoGeral && !!manchaRS && showMancha))

                const secoes: {
                  key: string
                  titulo: string
                  corpo: React.ReactNode
                }[] = [
                  ...(mostraDano
                    ? [
                        {
                          key: "dano",
                          titulo: `Dano Físico (CLIMADA) · ${rpDanoFisico}`,
                          corpo: (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-16 shrink-0 rounded-sm"
                                  style={{
                                    background:
                                      "linear-gradient(to right, #cbd5e1, #93c5fd, #fbbf24, #f97316, #dc2626, #7f1d1d)",
                                  }}
                                />
                                <div className="flex flex-col gap-0.5 leading-none">
                                  <span
                                    className="text-[10px] font-medium"
                                    style={{ color: C.primary }}
                                  >
                                    0% → 100%
                                  </span>
                                  <span
                                    className="text-[8px]"
                                    style={{ color: C.muted }}
                                  >
                                    do valor de reposição
                                  </span>
                                </div>
                              </div>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(pontos.length > 0
                    ? [{ key: "pontos", titulo: "Pontos", corpo: pontos }]
                    : []),
                  ...(mostraInfra
                    ? [
                        {
                          key: "infra",
                          titulo: "Infraestrutura",
                          corpo: infraAtivas.map((nome) => (
                            <LegendItem
                              key={`infra-${nome}`}
                              cor={INFRA_COLORS[nome] ?? COLORS.infra}
                              label={nome}
                              area={[
                                "Quadras",
                                "Terrenos",
                                "Lotes",
                                "Quarteirões",
                                "Edificações",
                              ].includes(nome)}
                            />
                          )),
                        },
                      ]
                    : []),
                  ...(mostraAgri
                    ? [
                        {
                          key: "agri",
                          titulo: "Agricultura",
                          corpo: Object.entries(AGRI_COLORS).map(
                            ([tipo, cor]) => (
                              <LegendItem
                                key={`agr-${tipo}`}
                                cor={cor}
                                label={tipo}
                                area
                              />
                            )
                          ),
                        },
                      ]
                    : []),
                  ...(mostraPop
                    ? [
                        {
                          key: "pop",
                          titulo: "População",
                          corpo: (
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-16 shrink-0 rounded-sm"
                                style={{
                                  background:
                                    "linear-gradient(to right, #0d0887, #9c179e, #ed7953, #f0f921)",
                                }}
                              />
                              <div className="flex flex-col gap-0.5 leading-none">
                                <span
                                  className="text-[10px] font-medium"
                                  style={{ color: C.primary }}
                                >
                                  Pop. (hab./pixel)
                                </span>
                                <span
                                  className="text-[8px]"
                                  style={{ color: C.muted }}
                                >
                                  baixo → alto
                                </span>
                              </div>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(mostraCotas
                    ? [
                        {
                          key: "cotas",
                          titulo: "Simulação por Cota",
                          corpo: (
                            <>
                              <LegendItem
                                cor={`rgb(${COR_ALAGADO})`}
                                label="Área alagada"
                                area
                              />
                              <LegendItem
                                cor={`rgb(${COR_FRENTE})`}
                                label="Frente de avanço"
                                area
                              />
                            </>
                          ),
                        },
                      ]
                    : []),
                  ...(mostraMancha
                    ? [
                        {
                          key: "mancha",
                          titulo:
                            mostraDuracaoClimada && manchaDuracaoClimada
                              ? "Duração da inundação"
                              : "Cenário",
                          corpo:
                            mostraDuracaoClimada && manchaDuracaoClimada ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-16 shrink-0 rounded-sm"
                                    style={{
                                      background: MANCHA_DURACAO_GRADIENT_CSS,
                                    }}
                                  />
                                  <div className="flex flex-col gap-0.5 leading-none">
                                    <span
                                      className="text-[10px] font-medium"
                                      style={{ color: C.primary }}
                                    >
                                      0 →{" "}
                                      {manchaDuracaoClimada.duracao_max_dias.toFixed(
                                        0
                                      )}{" "}
                                      dias
                                    </span>
                                    <span
                                      className="text-[8px]"
                                      style={{ color: C.muted }}
                                    >
                                      CLIMADA · UNU-EHS
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : isVisaoGeral ? (
                              <LegendItem
                                cor={COLORS.cenario}
                                label="Enchente 2024 — RS"
                                area
                              />
                            ) : (
                              <LegendItem
                                cor={COLORS.cenario}
                                label={cenarioLabel(cenario)}
                                area
                              />
                            ),
                        },
                      ]
                    : []),
                ]

                if (secoes.length === 0)
                  return (
                    <span className="text-[9px]" style={{ color: C.muted }}>
                      Nenhuma camada ativa.
                    </span>
                  )

                return secoes.map(({ key, titulo, corpo }, i) => (
                  <div
                    key={key}
                    className={`flex flex-col gap-1 ${i > 0 ? "border-t pt-2" : ""}`}
                    style={{ borderColor: C.border }}
                  >
                    <div
                      className="text-[8px] font-black tracking-wider uppercase"
                      style={{ color: C.muted }}
                    >
                      {titulo}
                    </div>
                    {corpo}
                  </div>
                ))
              })()}
            </div>
          )}
        </div>
      </div>

      {/* ── Copyright: base, centralizado na área livre do mapa (entre o painel e o bloco de logos) ── */}
      <div
        className={`pointer-events-none absolute right-[330px] bottom-4 z-10 flex items-end justify-center transition-[left] duration-300 print:hidden ${
          showPainelAnalise
            ? cotasAtivo && cotaRaster.cota !== null
              ? "left-[500px]"
              : "left-[432px]"
            : "left-0"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <div
          className="pointer-events-none shrink-0 rounded-xl px-3 py-1 text-center leading-none select-none"
          style={glassStyle(0.55)}
        >
          <span
            className="text-[9px] font-black tracking-wider uppercase"
            style={{ color: C.muted }}
          >
            © GPEa — Grupo de Pesquisa em Economia Azul
          </span>
          <span className="text-[9px]" style={{ color: C.muted }}>
            {" "}
            | Alisson T. G. Fiorentin
          </span>
        </div>
      </div>

      {/* ── Aviso flutuante no mapa (10s com auto-dismiss ou fechar manual) ── */}
      {avisoMancha && (
        <div
          className="pointer-events-none absolute inset-x-0 z-40 flex justify-center px-4 transition-all duration-300 print:hidden"
          style={{ top: (headerBottom ?? 60) + 10 }}
        >
          <div
            className="animate-fade-in-up pointer-events-auto flex max-w-2xl items-start gap-2.5 rounded-2xl border border-amber-300 bg-[#fffef5]/95 px-4 py-2.5 shadow-xl backdrop-blur-md transition-all"
            role="status"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1 text-xs leading-relaxed text-amber-900">
              <strong className="font-bold text-amber-950">
                {avisoMancha.toLowerCase().includes("simulação") ||
                avisoMancha.toLowerCase().includes("simulacao")
                  ? "Aviso de Simulação: "
                  : "Aviso: "}
              </strong>
              <span>
                {avisoMancha.replace(/^(Aviso(\s+de\s+Simula[cç][aã]o)?:\s*)/i, "")}
              </span>
            </div>
            <button
              onClick={() => setAvisoMancha(null)}
              aria-label="Fechar aviso"
              className="shrink-0 rounded-full p-1 text-amber-700/60 transition-colors hover:bg-amber-100 hover:text-amber-900"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Cenário "Todas as cotas": slider vertical acoplado à direita do Painel (432 px = 12 + 420) ── */}
      {cotasAtivo && (cotaRaster.erro || cotaRaster.cota !== null) && (
        <div
          className={`absolute bottom-1.5 z-20 px-2 py-3 transition-[left] duration-300 print:hidden ${
            showPainelAnalise && !cotaRaster.erro
              ? "left-[432px] rounded-r-xl border-l border-slate-300/50 shadow-2xl"
              : showPainelAnalise
                ? "left-[432px] rounded-xl"
                : "left-3 rounded-xl"
          } ${cotaRaster.erro ? "max-w-[140px]" : "w-[68px]"}`}
          style={{
            top: showPainelAnalise ? headerBottom : headerBottom + 44,
            ...(cotaRaster.erro ? { bottom: "auto" } : {}),
            ...glassStyle(showPainelAnalise && !cotaRaster.erro ? 0.6 : 0.8),
          }}
        >
          {cotaRaster.erro ? (
            <p className="text-center text-[11px] text-slate-600">
              Mapa por cota indisponível
            </p>
          ) : (
            <CotaControle
              raster={cotaRaster}
              municipio={municipio}
              vertical
              className="h-full"
              opacidade={dash.opacidadeCota}
              onOpacidadeChange={dash.setOpacidadeCota}
            />
          )}
        </div>
      )}

      <DashboardHeader dash={dash} />

      <FiltersPanel dash={dash} />

      <AnalysisPanel dash={dash} />

      {dash.modoComparacaoMapa && (
        <ScenarioCompareMap
          municipio={dash.municipio}
          onClose={() => dash.setModoComparacaoMapa(false)}
          isFullScreen={true}
        />
      )}

      <CenariosComparatorModal
        isOpen={dash.showComparador}
        onClose={() => dash.setShowComparador(false)}
        municipioAtual={dash.municipio}
        onOpenMapFullScreen={() => dash.setModoComparacaoMapa(true)}
      />
    </main>
  )
}
