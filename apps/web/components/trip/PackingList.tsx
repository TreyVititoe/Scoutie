"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type PackingItem = {
  name: string;
  quantity: number;
  essential: boolean;
};

type PackingCategory = {
  name: string;
  items: PackingItem[];
};

type PackingListProps = {
  destination: string;
  startDate: string;
  endDate: string;
  activities: string[];
  pace: string;
  travelers: number;
};

function SkeletonCategory() {
  return (
    <div className="space-y-3">
      <div className="h-5 w-32 bg-gray-light rounded-[8px] animate-pulse" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 bg-gray-light rounded-[8px] animate-pulse" />
            <div className="h-4 w-40 bg-gray-light rounded-[8px] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PackingList({
  destination,
  startDate,
  endDate,
  activities,
  pace,
  travelers,
}: PackingListProps) {
  const [categories, setCategories] = useState<PackingCategory[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setCheckedItems(new Set());

    try {
      const res = await fetch("/api/packing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          activities,
          pace,
          travelers,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setCategories(data.categories || []);
      setGenerated(true);
    } catch (err) {
      console.error("[packing-list]", err);
      setError("Failed to generate packing list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleCopy = async () => {
    const lines: string[] = [];
    for (const cat of categories) {
      lines.push(`--- ${cat.name} ---`);
      for (const item of cat.items) {
        const key = `${cat.name}::${item.name}`;
        const check = checkedItems.has(key) ? "[x]" : "[ ]";
        const qty = item.quantity > 1 ? ` (x${item.quantity})` : "";
        const ess = item.essential ? " *" : "";
        lines.push(`${check} ${item.name}${qty}${ess}`);
      }
      lines.push("");
    }
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const checkedCount = checkedItems.size;

  return (
    <div className="card-base p-6 overflow-hidden">
      {/* Header */}
      <div className="pb-5 mb-5 border-b border-black/10 flex items-center justify-between">
        <div>
          <h3 className="font-sans font-semibold text-lg text-gray-dark">
            Packing List
          </h3>
          {generated && totalItems > 0 && (
            <p className="text-xs text-on-light-tertiary mt-0.5">
              {checkedCount} of {totalItems} items packed
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {generated && categories.length > 0 && (
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-[8px] text-xs font-semibold text-accent hover:text-accent-light transition-colors"
            >
              {copied ? "Copied" : "Copy list"}
            </button>
          )}
          <motion.button
            onClick={handleGenerate}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-1.5 rounded-[8px] bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Generating..."
              : generated
              ? "Regenerate"
              : "Generate Packing List"}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Not yet generated */}
        {!generated && !loading && (
          <p className="text-sm text-on-light-tertiary text-center py-4">
            Generate an AI-powered packing list tailored to your trip.
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCategory key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center py-4">{error}</p>
        )}

        {/* Generated list */}
        {generated && !loading && categories.length > 0 && (
          <>
            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-1.5 w-full bg-page-bg rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width:
                      totalItems > 0
                        ? `${(checkedCount / totalItems) * 100}%`
                        : "0%",
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <div key={cat.name}>
                  <h4 className="font-sans font-semibold text-sm text-gray-dark mb-3 uppercase tracking-wider">
                    {cat.name}
                  </h4>
                  <ul className="space-y-1.5">
                    {cat.items.map((item) => {
                      const key = `${cat.name}::${item.name}`;
                      const checked = checkedItems.has(key);
                      return (
                        <motion.li
                          key={key}
                          animate={{ scale: checked ? [0.97, 1] : 1 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleItem(key)}
                              className="w-4 h-4 rounded border-black/10 text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer"
                            />
                            <span
                              className={`text-sm transition-colors ${
                                checked
                                  ? "line-through text-on-light-tertiary"
                                  : "text-gray-dark group-hover:text-accent"
                              }`}
                            >
                              {item.name}
                              {item.quantity > 1 && (
                                <span className="text-on-light-tertiary ml-1">
                                  x{item.quantity}
                                </span>
                              )}
                            </span>
                            {item.essential && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-[8px]">
                                Essential
                              </span>
                            )}
                          </label>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
