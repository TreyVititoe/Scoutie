import Link from "next/link";
import AffiliateDisclosure from "./AffiliateDisclosure";

const LINKS = [
  { href: "/", label: "Plan a trip" },
  { href: "/explore", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="bg-page-bg border-t border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-label">
            <Link href="/" className="font-semibold text-ink">
              Walter
            </Link>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-ink-soft hover:text-ink transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-[12px] text-ink-faint tabular-nums shrink-0">
            &copy; {new Date().getFullYear()} Walter, Inc.
          </p>
        </div>
        <div className="mt-2">
          <AffiliateDisclosure />
        </div>
      </div>
    </footer>
  );
}
