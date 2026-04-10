import Link from "next/link";
import AffiliateDisclosure from "./AffiliateDisclosure";

export default function Footer() {
  return (
    <footer className="bg-gray-light">
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <Link href="/" className="text-[17px] font-semibold text-gray-dark">
              Walter
            </Link>
            <p className="text-sm text-on-light-tertiary mt-2 max-w-xs tracking-caption leading-[1.43]">
              AI-powered trip planning. One quiz, your whole trip planned and bookable.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold text-on-light-tertiary uppercase tracking-wider">Product</span>
              <Link href="/quiz" className="text-sm text-on-light-secondary hover:text-accent transition-colors tracking-caption">Plan a trip</Link>
              <Link href="/explore" className="text-sm text-on-light-secondary hover:text-accent transition-colors tracking-caption">Explore</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold text-on-light-tertiary uppercase tracking-wider">Company</span>
              <Link href="/about" className="text-sm text-on-light-secondary hover:text-accent transition-colors tracking-caption">About</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold text-on-light-tertiary uppercase tracking-wider">Legal</span>
              <Link href="/privacy" className="text-sm text-on-light-secondary hover:text-accent transition-colors tracking-caption">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-on-light-secondary hover:text-accent transition-colors tracking-caption">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-black/5 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AffiliateDisclosure />
          <p className="text-[12px] text-on-light-tertiary tracking-micro">
            &copy; {new Date().getFullYear()} Walter Travel, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
