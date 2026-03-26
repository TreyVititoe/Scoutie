import Link from "next/link";

const popularDestinations = [
  { name: "Paris", country: "France", emoji: "🇫🇷", avgPrice: "$1,200" },
  { name: "Tokyo", country: "Japan", emoji: "🇯🇵", avgPrice: "$1,800" },
  { name: "Barcelona", country: "Spain", emoji: "🇪🇸", avgPrice: "$950" },
  { name: "New York", country: "USA", emoji: "🇺🇸", avgPrice: "$1,100" },
  { name: "Bali", country: "Indonesia", emoji: "🇮🇩", avgPrice: "$800" },
  { name: "London", country: "UK", emoji: "🇬🇧", avgPrice: "$1,400" },
];

export default function Home() {
  return (
    <div className="py-8 sm:py-16 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
          Your perfect trip,<br />
          <span className="text-brand-500">planned in minutes.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-md mx-auto">
          Tell us what you love. We&apos;ll find the flights, hotels, and experiences that fit your style and budget.
        </p>
        <Link href="/quiz" className="btn-primary inline-block text-lg !px-8 !py-4">
          Start Planning
        </Link>
      </section>

      {/* How it works */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-center text-gray-900">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Take the quiz", desc: "Tell us your destination, dates, budget, and what you love to do." },
            { step: "2", title: "Get your plan", desc: "AI builds a personalized trip with flights, stays, and events — all compared side by side." },
            { step: "3", title: "Book & go", desc: "Tap any card to book directly. We find you the best prices, you enjoy the trip." },
          ].map((item) => (
            <div key={item.step} className="card p-6 text-center space-y-3">
              <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular destinations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">Popular destinations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {popularDestinations.map((dest) => (
            <Link
              key={dest.name}
              href={`/quiz?destination=${encodeURIComponent(dest.name)}`}
              className="card p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform"
            >
              <span className="text-2xl">{dest.emoji}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{dest.name}</p>
                <p className="text-xs text-gray-400">{dest.country} · from {dest.avgPrice}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
