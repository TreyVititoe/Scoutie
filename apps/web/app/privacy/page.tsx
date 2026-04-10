import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Walter",
  description:
    "Learn how Walter collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-light">
      {/* Nav */}
      <nav className="nav-glass bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-white text-[17px] font-semibold"
          >
            Walter
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-[8px] p-8">
          <h1 className="font-semibold text-[28px] text-gray-dark mb-4">
            Privacy Policy
          </h1>
          <p className="text-on-light-tertiary text-sm mb-12">
            Last updated: April 2, 2026
          </p>

          <div className="space-y-10 text-on-light-secondary leading-relaxed">
            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                1. Introduction
              </h2>
              <p>
                Walter (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
                operates the Walter travel planning platform. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you use our website and services.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                2. Information We Collect
              </h2>
              <p className="mb-3">
                We collect information you provide directly, as well as data
                generated through your use of our services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-gray-dark">Quiz responses</strong> --
                  Travel preferences, budget ranges, dates, destination
                  interests, and activity preferences you submit through our trip
                  planning quiz.
                </li>
                <li>
                  <strong className="text-gray-dark">Trip data</strong> -- Itinerary
                  details, saved trips, and booking selections generated through
                  our platform.
                </li>
                <li>
                  <strong className="text-gray-dark">Account information</strong> --
                  Email address and authentication data when you create an
                  account to save your trips.
                </li>
                <li>
                  <strong className="text-gray-dark">Affiliate click data</strong> --
                  When you click through to booking partners, we record the click
                  for commission tracking purposes.
                </li>
                <li>
                  <strong className="text-gray-dark">Usage data</strong> -- Browser
                  type, device information, IP address, pages visited, and
                  interaction patterns collected automatically.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  To generate personalized travel itineraries based on your
                  preferences.
                </li>
                <li>
                  To provide real-time pricing and availability from booking
                  partners.
                </li>
                <li>To save and manage your trips when you create an account.</li>
                <li>To improve our AI models and service quality.</li>
                <li>
                  To track affiliate referrals and earn commissions that keep the
                  service free.
                </li>
                <li>
                  To communicate service updates or respond to your inquiries.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                4. Third-Party Services
              </h2>
              <p className="mb-3">
                Walter integrates with the following third-party services to
                deliver our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-gray-dark">Supabase</strong> -- Database
                  and authentication infrastructure. Your account data and trip
                  information are stored securely on Supabase servers.
                </li>
                <li>
                  <strong className="text-gray-dark">Anthropic (Claude)</strong> -- AI
                  model provider used to generate travel itineraries. Quiz
                  responses are sent to Anthropic for processing.
                </li>
                <li>
                  <strong className="text-gray-dark">Mapbox</strong> -- Mapping and
                  geolocation services for displaying trip locations and routes.
                </li>
                <li>
                  <strong className="text-gray-dark">Booking partners</strong> --
                  Including Skyscanner, Booking.com, and other travel affiliates.
                  When you click through to book, you are subject to their
                  respective privacy policies.
                </li>
              </ul>
              <p className="mt-3">
                Each third-party service has its own privacy policy governing how
                it handles your data. We encourage you to review those policies.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                5. Cookies and Tracking
              </h2>
              <p>
                We use cookies and similar tracking technologies to maintain your
                session, remember your preferences, and track affiliate referrals.
                Essential cookies are required for the service to function.
                Analytics cookies help us understand usage patterns. You can
                configure your browser to refuse cookies, though this may limit
                some features.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                6. Data Retention
              </h2>
              <p>
                We retain your quiz responses and trip data for as long as your
                account is active or as needed to provide services. Anonymous,
                aggregated data may be retained indefinitely to improve our AI
                models. You may request deletion of your data at any time by
                contacting us.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                7. Data Security
              </h2>
              <p>
                We implement industry-standard security measures including
                encryption in transit (TLS) and at rest, secure authentication,
                and access controls. However, no method of electronic transmission
                or storage is completely secure, and we cannot guarantee absolute
                security.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                8. Your Rights
              </h2>
              <p className="mb-3">
                Depending on your location, you may have the following rights
                regarding your personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-gray-dark">Access</strong> -- Request a copy
                  of the personal data we hold about you.
                </li>
                <li>
                  <strong className="text-gray-dark">Correction</strong> -- Request
                  correction of inaccurate or incomplete data.
                </li>
                <li>
                  <strong className="text-gray-dark">Deletion</strong> -- Request
                  deletion of your personal data.
                </li>
                <li>
                  <strong className="text-gray-dark">Portability</strong> -- Request
                  your data in a portable, machine-readable format.
                </li>
                <li>
                  <strong className="text-gray-dark">Opt-out</strong> -- Opt out of
                  certain data processing activities, including the sale or
                  sharing of personal information.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                9. GDPR (European Users)
              </h2>
              <p>
                If you are located in the European Economic Area, you have rights
                under the General Data Protection Regulation. Our legal basis for
                processing your data includes your consent (for quiz responses),
                contract performance (for trip generation), and legitimate
                interests (for service improvement). You may withdraw consent at
                any time and lodge a complaint with your local data protection
                authority.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                10. CCPA (California Residents)
              </h2>
              <p>
                California residents have the right to know what personal
                information we collect, request deletion of that information, and
                opt out of the sale of personal information. Walter does not sell
                personal information. To exercise your rights, contact us using
                the information below.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                11. Children&apos;s Privacy
              </h2>
              <p>
                Our services are not directed to individuals under the age of 13.
                We do not knowingly collect personal information from children. If
                we learn that we have collected data from a child under 13, we
                will delete that information promptly.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                12. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of material changes by posting the updated policy on
                this page with a revised &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-[21px] text-gray-dark mb-3">
                13. Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy or wish to
                exercise your data rights, please contact us at{" "}
                <a
                  href="mailto:privacy@scoutie.com"
                  className="text-accent hover:underline"
                >
                  privacy@scoutie.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
