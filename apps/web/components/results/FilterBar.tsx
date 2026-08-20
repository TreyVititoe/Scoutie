"use client";

/*
 * Generic filter strip for the /results panels: labeled chip groups on one
 * wrapping row, with a quiet Reset at the end when anything is active.
 */

export type ChipOption<V> = { value: V; label: string };

export function ChipGroup<V extends string | number | null>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ChipOption<V>[];
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className={`px-3 py-1.5 rounded-pill text-[12px] font-semibold border transition-colors ${
                active
                  ? "bg-ink text-snow-off-glacier border-ink"
                  : "border-line text-ink-soft hover:text-ink hover:border-ink/40"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MultiChipGroup({
  label,
  options,
  values,
  onChange,
  max = 8,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  if (options.length < 2) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {options.slice(0, max).map((o) => {
          const active = values.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() =>
                onChange(
                  active ? values.filter((v) => v !== o) : [...values, o]
                )
              }
              aria-pressed={active}
              className={`px-3 py-1.5 rounded-pill text-[12px] font-semibold border transition-colors ${
                active
                  ? "bg-ink text-snow-off-glacier border-ink"
                  : "border-line text-ink-soft hover:text-ink hover:border-ink/40"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FilterBar({
  children,
  activeCount,
  onReset,
  matchLine,
}: {
  children: React.ReactNode;
  activeCount: number;
  onReset: () => void;
  matchLine?: string;
}) {
  return (
    <div className="card-base px-4 py-3 mb-6">
      <div className="flex items-center gap-x-5 gap-y-2.5 flex-wrap">
        {children}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-[12px] font-semibold text-ink-soft hover:text-ink underline underline-offset-4 transition-colors"
          >
            Reset filters
          </button>
        )}
      </div>
      {matchLine ? (
        <p className="text-[11px] text-ink-faint mt-2">{matchLine}</p>
      ) : null}
    </div>
  );
}
