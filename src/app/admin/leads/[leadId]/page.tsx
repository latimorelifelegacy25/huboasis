import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdvisorSummary } from "@/lib/queries";

function fmtCurrency(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `$${n.toLocaleString()}`;
}

function fmtBool(value: unknown): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "-";
}

const URGENCY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

export default async function AdvisorSummaryPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect("/admin/login");
  }

  const { leadId } = await params;
  const lead = await getAdvisorSummary(leadId);

  if (!lead) {
    notFound();
  }

  const financial = lead.financial ?? {};

  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8">
      <Link href="/admin/leads" className="text-sm text-gray-500 hover:text-brand-navy">
        &larr; Back to leads
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-navy">
            {lead.firstName} {lead.lastName}
          </h1>
          <p className="text-sm text-gray-500">
            {lead.email} {lead.phone ? `· ${lead.phone}` : ""} {lead.state ? `· ${lead.state}` : ""}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Journey: {lead.journey.replace("_", " ")} · Submitted{" "}
            {new Date(lead.createdAt).toLocaleString()}
          </p>
        </div>
        {lead.urgency && (
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${URGENCY_STYLES[lead.urgency]}`}>
            {lead.urgency.toUpperCase()} urgency
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500">Client Score</p>
          <p className="text-3xl font-bold text-brand-navy">{lead.clientScore ?? "-"}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500">Advisor Score</p>
          <p className="text-3xl font-bold text-brand-navy">{lead.advisorScore ?? "-"}</p>
        </div>
      </div>

      {lead.recommendedTracks.length > 0 && (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-brand-navy">Recommended Review Tracks</h2>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {lead.recommendedTracks.map((t) => (
              <li key={t.id}>&bull; {t.label}</li>
            ))}
          </ul>
        </section>
      )}

      {lead.priorities.length > 0 && (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-brand-navy">Client Priorities</h2>
          <ol className="mt-2 space-y-1 text-sm text-gray-700 list-decimal list-inside">
            {lead.priorities.map((p) => (
              <li key={p.priority}>
                {p.label}
                {p.whyImportant && <span className="text-gray-500"> &mdash; &ldquo;{p.whyImportant}&rdquo;</span>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {lead.profile && (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-brand-navy">F.O.R.M. / Profile</h2>
          <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <DL label="Marital status" value={lead.profile.maritalStatus} />
            <DL label="Spouse/partner" value={lead.profile.spouseName} />
            <DL label="Age range" value={lead.profile.ageRange} />
            <DL label="Smoker" value={fmtBool(lead.profile.smoker)} />
            <DL label="Has children" value={fmtBool(lead.profile.hasChildren)} />
            <DL label="Children ages" value={lead.profile.childrenAges} />
            <DL label="Occupation" value={lead.profile.occupation} />
          </dl>
          {lead.profile.familyNotes && <Note label="Family" text={lead.profile.familyNotes} />}
          {lead.profile.recreationNotes && <Note label="Recreation" text={lead.profile.recreationNotes} />}
          {lead.profile.motivationNotes && <Note label="Motivation" text={lead.profile.motivationNotes} />}
        </section>
      )}

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-brand-navy">Financial Snapshot</h2>
        <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <DL label="Monthly income" value={fmtCurrency(financial.monthly_income)} />
          <DL label="Monthly expenses" value={fmtCurrency(financial.monthly_expenses)} />
          <DL label="Emergency fund" value={fmtCurrency(financial.emergency_fund)} />
          <DL label="Market assets" value={fmtCurrency(financial.market_assets)} />
          <DL label="Savings capacity" value={`${fmtCurrency(financial.min_monthly_savings)} - ${fmtCurrency(financial.max_monthly_savings)}`} />
          <DL label="Employer retirement plan" value={fmtBool(financial.has_employer_retirement)} />
          <DL label="Outside retirement accounts" value={fmtBool(financial.has_outside_retirement)} />
          <DL label="Retirement balance" value={fmtCurrency(financial.retirement_balance)} />
          <DL label="Life insurance" value={fmtBool(financial.has_life_insurance)} />
          <DL label="Coverage amount" value={fmtCurrency(financial.coverage_amount)} />
          <DL label="Living benefits" value={fmtBool(financial.has_living_benefits)} />
          <DL label="LTC" value={fmtBool(financial.has_ltc)} />
          <DL label="Saving for children" value={fmtBool(financial.saving_for_children)} />
          <DL label="Additional income interest" value={fmtBool(financial.additional_income_interest)} />
        </dl>
      </section>

      {lead.dime && (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-brand-navy">DIME Protection Gap</h2>
          <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <DL label="Debt" value={fmtCurrency(lead.dime.debt)} />
            <DL label="Annual income" value={fmtCurrency(lead.dime.annualIncome)} />
            <DL label="Income multiplier" value={`${lead.dime.incomeMultiplier}x`} />
            <DL label="Mortgage balance" value={fmtCurrency(lead.dime.mortgageBalance)} />
            <DL label="Education goal" value={fmtCurrency(lead.dime.educationGoal)} />
            <DL label="Current coverage" value={fmtCurrency(lead.dime.currentCoverage)} />
            <DL label="Calculated need" value={fmtCurrency(lead.dime.calculatedNeed)} />
            <DL label="Coverage gap" value={fmtCurrency(lead.dime.coverageGap)} />
          </dl>
        </section>
      )}

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-brand-navy">Booking</h2>
        <p className="mt-2 text-sm text-gray-700">
          {lead.bookingClickedAt
            ? `Clicked "Book With Jackson" on ${new Date(lead.bookingClickedAt).toLocaleString()}`
            : "Has not clicked \"Book With Jackson\" yet."}
        </p>
      </section>
    </main>
  );
}

function DL({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-1">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-brand-navy">{value || "-"}</dd>
    </div>
  );
}

function Note({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}
