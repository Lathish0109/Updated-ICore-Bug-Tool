import type { CSSProperties, ReactNode } from "react";

export function HoverTooltip({
  label,
  children,
  className = "",
  style,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`group relative ${className}`} style={style}>
      {children}
      <span className="border-border bg-popover text-popover-foreground pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 scale-90 rounded-md border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-md transition-all duration-100 group-hover:scale-100 group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}
