"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Map, { Source, Layer, type MapRef, type ViewStateChangeEvent } from "react-map-gl/maplibre"
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
  cenarioA?: string
  cenarioB?: string
  cenarioAInicial?: string
  cenarioBInicial?: string
  onCenarioAChange?: (c: string) => void
  onCenarioBChange?: (c: string) => void
  onClose?: () => void
  isFullScreen?: boolean
}

interface MapSideProps {
  mapRef: React.RefObject<MapRef | null>
  municipio: string
  cenario: string
  color: string
  initialViewState: {
    longitude: number
    latitude: number
    zoom: number
    pitch: number
    bearing: number
  }
  onMove: (evt: ViewStateChangeEvent) => void
  showPoints?: boolean
}

// Cache em memória para GeoJSONs dos cenários e pontos (evita refetching ao alternar cenários)
const geojsonCache = new globalThis.Map<string, GeoJSON.FeatureCollection>()

async function fetchGeoJsonCached(url: string): Promise<GeoJSON.FeatureCollection | null> {
  if (geojsonCache.has(url)) {
    return geojsonCache.get(url)!
  }
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    geojsonCache.set(url, data)
    return data
  } catch {
    return null
  }
}

/**
 * Lado individual do mapa no comparador.
 * Memoizado com React.memo para evitar re-renderizações durante arraste da câmera ou do divisor swipe.
 */
