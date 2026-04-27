"use client";

interface Props {
  startDate: string | null;
  endDate: string | null;
  flexibleDates: boolean;
  onStartChange: (d: string | null) => void;
  onEndChange: (d: string | null) => void;
  onFlexibleChange: (b: boolean) => void;
}

export default function WhenPopover({
  startDate,
  endDate,
  flexibleDates,
  onStartChange,
  onEndChange,
  onFlexibleChange,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-elevated p-5 w-[360px] space-y-4">
      <div>
        <label className="block text-[11px] font-semibold text-gray-dark mb-1">
          Check-in
        </label>
        <input
          type="date"
          value={startDate ?? ""}
          onChange={(e) => onStartChange(e.target.value || null)}
          className="w-full text-[15px] text-gray-dark border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-gray-dark mb-1">
          Check-out
        </label>
        <input
          type="date"
          value={endDate ?? ""}
          min={startDate ?? undefined}
          onChange={(e) => onEndChange(e.target.value || null)}
          className="w-full text-[15px] text-gray-dark border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
        />
      </div>
      <label className="flex items-center gap-2 text-[13px] text-gray-dark">
        <input
          type="checkbox"
          checked={flexibleDates}
          onChange={(e) => onFlexibleChange(e.target.checked)}
          className="w-4 h-4 accent-accent"
        />
        I'm flexible on these dates
      </label>
    </div>
  );
}
