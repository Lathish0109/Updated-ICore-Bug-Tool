import Link from "next/link";

import { RANGE_OPTIONS, type RangeValue } from "@/lib/date-range";

export function RangeSelector({ basePath, value }: { basePath: string; value: RangeValue }) {
  return (
    <div className="flex items-center gap-1.5">
      {RANGE_OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={`${basePath}?range=${option.value}`}
          scroll={false}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            value === option.value
              ? "bg-primary text-primary-foreground border-transparent"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
