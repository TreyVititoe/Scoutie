"use client";

// Color palette comparison — open /preview to compare brand color directions
// before applying any to the live site. Pure visual sample — does not write
// to walter_prefs / cart / store.

type Palette = {
  name: string;
  description: string;
  primary: string; // main accent (replaces #006571)
  light: string; // accent-light
  deep: string; // accent-dark — used at top of hero gradient
  deepest: string; // accent-deep — used at bottom of hero gradient
  pop: string; // bright accent (replaces #79e7f8 cyan)
  popText: string; // text color for use on pop bg
};

const palettes: Palette[] = [
  {
    name: "Soft Peach",
    description:
      "Softer, more refined. Pastel-leaning. Less shouty — feels boutique, magazine-y. Best if you want the warmth but without the 'energy drink' loudness.",
    primary: "#EE8362",
    light: "#F4A689",
    deep: "#A24A29",
    deepest: "#4A1E0C",
    pop: "#FFE0A8",
    popText: "#4A1E0C",
  },
  {
    name: "Sunset Coral (original)",
    description:
      "The version you picked. Mid-saturation — warm and optimistic without tipping into either pastel or fire. Reference point for the others.",
    primary: "#E25A37",
    light: "#F08362",
    deep: "#8B2914",
    deepest: "#3F1207",
    pop: "#FFD46B",
    popText: "#3F1207",
  },
  {
    name: "Sunset Punch",
    description:
      "Most saturated of the four. Vibrant, high-energy, wakes the page up — but the brightness can feel aggressive on long form.",
    primary: "#F44726",
    light: "#F76647",
    deep: "#7A1A0A",
    deepest: "#350A03",
    pop: "#FFB938",
    popText: "#350A03",
  },
  {
    name: "Terracotta",
    description:
      "Earthier and a touch desaturated. Reads more premium / editorial. Less 'sunset', more 'desert at golden hour'. Pairs naturally with travel imagery.",
    primary: "#C25538",
    light: "#D67A5C",
    deep: "#6F2613",
    deepest: "#321008",
    pop: "#E8B569",
    popText: "#321008",
  },
];

function Swatch({ color, label, hex, dark }: { color: string; label: string; hex: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span
        className="w-7 h-7 rounded-[8px] shadow-[0_2px_6px_rgba(0,0,0,0.1)] border border-black/5 flex-shrink-0"
        style={{ background: color }}
      />
      <div>
        <p className={`font-semibold ${dark ? "text-white" : "text-gray-dark"}`}>{label}</p>
        <p className={`font-mono ${dark ? "text-white/60" : "text-on-light-tertiary"}`}>{hex}</p>
      </div>
    </div>
  );
}

