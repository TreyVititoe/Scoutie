import Link from "next/link";
import AffiliateDisclosure from "./AffiliateDisclosure";

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-outline-variant/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <Link
              href="/"
              className="font-headline font-extrabold text-xl text-gradient"
            >
              walter
            </Link>
            <p className="text-sm font-body text-on-surface-variant mt-2 max-w-xs">
              AI-powered trip planning. One quiz, your whole trip planned and
              bookable.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-headline font-bold text-on-surface-variant/50 uppercase tracking-wider">
                Product
              </span>
              <Link
                href="/quiz"
                className="text-sm font-body text-on-surface-variant hover:text-primary transition-colors"
              >
                Plan a trip
              </Link>
              <Link
                href="/explore"
                className="text-sm font-body text-on-surface-variant hover:text-primary transition-colors"
              >
                Explore
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-headline font-bold text-on-surface-variant/50 uppercase tracking-wider">
                Company
              </span>
              <Link
                href="/about"
                className="text-sm font-body text-on-surface-variant hover:text-primary transition-colors"
              >
                About
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-headline font-bold text-on-surface-variant/50 uppercase tracking-wider">
                Legal
              </span>
              <Link
                href="/privacy"
                className="text-sm font-body text-on-surface-variant hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm font-body text-on-surface-variant hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-outline-variant/20 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AffiliateDisclosure />
          <p className="text-xs font-body text-on-surface-variant/50">
            &copy; {new Date().getFullYear()} Walter Travel, Inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
