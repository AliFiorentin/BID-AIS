"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Building2,
  GraduationCap,
  HeartPulse,
  Wrench,
  Sprout,
  Users,
  TrendingDown,
  Waves,
  BookOpen,
  RotateCcw,
  GitCompare,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  C,
  MUNICIPIOS,
  CENARIOS_CONFIG,
  INFRAESTRUTURA_CONFIG,
  AGRI_BOUNDS,
  cenarioLabel,
} from "@/lib/constants"
import type { DashboardState } from "@/hooks/useDashboard"

interface DashboardHeaderProps {
  dash: DashboardState
}

const HEADER_FLUID = {
  titleSize: "clamp(11px, 1.05vw, 15px)",
  subtitleSize: "clamp(7px, 0.65vw, 9px)",
}

const HEADER_GLASS = {
  backgroundImage:
    "linear-gradient(135deg, rgba(5,80,113,0.84) 0%, rgba(10,110,154,0.84) 100%)",
  backdropFilter: "saturate(180%) blur(20px)",
  WebkitBackdropFilter: "saturate(180%) blur(20px)",
  border: "0.5px solid rgba(255,255,255,0.18)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)",
} as const

const NAV_LINK_CLASS =
  "active-press hover-lift flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 font-black whitespace-nowrap text-white/90 hover:bg-white/20 focus-visible:outline-none"
const NAV_LINK_STYLE = {
  fontSize: "var(--btn-size)",
  height: "var(--btn-h)",
} as const

/** Nome da camada ao passar o mouse (o título nativo demora e some); `aria-hidden`: o botão já tem nome acessível. */
function TipCamada({ texto }: { texto: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-full left-1/2 z-40 mt-1.5 hidden -translate-x-1/2 rounded-md bg-slate-900/95 px-2 py-1 text-[10px] leading-none font-bold whitespace-nowrap text-white shadow-xl backdrop-blur-sm group-hover/tip:block"
    >
      {texto}
    </span>
  )
}

