import Link from "next/link";
import AffiliateDisclosure from "./AffiliateDisclosure";

export default function Footer() {
  return (
    <footer className="bg-page-bg border-t border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div className="max-w-xs">
            <Link href="/" className="text-title font-semibold text-ink">
              Walter
            </Link>
            <p className="text-label text-ink-faint mt-2 leading-[1.55]">
              The world is wasted on people who stay home.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-6 sm:gap-10 text-label">
            <div className="flex flex-col gap-2">
              <span className="text-ink-faint font-medium">Product</span>
              <Link href="/" className="text-ink-soft hover:text-ink transition-colors">Plan a trip</Link>
              <Link href="/explore" className="text-ink-soft hover:text-ink transition-colors">Explore</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-ink-faint font-medium">Company</span>
              <Link href="/about" className="text-ink-soft hover:text-ink transition-colors">About</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-ink-faint font-medium">Legal</span>
              <Link href="/privacy" className="text-ink-soft hover:text-ink transition-colors">Privacy</Link>
              <Link href="/terms" className="text-ink-soft hover:text-ink transition-colors">Terms</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-line mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AffiliateDisclosure />
          <p className="text-[12px] text-ink-faint tabular-nums">
            &copy; {new Date().getFullYear()} Walter Travel, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
