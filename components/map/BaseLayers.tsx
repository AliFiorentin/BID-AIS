import { Source, Layer } from "react-map-gl/maplibre"
import { slugify } from "@/lib/geo-utils"
import type { DashboardState } from "@/hooks/useDashboard"

// Polígono do mundo todo, para o véu claro sobre o mapa-base
const VEU_MUNDO: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-180, -85],
        [180, -85],
        [180, 85],
        [-180, 85],
        [-180, -85],
      ],
    ],
  },
}

/** Véu claro sobre o mapa-base + Raster de população (WorldPop). */
export function PopulacaoLayer({ dash }: { dash: DashboardState }) {
  const { camadas, popData, renderMunicipio, isVisaoGeral, isTransitioning } =
    dash
  const popMunData =
    !isVisaoGeral && !isTransitioning ? popData?.[renderMunicipio] : null
  const popImgUrl = popMunData
    ? `/dados_convertidos/${slugify(renderMunicipio)}/populacao.webp`
    : null

  return (
    <>
      {/* Véu claro sobre o mapa-base (ruas, água, rótulos), abaixo de todas as camadas de dados:
          suaviza o fundo e destaca mancha, pontos e demais camadas. */}
      <Source id="veu-base" type="geojson" data={VEU_MUNDO}>
        <Layer
          id="veu-base-fill"
          type="fill"
          beforeId="anchor-mancha"
          paint={{ "fill-color": "#eef3f4", "fill-opacity": 0.62 }}
        />
      </Source>

      {/* Raster de população */}
      {camadas.includes("População") && popImgUrl && popMunData && (
        <Source
          id="populacao-img"
          type="image"
          url={popImgUrl}
          coordinates={
            popMunData.coordinates as [
              [number, number],
              [number, number],
              [number, number],
              [number, number],
            ]
          }
        >
          <Layer
            id="populacao-raster"
            type="raster"
            beforeId="anchor-mancha"
            paint={{ "raster-opacity": 0.65, "raster-resampling": "nearest" }}
          />
        </Source>
      )}
    </>
  )
}

/**
 * Âncoras permanentes de ordem das camadas.
 * Ordem da pilha: mancha < agricultura < água por cota < infraestrutura <
 * prédios < pontos (anchor-mancha, anchor-agua, anchor-infra, anchor-buildings, anchor-pts).
 */
export function MapAnchors() {
  return (
    <>
      <Layer
        id="anchor-mancha"
        type="background"
        paint={{ "background-opacity": 0 }}
      />
      <Layer
        id="anchor-agua"
        type="background"
        paint={{ "background-opacity": 0 }}
      />
      <Layer
        id="anchor-infra"
        type="background"
        paint={{ "background-opacity": 0 }}
      />
      <Layer
        id="anchor-buildings"
        type="background"
        paint={{ "background-opacity": 0 }}
      />
      <Layer
        id="anchor-pts"
        type="background"
        paint={{ "background-opacity": 0 }}
      />
    </>
  )
}
