import Link from "next/link";
import AffiliateDisclosure from "./AffiliateDisclosure";

export default function Footer() {
  return (
    <footer className="bg-text">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <Link
              href="/"
              className="font-display font-extrabold text-xl text-gradient"
            >
              walter
            </Link>
            <p className="text-sm text-white/40 mt-2 max-w-xs">
              AI-powered trip planning. One quiz, your whole trip planned and
              bookable.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-white/30 uppercase tracking-wider">
                Product
              </span>
              <Link
                href="/quiz"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Plan a trip
              </Link>
              <Link
                href="/explore"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Explore
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-white/30 uppercase tracking-wider">
                Company
              </span>
              <Link
                href="/about"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                About
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-white/30 uppercase tracking-wider">
                Legal
              </span>
              <Link
                href="/privacy"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AffiliateDisclosure />
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Walter Travel, Inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
