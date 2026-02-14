"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Service } from "@/lib/api/types"

interface Block {
  startSlot: number
  endSlot: number
}

interface SpaceSlot {
  space: Service
  block: Block
}

interface MobileSpacePickerProps {
  date: Date
  spaceSlots: SpaceSlot[]
  getSlotTimeStr: (slot: number) => string
  onSelectSlot: (space: Service, block: Block) => void
  selectedSlot?: { spaceId: string; startSlot: number } | null
  loading?: boolean
  onShowHelp?: () => void
}

export function MobileSpacePicker({
  date,
  spaceSlots,
  getSlotTimeStr,
  onSelectSlot,
  selectedSlot,
  loading,
  onShowHelp,
}: MobileSpacePickerProps) {
  // Agrupar por rango horario (startSlot, endSlot) para mostrar "X espacios" disponibles
  const slotsByTime = useMemo(() => {
    const map = new Map<string, SpaceSlot[]>()
    spaceSlots.forEach(({ space, block }) => {
      const key = `${block.startSlot}-${block.endSlot}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push({ space, block })
    })
    return Array.from(map.entries())
      .map(([key, items]) => ({
        key,
        startSlot: items[0].block.startSlot,
        endSlot: items[0].block.endSlot,
        spaces: items,
      }))
      .sort((a, b) => a.startSlot - b.startSlot)
  }, [spaceSlots])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Cargando horarios...</p>
      </div>
    )
  }

  if (slotsByTime.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Clock className="w-12 h-12 text-slate-500 mb-3" />
        <p className="text-slate-400 font-medium">No hay horarios disponibles</p>
        <p className="text-slate-500 text-sm mt-1">Probá con otra fecha</p>
      </div>
    )
  }

  return (
    <div className="px-2 pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur py-3 pb-4 -mx-2 px-4 border-b border-slate-700 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white">
            {format(date, "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <p className="text-slate-400 text-sm mt-0.5">
            {slotsByTime.length} {slotsByTime.length === 1 ? "horario disponible" : "horarios disponibles"}
          </p>
        </div>
        {onShowHelp && (
          <button
            type="button"
            onClick={onShowHelp}
            className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 shrink-0"
            aria-label="Cómo reservar"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lista de horarios - cada uno con espacios disponibles */}
      <div className="mt-4 space-y-2">
        {slotsByTime.map(({ key, startSlot, endSlot, spaces }) => {
          const startTime = getSlotTimeStr(startSlot)
          const endTime = getSlotTimeStr(endSlot)
          const durationMinutes = (endSlot - startSlot) * 30
          const durationLabel = durationMinutes >= 60
            ? `${durationMinutes / 60}h`
            : `${durationMinutes} min`

          return (
            <div key={key} className="space-y-1.5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-1">
                {startTime} – {endTime}
              </p>
              <div className="flex flex-col gap-1.5">
                {spaces.map(({ space, block }) => {
                  const isSelected =
                    selectedSlot?.spaceId === space.id &&
                    selectedSlot?.startSlot === block.startSlot

                  return (
                    <button
                      key={`${space.id}-${block.startSlot}`}
                      type="button"
                      onClick={() => onSelectSlot(space, block)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl transition-all duration-200 border flex items-center justify-between gap-3",
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-500/60 border-l-4 border-l-emerald-500"
                          : "bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 active:bg-slate-700"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {space.name}
                        </p>
                        {space.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {space.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {durationLabel} · hasta {endTime}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {space.price != null && (
                          <span className="text-sm font-semibold text-emerald-400">
                            ${Number(space.price).toLocaleString()}
                          </span>
                        )}
                        {isSelected ? (
                          <span className="text-xs font-medium text-emerald-400">
                            ✓ Seleccionado
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
