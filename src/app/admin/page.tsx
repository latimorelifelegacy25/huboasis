import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import { listLeads, type LeadSummary } from "@/lib/queries";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

const urgencyClass: Record<string, string> = {
  high: "bg-red-50 text-red-700 ring-red-100",
  medium: "bg-amber-50 text-amber-700 ring-amber-100",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatJourney(value: string) {
  const labels: Record<string, string> = {
    client: "Client",
    business_partner: "Business Partner",
    both: "Client + Partner",
  };

  return labels[value] ?? value;
}

function averageAdvisorScore(leads: LeadSummary[]) {
  const scored = leads.filter((lead) => typeof lead.advisorScore === "number");

  if (scored.length === 0) return "—";

  const total = scored.reduce((sum, lead) => sum + (lead.advisorScore ?? 0), 0);
  return Math.round(total / scored.length).toString();
}

function UrgencyBadge({ urgency }: { urgency: LeadSummary["urgency"] }) {
  if (!urgency) {
    return <span className="text-sm text-gray-400">Not scored</span>;
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${
        urgencyClass[urgency] ?? "bg-gray-50 text-gray-600 ring-gray-100"
      }`}
    >
      {urgency}
    </span>
  );
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect("/admin/login");
  }

  const leads = await listLeads();
  const highUrgency = leads.filter((lead) => lead.urgency === "high").length;
  const partnerInterest = leads.filter(
    (lead) => lead.journey === "business_partner" || lead.journey === "both"
  ).length;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-brand-navy text-brand-cream">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-brand-gold">
                  Latimore OS Admin
                </p>
                <h1 className="mt-2 text-3xl font-bold">Intake Lead Dashboard</h1>
                <p className="mt-3 max-w-2xl text-sm text-brand-cream/80">
                  Review every virtual intake submission, prioritize high-urgency
                  protection gaps, and open each advisor brief before follow-up.
                </p>
              </div>
              <form action={logout}>
                <button className="rounded-md border border-brand-gold px-3 py-2 text-sm font-semibold text-brand-gold hover:bg-brand-gold hover:text-brand-navy">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Total Leads" value={leads.length.toString()} />
            <MetricCard label="High Urgency" value={highUrgency.toString()} />
            <MetricCard label="Partner Interest" value={partnerInterest.toString()} />
            <MetricCard label="Avg Advisor Score" value={averageAdvisorScore(leads)} />
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-brand-navy">Newest Intake Leads</h2>
              <p className="mt-1 text-sm text-gray-600">
                Sorted newest first from Supabase.
              </p>
            </div>

            {leads.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-600">
                No intake leads have been submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Lead</th>
                      <th className="px-5 py-3 font-semibold">Journey</th>
                      <th className="px-5 py-3 font-semibold">Score</th>
                      <th className="px-5 py-3 font-semibold">Urgency</th>
                      <th className="px-5 py-3 font-semibold">Submitted</th>
                      <th className="px-5 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="align-top hover:bg-gray-50/80">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-brand-navy">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-gray-600">{lead.email}</p>
                          {lead.phone && <p className="text-gray-500">{lead.phone}</p>}
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {formatJourney(lead.journey)}
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {lead.clientScore ?? "—"}
                          {typeof lead.advisorScore === "number" && (
                            <span className="text-gray-400"> / {lead.advisorScore}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <UrgencyBadge urgency={lead.urgency} />
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="font-semibold text-brand-navy underline decoration-brand-gold underline-offset-4"
                          >
                            Open brief
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-brand-navy">{value}</p>
    </div>
  );
}