export function DashboardHeader({ dash }: DashboardHeaderProps) {
  const {
    municipio,
    setMunicipio,
    renderMunicipio,
    cenario,
    setCenario,
    camadas,
    infraAtivas,
    isVisaoGeral,
    possuiInfra,
    toggleCamada,
    toggleInfra,
    toggleMenuInfra,
    reiniciar,
    headerRef,
  } = dash

  const subtitulo =
    renderMunicipio === "Visão Geral RS"
      ? "Painel de Monitoramento · RS"
      : `${renderMunicipio}, RS`

  const camadasBotoes: {
    id: string
    label: string
    icon: React.ReactNode
  }[] = [
    {
      id: "Empresas",
      label: "Empresas",
      icon: <Building2 size={11} strokeWidth={2.5} />,
    },
    {
      id: "Saúde",
      label: "Saúde",
      icon: <HeartPulse size={11} strokeWidth={2.5} />,
    },
    {
      id: "Educação",
      label: "Educação",
      icon: <GraduationCap size={11} strokeWidth={2.5} />,
    },
    ...(isVisaoGeral || AGRI_BOUNDS[municipio]
      ? [
          {
            id: "Agricultura",
            label: "Agricultura",
            icon: <Sprout size={11} strokeWidth={2.5} />,
          },
        ]
      : []),
    {
      id: "População",
      label: "População",
      icon: <Users size={11} strokeWidth={2.5} />,
    },
  ]

  const infraAtivo =
    camadas.includes("Infraestrutura") && infraAtivas.length > 0

  return (
    <header
      ref={headerRef}
      className="dash-header absolute top-1.5 right-3 left-3 z-30 flex flex-wrap items-center rounded-xl shadow-2xl print:hidden"
      style={{
        ...HEADER_GLASS,
        paddingInline: "0.75rem",
        paddingBlock: "0.25rem",
        gap: "var(--section-gap)",
      }}
    >
      {/* Ícone do projeto + título e subtítulo */}
      <div
        className="flex shrink-0 items-center gap-2.5 border-r"
        style={{
          borderColor: "rgba(255,255,255,0.2)",
          paddingRight: "var(--section-gap)",
        }}
      >
        <div className="flex shrink-0 items-center justify-center rounded-lg bg-white/95 px-2 py-0.5 shadow-sm">
          <Image
            src="/BID.webp"
            alt="BID"
            width={72}
            height={28}
            className="shrink-0 object-contain"
            style={{ height: "var(--logo-h)", width: "auto" }}
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <h1
            className="leading-tight font-black whitespace-nowrap text-white"
            style={{ fontSize: HEADER_FLUID.titleSize }}
          >
            Avaliação de Impactos Socioeconômicos
          </h1>
          <span
            className="font-medium tracking-wider whitespace-nowrap text-white/75 uppercase"
            style={{ fontSize: HEADER_FLUID.subtitleSize }}
          >
            {subtitulo}
          </span>
        </div>
      </div>

      {/* Perdas Operacionais / Danos Físicos / Metodologia — empurram o resto para a direita (mr-auto) */}
      <div className="grid shrink-0 grid-cols-2 gap-0.5 max-[1999px]:flex max-[1999px]:flex-row max-[1999px]:gap-1 min-[1260px]:mr-auto">
        <Link
          href="/perdas-operacionais"
          className={NAV_LINK_CLASS}
          style={NAV_LINK_STYLE}
          title="Ver perdas operacionais (DaLA)"
        >
          <TrendingDown size={11} strokeWidth={2.5} />
          <span className="min-[2000px]:hidden">Perdas</span>
          <span className="max-[1999px]:hidden">Perdas Operacionais</span>
        </Link>
        <Link
          href="/danos-fisicos"
          className={NAV_LINK_CLASS}
          style={NAV_LINK_STYLE}
          title="Ver danos físicos (exposição e CLIMADA)"
        >
          <Waves size={11} strokeWidth={2.5} />
          <span className="min-[2000px]:hidden">Danos</span>
          <span className="max-[1999px]:hidden">Danos Físicos</span>
        </Link>
        <Link
          href="/metodologia"
          className={NAV_LINK_CLASS}
          style={NAV_LINK_STYLE}
          title="Ver metodologia do painel"
        >
          <BookOpen size={11} strokeWidth={2.5} />
          Metodologia
        </Link>
        <button
          type="button"
          onClick={() => dash.setShowComparador(true)}
          className={`${NAV_LINK_CLASS} cursor-pointer`}
          style={NAV_LINK_STYLE}
          title="Comparar dois cenários lado a lado"
        >
          <GitCompare size={11} strokeWidth={2.5} />
          <span className="min-[2000px]:hidden">Comparar</span>
          <span className="max-[1999px]:hidden">Comparar Cenários</span>
        </button>
      </div>

      {/* Município */}
      <div className="flex w-[var(--select-w)] shrink-0 flex-col gap-0 max-[1259px]:w-auto max-[1259px]:min-w-[var(--select-w)] max-[1259px]:flex-1">
        <label
          className="font-bold tracking-wider whitespace-nowrap text-white/75 uppercase"
          style={{ fontSize: "var(--select-label)" }}
        >
          Município
        </label>
        <Select value={municipio} onValueChange={setMunicipio}>
          <SelectTrigger
            aria-label="Município"
            className="w-full min-w-0 border-white/20 text-white"
            style={{
              backgroundColor: `${C.field}cc`,
              fontSize: "var(--select-trigger)",
              height: "var(--select-h)",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start" sideOffset={4}>
            <SelectItem value="Visão Geral RS" className="font-bold text-[#055071]">
              Visão Geral RS
            </SelectItem>
            {MUNICIPIOS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cenário de Inundação + Reiniciar seleções */}
      <div className="flex w-[calc(var(--select-w)+var(--section-gap)+var(--select-h)+4px)] shrink-0 flex-col gap-0 border-r border-white/20 pr-[var(--section-gap)] max-[1259px]:w-auto max-[1259px]:min-w-[var(--select-w)] max-[1259px]:flex-1 max-[1259px]:border-r-0 max-[1259px]:pr-0">
        <label
          className="font-bold tracking-wider whitespace-nowrap text-white/75 uppercase"
          style={{ fontSize: "var(--select-label)" }}
        >
          Cenário de Inundação
        </label>
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <Select
              value={cenario}
              onValueChange={setCenario}
              disabled={isVisaoGeral}
            >
              <SelectTrigger
                aria-label="Cenário de inundação"
                className="w-full min-w-0 border-white/20 text-white disabled:opacity-60"
                style={{
                  backgroundColor: `${C.field}cc`,
                  fontSize: "var(--select-trigger)",
                  height: "var(--select-h)",
                }}
              >
                <SelectValue
                  placeholder={isVisaoGeral ? "Piores Cenários" : "(nenhum)"}
                />
              </SelectTrigger>
              <SelectContent position="popper" align="start" sideOffset={4}>
                <SelectItem value="(nenhum)">(Ver Total)</SelectItem>
                {(CENARIOS_CONFIG[municipio] || []).map((c) => (
                  <SelectItem key={c} value={c}>
                    {cenarioLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="group/tip relative flex shrink-0">
            <button
              type="button"
              onClick={reiniciar}
              aria-label="Reiniciar seleções"
              className="active-press hover-lift flex items-center justify-center rounded-md border border-white/20 text-white/90 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
              style={{
                backgroundColor: C.field,
                height: "var(--select-h)",
                width: "var(--select-h)",
              }}
            >
              <RotateCcw size={12} strokeWidth={2.5} />
            </button>
            <TipCamada texto="Reiniciar seleções" />
          </span>
        </div>
      </div>

      {/* Camadas — na mesma linha do cabeçalho; só ícone (título no hover) abaixo de 2200 px */}
      <div className="flex flex-col gap-0 max-[1259px]:order-last max-[1259px]:basis-full">
        <span
          className="font-bold tracking-wider whitespace-nowrap text-white/75 uppercase"
          style={{ fontSize: "var(--select-label)" }}
        >
          Camadas
        </span>
        <div className="flex items-center" style={{ gap: "var(--layer-gap)" }}>
          {camadasBotoes.map(({ id, label, icon }) => {
            const ativo = camadas.includes(id)
            return (
              <span
                key={id}
                className="group/tip relative flex max-[1259px]:flex-1"
              >
                <button
                  onClick={() => toggleCamada(id)}
                  aria-pressed={ativo}
                  className={`active-press hover-lift flex shrink-0 items-center justify-center gap-1 rounded-md border font-black whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#055071]/40 focus-visible:ring-offset-1 focus-visible:outline-none max-[1259px]:w-full ${ativo ? "border-[#b3cdd8] bg-white text-[#055071]" : "border-white/20 text-white/85 hover:bg-white/10"}`}
                  style={{
                    fontSize: "var(--btn-size)",
                    height: "var(--btn-h)",
                    paddingInline: "var(--btn-px)",
                    ...(ativo ? {} : { backgroundColor: C.field }),
                  }}
                >
                  {icon}
                  <span className="max-[999px]:sr-only min-[1260px]:max-[2199px]:sr-only">
                    {label}
                  </span>
                </button>
                <TipCamada texto={label} />
              </span>
            )
          })}

          {/* Infraestrutura dropdown */}
          <span className="group/tip relative flex max-[1259px]:flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={isVisaoGeral || !possuiInfra}
                className={`active-press hover-lift flex shrink-0 items-center justify-center gap-1.5 rounded-md border font-black whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 max-[1259px]:w-full ${infraAtivo ? "border-[#b3cdd8] bg-white text-[#055071]" : "border-white/20 text-white/85 hover:bg-white/10"}`}
                style={{
                  fontSize: "var(--btn-size)",
                  height: "var(--btn-h)",
                  paddingInline: "var(--btn-px)",
                  ...(infraAtivo ? {} : { backgroundColor: C.field }),
                }}
              >
                <span className="flex items-center gap-1">
                  <Wrench size={11} strokeWidth={2.5} />
                  <span className="max-[999px]:sr-only min-[1260px]:max-[2199px]:sr-only">
                    Infraestrutura
                  </span>{" "}
                  {infraAtivas.length > 0 && `(${infraAtivas.length})`}
                </span>
                <span className="text-[7px] opacity-70">▼</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <button
                  onClick={toggleMenuInfra}
                  className="mb-1 w-full border-b border-slate-200/60 px-2 py-1 text-left text-xs font-bold text-slate-500 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none"
                >
                  {camadas.includes("Infraestrutura")
                    ? "Ocultar Camada"
                    : "Exibir Camada"}
                </button>
                {(INFRAESTRUTURA_CONFIG[municipio] || []).map((infraNome) => (
                  <DropdownMenuCheckboxItem
                    key={infraNome}
                    checked={infraAtivas.includes(infraNome)}
                    onCheckedChange={() => toggleInfra(infraNome)}
                    className="text-xs hover:bg-slate-100"
                  >
                    {infraNome}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <TipCamada texto="Infraestrutura" />
          </span>
        </div>
      </div>
    </header>
  )
}
