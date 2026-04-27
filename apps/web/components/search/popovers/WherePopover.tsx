"use client";

import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  onClose: () => void;
}

export default function WherePopover({ value, onChange, placeholder, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-elevated p-5 w-[360px]">
      <label className="block text-[11px] font-semibold text-gray-dark mb-2">
        Search destinations
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onClose();
        }}
        placeholder={placeholder ?? "City, region, or country"}
        className="w-full text-[15px] text-gray-dark border-b border-gray-200 pb-2 focus:outline-none focus:border-accent"
      />
    </div>
  );
}
