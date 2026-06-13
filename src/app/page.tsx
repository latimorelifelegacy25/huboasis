import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Disclaimer } from "@/components/Disclaimer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-brand-navy text-brand-cream">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center">
            <h1 className="text-3xl font-bold sm:text-4xl">
              Protecting Today. Securing Tomorrow.
            </h1>
            <p className="mt-4 text-lg text-brand-cream/80">
              A quick, guided intake to help Jackson understand your family,
              your goals, and where your protection plan may have gaps &mdash;
              before your first conversation.
            </p>
            <div className="mt-8">
              <Link
                href="/intake"
                className="inline-block rounded-md bg-brand-gold px-6 py-3 font-semibold text-brand-navy shadow hover:opacity-90"
              >
                Start Your Intake
              </Link>
            </div>
            <p className="mt-4 text-sm text-brand-cream/60">
              Takes about 8&ndash;10 minutes.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="font-semibold text-brand-navy">
                Tell Us About You
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Share a bit about your family, work, and what matters most to
                you.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="font-semibold text-brand-navy">
                Review Your Priorities
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Walk through retirement, savings, and protection questions at
                your own pace.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="font-semibold text-brand-navy">
                Get Your Protection &amp; Legacy Score
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                See a snapshot of your results and book time with Jackson to
                review them together.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-lg border border-gray-200 bg-white p-5">
            <Disclaimer />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
