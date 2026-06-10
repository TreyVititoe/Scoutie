# The one-button purchase agent: what is real and what is not

Boss's ask: cart is full, user clicks Pay, an agent buys every flight, room, and ticket automatically.
Verdict up front: the button is a great idea, the free-roaming buying agent is the dumb part. The
honest version of this feature is an orchestration problem with real partnerships, not an AI problem.
What shipped today is a simulated checkout that proves the UX, with a clean seam where real booking
plugs in later.

## Why "an agent just buys it all" does not work today

**1. Nothing in our stack can write, only read.** SerpAPI scrapes Google Flights results. The
RapidAPI Booking.com endpoint is search-only. Ticketmaster's public API does discovery, not
purchase. There is no "book it" call to make. Booking inventory write-access is gated behind
accreditation (IATA/ARC for air) or commercial partnerships, on purpose.

**2. The browser-agent workaround is a trap.** An agent driving airline/hotel/Ticketmaster
checkout pages with the user's card hits, in order: terms-of-service bans on automated purchasing,
industrial anti-bot walls (Ticketmaster queues, PerimeterX, CAPTCHAs designed exactly for this),
checkout flows that change weekly and silently break the agent, and card-not-present fraud flags
when one IP buys for many users. Airlines litigate this pattern (Southwest v. Kiwi). At any real
volume Walter gets blocked, then sued.

**3. The money problems are worse than the technical ones.**
- Holding card numbers to re-enter on third-party sites puts us in full PCI-DSS scope.
- Flight prices drift between cart and purchase, sometimes in minutes. Who eats the difference,
  and with whose authorization?
- Partial failure is the killer: flight books, hotel sells out mid-checkout. The user now owns a
  flight to a city with no room, and rollback means airline change fees and refund timelines we
  do not control.
- A wrong-date purchase by an agent is not a bug report, it is thousands of dollars and a
  chargeback. Travel-agency licensing (e.g. California Seller of Travel) starts applying too.

## The path that actually works

- **v1, shipped today:** simulated one-button checkout proving the flow end to end, plus the
  existing affiliate deep links per item. Zero liability, demonstrates the product promise, and
  affiliate commissions are the standard monetization for exactly this stage.
- **v2, the first real money:** flights booked programmatically via an aggregator like Duffel or
  Amadeus Self-Service (they hold the accreditation and the PCI burden), payment through Stripe,
  hotels via a partner API (Expedia Rapid / Duffel Stays), events remain hand-off links. Mixed
  cart rule: book what has an API, deep-link the rest, one receipt.
- **v3, the boss's dream, properly:** full orchestration with hold-then-confirm sagas (reserve
  everything, charge once, confirm everything, auto-release on any failure), price-drift
  re-confirmation UX, and a human support path. This is a real build with real contracts, not a
  weekend agent.

Where AI genuinely belongs in checkout: choosing fallbacks when an item fails (next-best flight,
similar hotel), drafting the traveler communications, and watching fares between cart and pay.
Deciding to spend the user's money on a third-party website it does not have a contract with is
not an AI capability gap, it is a business-relationship gap, and no model release will close it.

The simulation boundary is marked in `apps/web/app/api/checkout/route.ts`.
