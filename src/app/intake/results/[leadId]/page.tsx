import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Disclaimer } from "@/components/Disclaimer";
import { getClientResult } from "@/lib/queries";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const result = await getClientResult(leadId);

  if (!result) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-brand-navy text-brand-cream">
          <div className="mx-auto max-w-2xl px-4 py-12 text-center">
            <p className="text-sm uppercase tracking-wide text-brand-gold">
              Your Results
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Thanks, {result.firstName}!
            </h1>
            <p className="mt-4 text-brand-cream/80">
              Here&rsquo;s your personalized Protection &amp; Legacy snapshot.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 py-10 space-y-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Protection &amp; Legacy Score
            </p>
            <p className="mt-2 text-5xl font-bold text-brand-navy">
              {result.clientScore}
              <span className="text-xl text-gray-400">/100</span>
            </p>
          </div>

          {result.priorities.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-brand-navy">Your Top Priorities</h2>
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                {result.priorities.map((p) => (
                  <li key={p.id}>&bull; {p.label}</li>
                ))}
              </ul>
            </div>
          )}

          {result.recommendedTracks.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-brand-navy">
                Topics to Review with Jackson
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Based on your answers, these are topics to review with
                Jackson.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                {result.recommendedTracks.map((t) => (
                  <li key={t.id}>&bull; {t.label}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg bg-brand-navy p-6 text-center text-brand-cream">
            <h2 className="text-lg font-semibold">Ready for your next step?</h2>
            <p className="mt-2 text-sm text-brand-cream/80">
              Book a time with Jackson to walk through your results together.
            </p>
            <Link
              href={`/book-with-jackson/${leadId}`}
              className="mt-4 inline-block rounded-md bg-brand-gold px-6 py-3 font-semibold text-brand-navy hover:opacity-90"
            >
              Book With Jackson
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <Disclaimer />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
