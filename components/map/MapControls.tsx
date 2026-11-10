import { Popup } from "react-map-gl/maplibre"
import { MapPopup } from "@/components/MapPopup"
import type { DashboardState } from "@/hooks/useDashboard"

/** Popup de feição sobreposto ao mapa. */
export function MapControls({ dash }: { dash: DashboardState }) {
  const { popupInfo, setPopupInfo, rpDanoFisico } = dash

  return (
    <>
      {popupInfo && (
        <Popup
          longitude={popupInfo.lngLat[0]}
          latitude={popupInfo.lngLat[1]}
          anchor="bottom"
          onClose={() => setPopupInfo(null)}
          closeButton={true}
          closeOnClick={false}
          className="z-50 !p-0"
          maxWidth="250px"
        >
          <MapPopup
            source={popupInfo.source}
            properties={popupInfo.properties}
            rp={rpDanoFisico}
          />
        </Popup>
      )}
    </>
  )
}
