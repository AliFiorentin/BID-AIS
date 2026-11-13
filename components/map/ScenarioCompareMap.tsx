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
  cotaA?: number | null
  cotaB?: number | null
  modo?: "cenarios" | "cotas"
  cotasList?: number[]
  onCenarioAChange?: (c: string) => void
  onCenarioBChange?: (c: string) => void
  onCotaAChange?: (c: number) => void
  onCotaBChange?: (c: number) => void
  onClose?: () => void
  isFullScreen?: boolean
  showPoints?: boolean
}

interface MapSideProps {
  mapRef: React.RefObject<MapRef | null>
  municipio: string
  cenario: string
  cota?: number | null
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

interface CotaMetaInfo {
  bounds: [number, number, number, number]
  coordinates: [[number, number], [number, number], [number, number], [number, number]]
  width: number
  height: number
  cotas: number[]
}

// Cache em memória para GeoJSONs dos cenários e pontos (evita refetching ao alternar cenários)
const geojsonCache = new globalThis.Map<string, GeoJSON.FeatureCollection>()

// Cache em memória do raster decodificado por município
const cotaRasterCache = new globalThis.Map<
  string,
  { meta: CotaMetaInfo; ix: Uint8Array }
>()

async function getCotaRasterData(municipio: string) {
  const slug = slugify(municipio)
  if (cotaRasterCache.has(slug)) return cotaRasterCache.get(slug)!
  try {
    const meta: CotaMetaInfo = await (await fetch(`/dados_convertidos/${slug}/cota_mapa.json`)).json()
    const blob = await (await fetch(`/dados_convertidos/${slug}/cota_mapa.webp`)).blob()
    const bmp = await createImageBitmap(blob, { premultiplyAlpha: "none" })
    const canvas = document.createElement("canvas")
    canvas.width = meta.width
    canvas.height = meta.height
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!
    ctx.drawImage(bmp, 0, 0)
    const px = ctx.getImageData(0, 0, meta.width, meta.height).data
    const ix = new Uint8Array(meta.width * meta.height)
    for (let i = 0; i < ix.length; i++) ix[i] = px[i * 4 + 3] ? px[i * 4] : 0
    const res = { meta, ix }
    cotaRasterCache.set(slug, res)
    return res
  } catch {
    return null
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ]
  }
  return [
    parseInt(clean.slice(0, 2), 16) || 5,
    parseInt(clean.slice(2, 4), 16) || 80,
    parseInt(clean.slice(4, 6), 16) || 113,
  ]
}

const cotaDataUrlCache = new globalThis.Map<string, string>()

