"use client";

interface Props {
  adults: number;
  children: number;
  infants: number;
  onAdultsChange: (n: number) => void;
  onChildrenChange: (n: number) => void;
  onInfantsChange: (n: number) => void;
}

interface RowProps {
  title: string;
  subtitle: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
}

function Row({ title, subtitle, value, onChange, min = 0 }: RowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-[14px] font-semibold text-gray-dark">{title}</div>
        <div className="text-[12px] text-gray-dark/60">{subtitle}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${title}`}
          className="w-8 h-8 rounded-full border border-gray-300 text-gray-dark disabled:opacity-30 hover:border-gray-dark"
        >
          -
        </button>
        <span className="w-6 text-center text-[14px] text-gray-dark">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${title}`}
          className="w-8 h-8 rounded-full border border-gray-300 text-gray-dark hover:border-gray-dark"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function WhoPopover({
  adults,
  children,
  infants,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-elevated p-5 w-[360px] divide-y divide-gray-100">
      <Row title="Adults" subtitle="Ages 13 or above" value={adults} onChange={onAdultsChange} />
      <Row title="Children" subtitle="Ages 2 - 12" value={children} onChange={onChildrenChange} />
      <Row title="Infants" subtitle="Under 2" value={infants} onChange={onInfantsChange} />
    </div>
  );
}
