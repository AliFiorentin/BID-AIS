"use client"
import { useEffect, useRef } from "react"
import Map, { NavigationControl, AttributionControl } from "react-map-gl/maplibre"
import { setWorkerUrl } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import type { DashboardState } from "@/hooks/useDashboard"
import { MapControls } from "@/components/map/MapControls"
import { PopulacaoLayer, MapAnchors } from "@/components/map/BaseLayers"
import { ManchaCotaLayers } from "@/components/map/ManchaCotaLayers"
import { AgriculturaLayer } from "@/components/map/AgriculturaLayer"
import { InfraLayers } from "@/components/map/InfraLayers"
import { HeatmapLayers } from "@/components/map/HeatmapLayers"
import { PontosLayers } from "@/components/map/PontosLayers"

// MapLibre 6 é só ESM: com bundler o worker precisa de URL explícita
setWorkerUrl(
  new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString()
)

interface Props {
  dash: DashboardState
}

/**
 * Mapa principal. As camadas vivem em components/map/, montadas aqui na ordem
 * da pilha (a ordem visual real é garantida pelas âncoras `anchor-*` de MapAnchors):
 * véu claro / população < âncoras < mancha/cota < agricultura < infra < heatmaps < pontos.
 */
export function DashboardMap({ dash }: Props) {
  const {
    mapRef,
    mapReady,
    setMapReady,
    renderMunicipio,
    cursor,
    setCursor,
    isTransitioning,
    interactiveLayerIds,
    handleMapClick,
    showDanoFisico,
  } = dash

  const estiloReaplicadoRef = useRef(false)

  const mostraDanoFisico =
    showDanoFisico && renderMunicipio === "Porto Alegre" && !isTransitioning

  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    const recolher = () => {
      map
        .getContainer()
        .querySelector(".maplibregl-ctrl-attrib.maplibregl-compact-show")
        ?.classList.remove("maplibregl-compact-show")
    }
    recolher()
    map.on("resize", recolher)
    return () => {
      map.off("resize", recolher)
    }
  }, [mapReady, mapRef])

  return (
    <div className="absolute inset-0 z-0">
      <Map
        ref={mapRef}
        initialViewState={dash.initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onError={(ev) => {
          const map = ev.target
          if (!estiloReaplicadoRef.current && !map.isStyleLoaded()) {
            estiloReaplicadoRef.current = true
            setTimeout(
              () =>
                map.setStyle(
                  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                ),
              1500
            )
          }
        }}
        interactiveLayerIds={interactiveLayerIds}
        onClick={handleMapClick}
        cursor={cursor}
        onMouseEnter={() => setCursor("pointer")}
        onMouseLeave={() => setCursor("grab")}
        onLoad={(e) => {
          setMapReady(true)
          e.target
            .getContainer()
            .querySelector(".maplibregl-ctrl-attrib")
            ?.classList.remove("maplibregl-compact-show")
        }}
        onMoveEnd={dash.handleMapMoveEnd}
        maxPitch={0}
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />
        <AttributionControl compact position="bottom-left" />

        <MapControls dash={dash} />

        <PopulacaoLayer dash={dash} />
        <MapAnchors />
        <ManchaCotaLayers dash={dash} />
        <AgriculturaLayer dash={dash} />
        <InfraLayers dash={dash} />
        <HeatmapLayers dash={dash} />
        <PontosLayers dash={dash} mostraDanoFisico={mostraDanoFisico} />
      </Map>
    </div>
  )
}
