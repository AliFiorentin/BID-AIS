"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export function RouteModal({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const close = () => router.back()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto px-4 py-6"
      style={{
        backgroundColor: "rgba(3,58,82,0.45)",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="animate-scale-in relative w-full max-w-[1440px] overflow-hidden rounded-3xl bg-white shadow-2xl border border-white/60">
        <button
          onClick={close}
          aria-label="Fechar"
          title="Fechar (Esc)"
          className="active-press absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition-all hover:bg-slate-100 active:scale-95"
          style={{ color: "#055071" }}
        >
          <X size={16} strokeWidth={2.5} />
        </button>
        {children}
      </div>
    </div>
  )
}
