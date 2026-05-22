import Link from "next/link";
import AffiliateDisclosure from "./AffiliateDisclosure";

export default function Footer() {
  return (
    <footer className="bg-page-bg border-t border-white/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div className="max-w-xs">
            <Link href="/" className="text-[17px] font-semibold text-snow-off-glacier">
              Walter
            </Link>
            <p className="text-[13px] text-white/55 mt-2 leading-[1.55]">
              The world is wasted on people who stay home.
            </p>
          </div>
          <div className="flex gap-10 text-[13px]">
            <div className="flex flex-col gap-2">
              <span className="text-white/45 font-medium">Product</span>
              <Link href="/" className="text-white/75 hover:text-white transition-colors">Plan a trip</Link>
              <Link href="/explore" className="text-white/75 hover:text-white transition-colors">Explore</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white/45 font-medium">Company</span>
              <Link href="/about" className="text-white/75 hover:text-white transition-colors">About</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white/45 font-medium">Legal</span>
              <Link href="/privacy" className="text-white/75 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-white/75 hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AffiliateDisclosure />
          <p className="text-[12px] text-white/40 tabular-nums">
            &copy; {new Date().getFullYear()} Walter Travel, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