const MapSide = React.memo(function MapSide({
  mapRef,
  municipio,
  cenario,
  color,
  initialViewState,
  onMove,
  showPoints = true,
}: MapSideProps) {
  const [mancha, setMancha] = useState<GeoJSON.FeatureCollection | null>(() => {
    if (!cenario || cenario === "(nenhum)") return null
    const url = `/dados_convertidos/${slugify(municipio)}/cenarios/${scenarioSlug(municipio, cenario)}.geojson`
    return geojsonCache.get(url) ?? null
  })
  const [eduPoints, setEduPoints] = useState<GeoJSON.FeatureCollection | null>(() => {
    if (!cenario || cenario === "(nenhum)" || !showPoints) return null
    const url = `/dados_convertidos/${slugify(municipio)}/cenarios/educacao_ATINGIDOS_${scenarioSlug(municipio, cenario)}.geojson`
    return geojsonCache.get(url) ?? null
  })
  const [sauPoints, setSauPoints] = useState<GeoJSON.FeatureCollection | null>(() => {
    if (!cenario || cenario === "(nenhum)" || !showPoints) return null
    const url = `/dados_convertidos/${slugify(municipio)}/cenarios/saude_ATINGIDOS_${scenarioSlug(municipio, cenario)}.geojson`
    return geojsonCache.get(url) ?? null
  })

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
    let isCancelled = false

    // Carrega a mancha
    const manchaUrl = `/dados_convertidos/${munSlug}/cenarios/${sSlug}.geojson`
    fetchGeoJsonCached(manchaUrl).then((data) => {
      if (!isCancelled) setMancha(data)
    })

    // Carrega equipamentos atingidos
    if (showPoints) {
      const eduUrl = `/dados_convertidos/${munSlug}/cenarios/educacao_ATINGIDOS_${sSlug}.geojson`
      fetchGeoJsonCached(eduUrl).then((data) => {
        if (!isCancelled) setEduPoints(data)
      })

      const sauUrl = `/dados_convertidos/${munSlug}/cenarios/saude_ATINGIDOS_${sSlug}.geojson`
      fetchGeoJsonCached(sauUrl).then((data) => {
        if (!isCancelled) setSauPoints(data)
      })
    } else {
      setEduPoints(null)
      setSauPoints(null)
    }

    return () => {
      isCancelled = true
    }
  }, [municipio, cenario, showPoints])

  return (
    <div className="relative h-full w-full select-none">
      <Map
        ref={mapRef}
        reuseMaps={true}
        initialViewState={initialViewState}
        onMove={onMove}
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
        {showPoints && eduPoints && (
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
        {showPoints && sauPoints && (
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
})

function ScenarioCompareMapInner({
  municipio,
  cenarioA,
  cenarioB,
  cenarioAInicial,
  cenarioBInicial,
  onCenarioAChange,
  onCenarioBChange,
  onClose,
  isFullScreen = true,
}: ScenarioCompareMapProps) {
  const cenariosList = useMemo(() => CENARIOS_CONFIG[municipio] ?? [], [municipio])

  // Estado local usado somente se não fornecido pelo pai (ex: em modo tela cheia avulso)
  const [internalA, setInternalA] = useState<string>(
    cenarioAInicial && cenariosList.includes(cenarioAInicial)
      ? cenarioAInicial
      : cenariosList[0] ?? ""
  )
  const [internalB, setInternalB] = useState<string>(
    cenarioBInicial && cenariosList.includes(cenarioBInicial)
      ? cenarioBInicial
      : cenariosList[1] ?? cenariosList[0] ?? ""
  )

  const effectiveCenarioA = cenarioA ?? internalA
  const effectiveCenarioB = cenarioB ?? internalB

  const handleSelectA = (val: string) => {
    setInternalA(val)
    onCenarioAChange?.(val)
  }

  const handleSelectB = (val: string) => {
    setInternalB(val)
    onCenarioBChange?.(val)
  }

  const [showPoints, setShowPoints] = useState(true)

  // Sincronização direta de câmeras via refs WebGL (0 re-renders de React ao arrastar/zoom)
  const mapRefA = useRef<MapRef | null>(null)
  const mapRefB = useRef<MapRef | null>(null)
  const isSyncingRef = useRef(false)

  const initialViewState = useMemo(() => {
    const munConfig = MUNICIPIO_VIEW[municipio] ?? MUNICIPIO_VIEW["Porto Alegre"]
    return {
      longitude: munConfig.center[0],
      latitude: munConfig.center[1],
      zoom: munConfig.zoom,
      pitch: 0,
      bearing: 0,
    }
  }, [municipio])

  const onMoveA = useCallback((evt: ViewStateChangeEvent) => {
    if (isSyncingRef.current) return
    isSyncingRef.current = true
    const mb = mapRefB.current
    if (mb) {
      mb.jumpTo({
        center: [evt.viewState.longitude, evt.viewState.latitude],
        zoom: evt.viewState.zoom,
        bearing: evt.viewState.bearing,
        pitch: evt.viewState.pitch,
      })
    }
    isSyncingRef.current = false
  }, [])

  const onMoveB = useCallback((evt: ViewStateChangeEvent) => {
    if (isSyncingRef.current) return
    isSyncingRef.current = true
    const ma = mapRefA.current
    if (ma) {
      ma.jumpTo({
        center: [evt.viewState.longitude, evt.viewState.latitude],
        zoom: evt.viewState.zoom,
        bearing: evt.viewState.bearing,
        pitch: evt.viewState.pitch,
      })
    }
    isSyncingRef.current = false
  }, [])

  // Forçar redimensionamento dos mapas quando o modal abre ou altera tamanho
  useEffect(() => {
    const timer = setTimeout(() => {
      mapRefA.current?.resize()
      mapRefB.current?.resize()
    }, 150)
    return () => clearTimeout(timer)
  }, [isFullScreen])

  // Recadastra a posição ao trocar município
  useEffect(() => {
    const munConfig = MUNICIPIO_VIEW[municipio] ?? MUNICIPIO_VIEW["Porto Alegre"]
    mapRefA.current?.jumpTo({ center: munConfig.center, zoom: munConfig.zoom, bearing: 0, pitch: 0 })
    mapRefB.current?.jumpTo({ center: munConfig.center, zoom: munConfig.zoom, bearing: 0, pitch: 0 })
  }, [municipio])

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${
        isFullScreen ? "fixed inset-0 z-40 bg-slate-900" : "rounded-xl border border-slate-200"
      }`}
    >
      {/* ── BARRA FLUTUANTE SUPERIOR ── */}
      {!isFullScreen ? (
        /* Modo Embutido no Modal: Apenas UMA fonte de seleção (no cabeçalho do modal).
           Aqui mostramos apenas os badges indicativos (Lado A e Lado B) e o controle de pontos. */
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/85 px-3.5 py-2 text-white shadow-xl backdrop-blur-md border border-white/15">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 border-r border-white/20 pr-3">
              <Layers size={14} className="text-cyan-400" />
              <span className="text-xs font-black tracking-wide uppercase">
                Swipe de Cenários · {municipio}
              </span>
            </div>

            {/* Badge Lado A (Esquerda / Azul) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15">
              <span className="h-2.5 w-2.5 rounded-full bg-[#055071] border border-white/60 shrink-0" />
              <span className="text-[10px] font-bold text-white/70 uppercase">Lado A:</span>
              <span className="text-xs font-semibold text-white max-w-[220px] truncate" title={cenarioLabel(effectiveCenarioA)}>
                {cenarioLabel(effectiveCenarioA)}
              </span>
            </div>

            {/* Badge Lado B (Direita / Vermelho) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c9402e] border border-white/60 shrink-0" />
              <span className="text-[10px] font-bold text-white/70 uppercase">Lado B:</span>
              <span className="text-xs font-semibold text-white max-w-[220px] truncate" title={cenarioLabel(effectiveCenarioB)}>
                {cenarioLabel(effectiveCenarioB)}
              </span>
            </div>
          </div>

          {/* Ações: Alternar Pontos e Fechar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPoints((p) => !p)}
              className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold border transition-colors ${
                showPoints
                  ? "bg-white/20 border-white/30 text-white"
                  : "bg-white/5 border-white/15 text-white/60 hover:text-white"
              }`}
            >
              {showPoints ? "Ocultar Pontos" : "Exibir Pontos"}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar comparador de mapa"
                className="flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs font-bold text-white transition-colors border border-white/15"
              >
                <X size={13} />
                <span>Fechar</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Modo Tela Cheia: Quando não há o cabeçalho do diálogo, exibimos os Selects diretamente na barra flutuante */
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
              <Select value={effectiveCenarioA} onValueChange={handleSelectA}>
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
              <Select value={effectiveCenarioB} onValueChange={handleSelectB}>
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
      )}

      {/* ── Componente CompareReveal envolvendo os dois mapas com sincronização suave ── */}
      <CompareReveal
        before={
          <MapSide
            mapRef={mapRefA}
            municipio={municipio}
            cenario={effectiveCenarioA}
            color="#055071"
            initialViewState={initialViewState}
            onMove={onMoveA}
            showPoints={showPoints}
          />
        }
        after={
          <MapSide
            mapRef={mapRefB}
            municipio={municipio}
            cenario={effectiveCenarioB}
            color="#c9402e"
            initialViewState={initialViewState}
            onMove={onMoveB}
            showPoints={showPoints}
          />
        }
        labels={[cenarioLabel(effectiveCenarioA), cenarioLabel(effectiveCenarioB)]}
        dragHandleOnly={true}
        defaultPosition={50}
        introSweep={true}
        className="h-full w-full rounded-none border-0 aspect-auto"
      />

      {/* ── Dica de navegação inferior ── */}
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
