import { useState, useEffect, useRef } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { MUNICIPIO_VIEW } from "@/lib/constants";
import type { CameraPermalink } from "./usePermalink";

interface Args {
  mapRef: React.RefObject<MapRef | null>;
  headerRef: React.RefObject<HTMLElement | null>;
  municipio: string;
  showPainelAnalise: boolean;
  permalinkView: CameraPermalink | null;
  setIs3D: (v: boolean) => void;
}

// Painel lateral (420px + 12px = 432px)
const PADDING_PAINEL = 432;
const painelLateral = () => window.matchMedia("(min-width: 1024px), (pointer: fine)").matches;

/** Enquadramento do mapa: flyTo na troca de município, padding do painel e posição do header. */
export function useMapCamera({ mapRef, headerRef, municipio, showPainelAnalise, permalinkView, setIs3D }: Args) {
  const [headerBottom, setHeaderBottom] = useState(82);
  const hasFlownInitial = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const view = MUNICIPIO_VIEW[municipio];
    const map = mapRef.current?.getMap();
    if (view && map && mapReady) {
      const primeiraVez = !hasFlownInitial.current;
      hasFlownInitial.current = true;
      if (primeiraVez && permalinkView) return;

      const isVg = municipio === "Visão Geral RS";
      const padLeft = showPainelAnalise && painelLateral() ? PADDING_PAINEL : 0;
      map.flyTo({
        center: view.center,
        zoom: view.zoom,
        pitch: view.pitch ?? 0,
        bearing: view.bearing ?? 0,
        padding: { left: padLeft, top: 0, right: 0, bottom: 0 },
        duration: isVg ? 1500 : 2000,
        essential: true
      });

      setIs3D(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [municipio, mapReady]);

  // Reajusta o enquadramento (padding) quando o painel é mostrado/ocultado, sem re-voar.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.easeTo({ padding: { left: showPainelAnalise && painelLateral() ? PADDING_PAINEL : 0, top: 0, right: 0, bottom: 0 }, duration: 400 });
  }, [showPainelAnalise, mapRef]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setHeaderBottom(el.getBoundingClientRect().bottom + 8);
    });
    ro.observe(el);
    setHeaderBottom(el.getBoundingClientRect().bottom + 8);
    return () => ro.disconnect();
  }, [headerRef]);

  return { mapReady, setMapReady, headerBottom };
}
