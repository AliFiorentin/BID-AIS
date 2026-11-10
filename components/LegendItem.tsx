interface LegendItemProps {
  cor: string
  label: string
  area?: boolean
}

export function LegendItem({ cor, label, area }: LegendItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      {area ? (
        <div
          className="h-2.5 w-3 shrink-0 rounded-sm border"
          style={{ borderColor: cor, backgroundColor: `${cor}30` }}
        />
      ) : (
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: cor }}
        />
      )}
      <span
        className="min-w-0 truncate text-[9px] leading-tight font-medium text-slate-700"
        title={label}
      >
        {label}
      </span>
    </div>
  )
}