function renderCotaDataUrl(
  meta: CotaMetaInfo,
  ix: Uint8Array,
  cota: number,
  colorHex: string
): string {
  const cacheKey = `${meta.width}x${meta.height}_${cota.toFixed(4)}_${colorHex}`
  const cached = cotaDataUrlCache.get(cacheKey)
  if (cached) return cached

  const canvas = document.createElement("canvas")
  canvas.width = meta.width
  canvas.height = meta.height
  const ctx = canvas.getContext("2d")!
  const img = ctx.createImageData(meta.width, meta.height)
  const px32 = new Uint32Array(img.data.buffer)
  const [r, g, b] = hexToRgb(colorHex)
  const color32 = ((235 << 24) | (b << 16) | (g << 8) | r) >>> 0

  const cotasArr = meta.cotas
  for (let i = 0; i < ix.length; i++) {
    const k = ix[i]
    if (k > 0 && cotasArr[k - 1] <= cota + 1e-4) {
      px32[i] = color32
    }
  }
  ctx.putImageData(img, 0, 0)
  const dataUrl = canvas.toDataURL()
  cotaDataUrlCache.set(cacheKey, dataUrl)
  return dataUrl
}

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
  cota,
  color,
  initialViewState,
  onMove,
  showPoints = true,
}: MapSideProps) {
  const [mancha, setMancha] = useState<GeoJSON.FeatureCollection | null>(() => {
    if (cota != null || !cenario || cenario === "(nenhum)") return null
    const url = `/dados_convertidos/${slugify(municipio)}/cenarios/${scenarioSlug(municipio, cenario)}.geojson`
    return geojsonCache.get(url) ?? null
  })
  const [eduPoints, setEduPoints] = useState<GeoJSON.FeatureCollection | null>(() => {
    if (cota != null || !cenario || cenario === "(nenhum)" || !showPoints) return null
    const url = `/dados_convertidos/${slugify(municipio)}/cenarios/educacao_ATINGIDOS_${scenarioSlug(municipio, cenario)}.geojson`
    return geojsonCache.get(url) ?? null
  })
  const [sauPoints, setSauPoints] = useState<GeoJSON.FeatureCollection | null>(() => {
    if (cota != null || !cenario || cenario === "(nenhum)" || !showPoints) return null
    const url = `/dados_convertidos/${slugify(municipio)}/cenarios/saude_ATINGIDOS_${scenarioSlug(municipio, cenario)}.geojson`
    return geojsonCache.get(url) ?? null
  })

  // Raster de Cota
  const [cotaDataUrl, setCotaDataUrl] = useState<string | null>(null)
  const [cotaCoordinates, setCotaCoordinates] = useState<[[number, number], [number, number], [number, number], [number, number]] | null>(null)

  useEffect(() => {
    let isCancelled = false
    const munSlug = slugify(municipio)

    // Modo 1: Renderização por Cota Hidrométrica
    if (cota != null) {
      getCotaRasterData(municipio).then((data) => {
        if (isCancelled || !data) return
        const url = renderCotaDataUrl(data.meta, data.ix, cota, color)
        setCotaDataUrl(url)
        setCotaCoordinates(data.meta.coordinates)
      })

      // Pontos atingidos na cota
      if (showPoints) {
        Promise.all([
          fetchGeoJsonCached(`/dados_convertidos/${munSlug}/cota_pontos.json`),
          fetchGeoJsonCached(`/dados_convertidos/${munSlug}/educacao_BASE.geojson`),
          fetchGeoJsonCached(`/dados_convertidos/${munSlug}/saude_BASE.geojson`),
        ]).then(([cpJson, eduBase, sauBase]) => {
          if (isCancelled) return
          const cp = cpJson as unknown as { cotas: number[]; idx: { educacao?: number[]; saude?: number[] } } | null
          if (!cp?.cotas) return

          if (eduBase?.features && cp.idx.educacao) {
            const atgEdu = eduBase.features.filter((_, i) => {
              const k = cp.idx.educacao?.[i] ?? 0
              return k > 0 && cp.cotas[k - 1] <= cota + 1e-4
            })
            setEduPoints({ type: "FeatureCollection", features: atgEdu })
          }

          if (sauBase?.features && cp.idx.saude) {
            const atgSau = sauBase.features.filter((_, i) => {
              const k = cp.idx.saude?.[i] ?? 0
              return k > 0 && cp.cotas[k - 1] <= cota + 1e-4
            })
            setSauPoints({ type: "FeatureCollection", features: atgSau })
          }
        })
      }

      return () => {
        isCancelled = true
        setCotaDataUrl(null)
        setCotaCoordinates(null)
        setMancha(null)
        setEduPoints(null)
        setSauPoints(null)
      }
    }

    // Modo 2: Renderização por Cenário Hidrodinâmico
    if (!cenario || cenario === "(nenhum)") {
      return () => {
        isCancelled = true
        setCotaDataUrl(null)
        setCotaCoordinates(null)
        setMancha(null)
        setEduPoints(null)
        setSauPoints(null)
      }
    }

    const sSlug = scenarioSlug(municipio, cenario)

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
    }

    return () => {
      isCancelled = true
      setCotaDataUrl(null)
      setCotaCoordinates(null)
      setMancha(null)
      setEduPoints(null)
      setSauPoints(null)
    }
  }, [municipio, cenario, cota, color, showPoints])

  // Reposiciona a câmera do mapa para as coordenadas do município
  const reposicionarCamera = useCallback((targetMap?: unknown) => {
    const rawMap = targetMap ?? mapRef.current
    if (!rawMap) return
    const map = (typeof (rawMap as { getMap?: () => unknown }).getMap === "function"
      ? (rawMap as { getMap: () => unknown }).getMap()
      : rawMap) as { jumpTo?: (opts: unknown) => void }
    if (!map || typeof map.jumpTo !== "function") return
    const munConfig = MUNICIPIO_VIEW[municipio] ?? MUNICIPIO_VIEW["Porto Alegre"]
    map.jumpTo({
      center: munConfig.center,
      zoom: munConfig.zoom,
      bearing: 0,
      pitch: 0,
    })
  }, [municipio, mapRef])

  useEffect(() => {
    reposicionarCamera()
    const t1 = setTimeout(() => reposicionarCamera(), 80)
    const t2 = setTimeout(() => reposicionarCamera(), 200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [municipio, reposicionarCamera])

  const munSlug = slugify(municipio)
  const safeColor = color.replace(/[^a-zA-Z0-9]/g, "")

  return (
    <div className="relative h-full w-full select-none">
      <Map
        ref={mapRef}
        reuseMaps={true}
        initialViewState={initialViewState}
        onLoad={(evt) => reposicionarCamera(evt.target)}
        onMove={onMove}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        maxPitch={0}
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        attributionControl={false}
      >
        {/* Mancha por Cenário Hidrodinâmico (GeoJSON) */}
        {mancha && (
          <Source id={`source-mancha-${safeColor}`} type="geojson" data={mancha}>
            <Layer
              id={`layer-mancha-fill-${safeColor}`}
              type="fill"
              paint={{
                "fill-color": color,
                "fill-opacity": 0.35,
              }}
            />
            <Layer
              id={`layer-mancha-line-${safeColor}`}
              type="line"
              paint={{
                "line-color": color,
                "line-width": 2,
                "line-opacity": 0.85,
              }}
            />
          </Source>
        )}

        {/* Mancha por Cota Hidrométrica (Imagem Raster) */}
        {cotaDataUrl && cotaCoordinates && (
          <Source
            key={`cota-${munSlug}-${cota}`}
            id={`source-cota-${safeColor}`}
            type="image"
            url={cotaDataUrl}
            coordinates={cotaCoordinates}
          >
            <Layer
              id={`layer-cota-${safeColor}`}
              type="raster"
              paint={{
                "raster-opacity": 0.5,
                "raster-fade-duration": 0,
              }}
            />
          </Source>
        )}

        {/* Escolas atingidas */}
        {showPoints && eduPoints && (
          <Source id={`source-edu-${safeColor}`} type="geojson" data={eduPoints}>
            <Layer
              id={`layer-edu-${safeColor}`}
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
          <Source id={`source-sau-${safeColor}`} type="geojson" data={sauPoints}>
            <Layer
              id={`layer-sau-${safeColor}`}
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
  cotaA,
  cotaB,
  modo = "cenarios",
  cotasList = [],
  onCenarioAChange,
  onCenarioBChange,
  onCotaAChange,
  onCotaBChange,
  onClose,
  isFullScreen = true,
  showPoints: externalShowPoints,
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

  const [internalShowPoints, setInternalShowPoints] = useState(true)
  const showPoints = externalShowPoints !== undefined ? externalShowPoints : internalShowPoints

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
    const mover = () => {
      mapRefA.current?.jumpTo({ center: munConfig.center, zoom: munConfig.zoom, bearing: 0, pitch: 0 })
      mapRefB.current?.jumpTo({ center: munConfig.center, zoom: munConfig.zoom, bearing: 0, pitch: 0 })
    }
    mover()
    const t1 = setTimeout(mover, 80)
    const t2 = setTimeout(mover, 200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [municipio])

  const formatCotaDisplay = (c?: number | null) =>
    c != null ? `Cota ${c.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} m` : ""

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${
        isFullScreen ? "fixed inset-0 z-40 bg-slate-900" : "rounded-xl border border-slate-200"
      }`}
    >
      {/* ── BARRA FLUTUANTE SUPERIOR (Apenas no Modo Tela Cheia) ── */}
      {isFullScreen && (
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-slate-900/80 px-4 py-2.5 text-white shadow-2xl backdrop-blur-2xl border border-white/20">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 border-r border-white/20 pr-3">
              <Layers size={15} className="text-cyan-400" />
              <span className="text-xs font-black tracking-wide uppercase">
                Swipe de {modo === "cotas" ? "Cotas" : "Cenários"} · {municipio}
              </span>
            </div>

            {/* Seletor Lado A (Esquerda / Azul) */}
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#055071] border border-white/50 shrink-0" />
              <span className="text-[11px] font-bold text-white/70 uppercase">Lado A:</span>
              {modo === "cotas" ? (
                <Select
                  value={cotaA != null ? String(cotaA) : ""}
                  onValueChange={(v) => onCotaAChange?.(parseFloat(v))}
                >
                  <SelectTrigger className="h-7 w-44 rounded-full bg-white/10 border-white/20 text-white text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cotasList.map((c) => (
                      <SelectItem key={c} value={String(c)} className="text-xs">
                        {formatCotaDisplay(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={effectiveCenarioA} onValueChange={handleSelectA}>
                  <SelectTrigger className="h-7 w-44 rounded-full bg-white/10 border-white/20 text-white text-xs font-semibold">
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
              )}
            </div>

            {/* Seletor Lado B (Direita / Vermelho) */}
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c9402e] border border-white/50 shrink-0" />
              <span className="text-[11px] font-bold text-white/70 uppercase">Lado B:</span>
              {modo === "cotas" ? (
                <Select
                  value={cotaB != null ? String(cotaB) : ""}
                  onValueChange={(v) => onCotaBChange?.(parseFloat(v))}
                >
                  <SelectTrigger className="h-7 w-44 rounded-full bg-white/10 border-white/20 text-white text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cotasList.map((c) => (
                      <SelectItem key={c} value={String(c)} className="text-xs">
                        {formatCotaDisplay(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={effectiveCenarioB} onValueChange={handleSelectB}>
                  <SelectTrigger className="h-7 w-44 rounded-full bg-white/10 border-white/20 text-white text-xs font-semibold">
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
              )}
            </div>

            {/* Toggle Pontos */}
            <button
              type="button"
              onClick={() => setInternalShowPoints(!showPoints)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all active:scale-[0.97] ${
                showPoints
                  ? "bg-white/20 border-white/30 text-white shadow-xs"
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
              className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-all active:scale-[0.97] border border-white/15"
            >
              <X size={14} />
              <span>Fechar Tela Cheia</span>
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
            cota={modo === "cotas" ? (cotaA ?? null) : null}
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
            cota={modo === "cotas" ? (cotaB ?? null) : null}
            color="#c9402e"
            initialViewState={initialViewState}
            onMove={onMoveB}
            showPoints={showPoints}
          />
        }
        labels={[
          modo === "cotas" && cotaA != null
            ? formatCotaDisplay(cotaA)
            : cenarioLabel(effectiveCenarioA),
          modo === "cotas" && cotaB != null
            ? formatCotaDisplay(cotaB)
            : cenarioLabel(effectiveCenarioB),
        ]}
        dragHandleOnly={true}
        defaultPosition={50}
        introSweep={true}
        className="h-full w-full rounded-none border-0 aspect-auto"
      />

      {/* ── Dica de navegação inferior ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none rounded-full bg-slate-900/80 px-4 py-1.5 text-[11px] font-medium text-white/90 shadow-xl backdrop-blur-xl border border-white/20 flex items-center gap-1.5">
        <Info size={12} className="text-cyan-400" />
        <span>Arraste o divisor central para revelar a diferença · Navegue no mapa com clique e arrasto</span>
      </div>
    </div>
  )
}

export function ScenarioCompareMap(props: ScenarioCompareMapProps) {
  return <ScenarioCompareMapInner {...props} />
}
