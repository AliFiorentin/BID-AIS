"use client"

import React, { useState, useEffect } from "react"
import Map, { Source, Layer } from "react-map-gl/maplibre"
import { CompareReveal } from "@/components/ui/compare-reveal"
import {
  CENARIOS_CONFIG,
  MUNICIPIO_VIEW,
  cenarioLabel,
} from "@/lib/constants"
import { scenarioSlug, slugify } from "@/lib/geo-utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Layers, Info } from "lucide-react"

interface ScenarioCompareMapProps {
  municipio: string
  cenarioAInicial?: string
  cenarioBInicial?: string
  onClose?: () => void
  isFullScreen?: boolean
}

interface MapSideProps {
  municipio: string
  cenario: string
  color: string
  viewState: {
    longitude: number
    latitude: number
    zoom: number
    pitch: number
    bearing: number
  }
  onMove: (viewState: {
    longitude: number
    latitude: number
    zoom: number
    pitch: number
    bearing: number
  }) => void
  showPoints?: boolean
}

function MapSide({
  municipio,
  cenario,
  color,
  viewState,
  onMove,
  showPoints = true,
}: MapSideProps) {
  const [mancha, setMancha] = useState<GeoJSON.FeatureCollection | null>(null)
  const [eduPoints, setEduPoints] = useState<GeoJSON.FeatureCollection | null>(null)
  const [sauPoints, setSauPoints] = useState<GeoJSON.FeatureCollection | null>(null)

  useEffect(() => {
    if (!cenario || cenario === "(nenhum)") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMancha(null)
      setEduPoints(null)
      setSauPoints(null)
      return
    }

    const munSlug = slugify(municipio)
    const sSlug = scenarioSlug(municipio, cenario)

    // Carrega a mancha
    fetch(`/dados_convertidos/${munSlug}/cenarios/${sSlug}.geojson`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setMancha)
      .catch(() => setMancha(null))

    // Carrega equipamentos atingidos
    if (showPoints) {
      fetch(`/dados_convertidos/${munSlug}/cenarios/educacao_ATINGIDOS_${sSlug}.geojson`)
        .then((r) => (r.ok ? r.json() : null))
        .then(setEduPoints)
        .catch(() => setEduPoints(null))

      fetch(`/dados_convertidos/${munSlug}/cenarios/saude_ATINGIDOS_${sSlug}.geojson`)
        .then((r) => (r.ok ? r.json() : null))
        .then(setSauPoints)
        .catch(() => setSauPoints(null))
    }
  }, [municipio, cenario, showPoints])

  return (
    <div className="relative h-full w-full select-none">
      <Map
        {...viewState}
        onMove={(evt) => onMove(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        maxPitch={0}
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        attributionControl={false}
      >
        {mancha && (
          <Source id={`source-mancha-${color}`} type="geojson" data={mancha}>
            <Layer
              id={`layer-mancha-fill-${color}`}
              type="fill"
              paint={{
                "fill-color": color,
                "fill-opacity": 0.35,
              }}
            />
            <Layer
              id={`layer-mancha-line-${color}`}
              type="line"
              paint={{
                "line-color": color,
                "line-width": 2,
                "line-opacity": 0.85,
              }}
            />
          </Source>
        )}

        {/* Escolas atingidas */}
        {eduPoints && (
          <Source id={`source-edu-${color}`} type="geojson" data={eduPoints}>
            <Layer
              id={`layer-edu-${color}`}
              type="circle"
              paint={{
                "circle-color": "#2da8cc",
                "circle-radius": 4,
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 1.5,
              }}
            />
          </Source>
        )}

        {/* Unidades de saúde atingidas */}
        {sauPoints && (
          <Source id={`source-sau-${color}`} type="geojson" data={sauPoints}>
            <Layer
              id={`layer-sau-${color}`}
              type="circle"
              paint={{
                "circle-color": "#e35d4b",
                "circle-radius": 4,
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 1.5,
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  )
}

function ScenarioCompareMapInner({
  municipio,
  cenarioAInicial,
  cenarioBInicial,
  onClose,
  isFullScreen = true,
}: ScenarioCompareMapProps) {
  const munConfig = MUNICIPIO_VIEW[municipio] ?? MUNICIPIO_VIEW["Porto Alegre"]
  const cenariosList = CENARIOS_CONFIG[municipio] ?? []

  const [cenarioA, setCenarioA] = useState<string>(
    cenarioAInicial && cenariosList.includes(cenarioAInicial)
      ? cenarioAInicial
      : cenariosList[0] ?? ""
  )
  const [cenarioB, setCenarioB] = useState<string>(
    cenarioBInicial && cenariosList.includes(cenarioBInicial)
      ? cenarioBInicial
      : cenariosList[1] ?? cenariosList[0] ?? ""
  )

  const [showPoints, setShowPoints] = useState(true)

  const [viewState, setViewState] = useState({
    longitude: munConfig.center[0],
    latitude: munConfig.center[1],
    zoom: munConfig.zoom,
    pitch: 0,
    bearing: 0,
  })

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${
        isFullScreen ? "fixed inset-0 z-40 bg-slate-900" : "rounded-xl border border-slate-200"
      }`}
    >
      {/* Barra de Controle Superior */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/85 px-3 py-2 text-white shadow-2xl backdrop-blur-md border border-white/15">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 border-r border-white/20 pr-3">
            <Layers size={15} className="text-cyan-400" />
            <span className="text-xs font-black tracking-wide uppercase">
              Swipe de Cenários · {municipio}
            </span>
          </div>

          {/* Seletor Cenário A (Esquerda / Azul) */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#055071] border border-white/50 shrink-0" />
            <span className="text-[10px] font-bold text-white/70 uppercase">Lado A:</span>
            <Select value={cenarioA} onValueChange={setCenarioA}>
              <SelectTrigger className="h-7 w-44 bg-white/10 border-white/20 text-white text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cenariosList.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {cenarioLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor Cenário B (Direita / Vermelho) */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c9402e] border border-white/50 shrink-0" />
            <span className="text-[10px] font-bold text-white/70 uppercase">Lado B:</span>
            <Select value={cenarioB} onValueChange={setCenarioB}>
              <SelectTrigger className="h-7 w-44 bg-white/10 border-white/20 text-white text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cenariosList.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {cenarioLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle Pontos */}
          <button
            type="button"
            onClick={() => setShowPoints(!showPoints)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              showPoints
                ? "bg-white/20 border-white/30 text-white"
                : "bg-white/5 border-white/10 text-white/60"
            }`}
          >
            {showPoints ? "Ocultar Pontos" : "Exibir Pontos"}
          </button>
        </div>

        {/* Fechar */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar comparador de mapa"
            className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-xs font-bold text-white transition-colors border border-white/15"
          >
            <X size={14} />
            <span>Fechar Comparação</span>
          </button>
        )}
      </div>

      {/* Componente CompareReveal envolvendo os dois mapas sincronizados */}
      <CompareReveal
        before={
          <MapSide
            municipio={municipio}
            cenario={cenarioA}
            color="#055071"
            viewState={viewState}
            onMove={setViewState}
            showPoints={showPoints}
          />
        }
        after={
          <MapSide
            municipio={municipio}
            cenario={cenarioB}
            color="#c9402e"
            viewState={viewState}
            onMove={setViewState}
            showPoints={showPoints}
          />
        }
        labels={[cenarioLabel(cenarioA), cenarioLabel(cenarioB)]}
        dragHandleOnly={true}
        defaultPosition={50}
        introSweep={true}
        className="h-full w-full rounded-none border-0 aspect-auto"
      />

      {/* Dica de navegação inferior */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none rounded-full bg-slate-900/80 px-3 py-1 text-[10.5px] font-medium text-white/90 shadow-lg backdrop-blur-md border border-white/15 flex items-center gap-1.5">
        <Info size={12} className="text-cyan-400" />
        <span>Arraste o divisor central para revelar a diferença · Navegue no mapa com clique e arrasto</span>
      </div>
    </div>
  )
}

export function ScenarioCompareMap(props: ScenarioCompareMapProps) {
  return <ScenarioCompareMapInner key={props.municipio} {...props} />
}
