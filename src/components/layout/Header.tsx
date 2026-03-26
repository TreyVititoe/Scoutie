"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isQuiz = pathname.startsWith("/quiz");

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="10" r="3" />
              <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-900">scoutie</span>
        </Link>

        {!isQuiz && (
          <nav className="hidden sm:flex items-center gap-6">
            <NavLink href="/" current={pathname}>Home</NavLink>
            <NavLink href="/saved" current={pathname}>Saved</NavLink>
            <NavLink href="/profile" current={pathname}>Profile</NavLink>
          </nav>
        )}

        {!isQuiz && (
          <Link href="/quiz" className="btn-primary text-sm !py-2 !px-4">
            Plan a Trip
          </Link>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, current, children }: { href: string; current: string; children: React.ReactNode }) {
  const active = current === href;
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        active ? "text-brand-600" : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}
