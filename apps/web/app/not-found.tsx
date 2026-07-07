import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-page-bg flex flex-col items-center justify-center px-6 text-center">
      <p className="text-ink-faint text-[12px] tracking-wider uppercase mb-3">
        404
      </p>
      <h1 className="font-semibold text-[36px] text-ink leading-tight mb-3">
        This road does not go anywhere.
      </h1>
      <p className="text-ink-soft text-lg max-w-md mb-8">
        The page you are after moved, or never existed. The world outside,
        however, is very real.
      </p>
      <Link
        href="/"
        className="bg-accent text-white rounded-[10px] px-8 py-3 text-sm font-semibold hover:bg-accent-light transition-colors"
      >
        Plan a trip instead
      </Link>
    </div>
  );
}
