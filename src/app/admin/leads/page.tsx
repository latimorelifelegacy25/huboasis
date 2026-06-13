import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-auth";
import { listLeads } from "@/lib/queries";
import { logout } from "../actions";

const URGENCY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

export default async function AdminLeadsPage() {
  await requireAdminUser();

  const leads = await listLeads();

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-brand-navy">Leads</h1>
        <form action={logout}>
          <button className="text-sm text-gray-500 hover:text-brand-navy">
            Sign out
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Journey</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Client Score</th>
              <th className="px-4 py-3">Advisor Score</th>
              <th className="px-4 py-3">Urgency</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="font-medium text-brand-navy hover:underline">
                    {lead.firstName} {lead.lastName}
                  </Link>
                  <div className="text-xs text-gray-500">{lead.email}</div>
                </td>
                <td className="px-4 py-3 capitalize">{lead.journey.replace("_", " ")}</td>
                <td className="px-4 py-3">{lead.state ?? "-"}</td>
                <td className="px-4 py-3">{lead.clientScore ?? "-"}</td>
                <td className="px-4 py-3">{lead.advisorScore ?? "-"}</td>
                <td className="px-4 py-3">
                  {lead.urgency && (
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${URGENCY_STYLES[lead.urgency]}`}>
                      {lead.urgency}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No intakes submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