function PalettePreview({ p }: { p: Palette }) {
  const heroGradient = `linear-gradient(165deg, ${p.deep} 0%, ${p.deepest} 100%)`;
  const popGlow = `radial-gradient(circle at 78% 18%, ${p.pop}40 0%, transparent 55%), radial-gradient(circle at 14% 82%, ${p.light}3a 0%, transparent 50%)`;

  return (
    <section className="rounded-[28px] overflow-hidden bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-black/5 mb-12">
      {/* Header strip */}
      <header className="px-7 py-5 border-b border-black/5 flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h3 className="text-2xl font-bold text-gray-dark tracking-tight mb-1">{p.name}</h3>
          <p className="text-on-light-secondary text-sm max-w-xl">{p.description}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          <Swatch color={p.primary} label="Primary" hex={p.primary} />
          <Swatch color={p.light} label="Light" hex={p.light} />
          <Swatch color={p.deep} label="Deep" hex={p.deep} />
          <Swatch color={p.pop} label="Pop" hex={p.pop} />
        </div>
      </header>

      {/* Hero band */}
      <div className="relative px-8 py-16 sm:py-20 text-center overflow-hidden" style={{ background: heroGradient }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: popGlow }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: p.pop }} />
            <span className="text-[12px] uppercase tracking-[2.5px] font-semibold" style={{ color: p.pop }}>
              Skip 47 tabs
            </span>
          </div>
          <h2 className="text-white text-[36px] sm:text-[44px] font-semibold tracking-display leading-[1.04] mb-4">
            One quiz.{" "}
            <span style={{ color: p.pop }}>Your whole trip.</span>
          </h2>
          <p className="text-white/75 text-[16px] mb-8 max-w-md mx-auto">
            Flights, hotels, concerts, restaurants — Walter assembles the whole thing in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              className="rounded-[14px] px-8 py-4 text-[16px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all hover:brightness-105"
              style={{ background: p.pop, color: p.popText }}
            >
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              Quick Plan
            </button>
            <button className="bg-white/15 backdrop-blur-sm border border-white/25 text-white rounded-[14px] px-8 py-4 text-[16px] font-bold flex items-center justify-center gap-2 hover:bg-white/25 transition-colors">
              <span className="material-symbols-outlined text-[20px]">tune</span>
              Design My Trip
            </button>
          </div>
        </div>
      </div>

      {/* Light surface — sample cards mirroring real itinerary */}
      <div className="bg-page-bg px-7 py-10">
        <p
          className="text-[11px] uppercase tracking-[2.5px] font-semibold mb-2"
          style={{ color: p.primary }}
        >
          On a light surface
        </p>
        <h4 className="text-[24px] font-semibold text-gray-dark tracking-tight leading-tight mb-6">
          Where to next?
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Flight card */}
          <div
            className="bg-white rounded-[18px] p-5 border"
            style={{ borderColor: `${p.primary}14` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: `${p.primary}aa` }}>
                Flight
              </span>
              <span
                className="rounded-pill px-2.5 py-0.5 text-[10px] font-semibold"
                style={{ background: `${p.pop}33`, color: p.primary }}
              >
                Cheapest
              </span>
            </div>
            <p className="font-semibold text-gray-dark text-base">LAX → LIS</p>
            <p className="text-on-light-secondary text-xs mt-1">11h 25m · Nonstop</p>
            <p className="font-semibold text-lg mt-3" style={{ color: p.primary }}>
              $612
            </p>
          </div>

          {/* Hotel card — selected style (filled with primary) */}
          <div className="rounded-[18px] p-5 text-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]" style={{ background: p.primary }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: p.pop }}>
                Hotel · 4 nights
              </span>
              <span className="material-symbols-outlined text-[16px]" style={{ color: p.pop }}>
                check_circle
              </span>
            </div>
            <p className="font-semibold text-base">Memmo Alfama</p>
            <p className="text-white/75 text-xs mt-1">Boutique · Rooftop pool</p>
            <p className="font-semibold text-lg mt-3">$480</p>
          </div>

          {/* Event card */}
          <div className="bg-white rounded-[18px] p-5 border" style={{ borderColor: `${p.primary}14` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: `${p.primary}aa` }}>
                Event · Sat
              </span>
              <span className="material-symbols-outlined text-[16px]" style={{ color: p.primary }}>
                music_note
              </span>
            </div>
            <p className="font-semibold text-gray-dark text-base">Lisbon Jazz Festival</p>
            <p className="text-on-light-secondary text-xs mt-1">Castelo de São Jorge · 8pm</p>
            <p className="font-semibold text-lg mt-3" style={{ color: p.primary }}>
              $84
            </p>
          </div>
        </div>

        {/* Inline CTA strip */}
        <div className="mt-7 flex items-center gap-3 flex-wrap">
          <button
            className="rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: p.primary }}
          >
            Start the quiz
          </button>
          <button
            className="rounded-[10px] px-5 py-2.5 text-sm font-semibold border bg-white transition-colors"
            style={{ borderColor: `${p.primary}55`, color: p.primary }}
          >
            See trips others love
          </button>
          <span className="text-on-light-tertiary text-xs ml-2">
            Free forever · No sign-up
          </span>
        </div>
      </div>
    </section>
  );
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-page-bg pt-12 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-10">
          <p className="text-accent text-[11px] uppercase tracking-[2.5px] font-semibold mb-2">
            Walter · Sunset Coral — shade variations
          </p>
          <h1 className="text-[36px] sm:text-[44px] font-semibold text-gray-dark tracking-display leading-[1.05] mb-3">
            Hone in on the warmth.
          </h1>
          <p className="text-on-light-secondary text-[17px] max-w-2xl">
            Four shades of the sunset/coral direction — softer pastel, the
            original mid-tone, a bolder punch, and a more earthy terracotta.
            Same hero band + CTA pair + flight/hotel/event row in each so
            you can compare apples-to-apples.
          </p>
        </div>

        {palettes.map((p) => (
          <PalettePreview key={p.name} p={p} />
        ))}

        <div className="text-center text-on-light-tertiary text-sm mt-12">
          When you pick one, tell me the name and I&apos;ll thread it through
          tailwind.config + globals.css + all the existing color references.
        </div>
      </div>
    </div>
  );
}
