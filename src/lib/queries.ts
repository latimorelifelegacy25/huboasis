import { createAdminClient } from "@/lib/supabase/admin";
import { PRIORITY_LABELS, TRACK_LABELS } from "@/lib/scoring";

export interface LeadSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  state: string | null;
  journey: string;
  createdAt: string;
  clientScore: number | null;
  advisorScore: number | null;
  urgency: "low" | "medium" | "high" | null;
}

export interface LeadDetail extends LeadSummary {
  profile: {
    maritalStatus: string | null;
    spouseName: string | null;
    ageRange: string | null;
    smoker: boolean | null;
    hasChildren: boolean | null;
    childrenAges: string | null;
    occupation: string | null;
    familyNotes: string | null;
    recreationNotes: string | null;
    motivationNotes: string | null;
  } | null;
  financial: Record<string, unknown> | null;
  priorities: { priority: string; label: string; importanceRank: number | null; whyImportant: string | null }[];
  dime: {
    debt: number;
    annualIncome: number;
    incomeMultiplier: number;
    mortgageBalance: number;
    educationGoal: number;
    currentCoverage: number;
    calculatedNeed: number;
    coverageGap: number;
  } | null;
  recommendedTracks: { id: string; label: string }[];
  summary: string | null;
  bookingClickedAt: string | null;
}

export async function getClientResult(leadId: string) {
  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, first_name, last_name, journey")
    .eq("id", leadId)
    .single();

  const { data: score } = await supabase
    .from("intake_scores")
    .select("client_score, advisor_score, urgency, recommended_tracks")
    .eq("lead_id", leadId)
    .single();

  const { data: priorities } = await supabase
    .from("client_priorities")
    .select("priority, importance_rank")
    .eq("lead_id", leadId)
    .order("importance_rank", { ascending: true });

  if (!lead || !score) return null;

  return {
    firstName: lead.first_name as string,
    lastName: lead.last_name as string,
    journey: lead.journey as string,
    clientScore: score.client_score as number,
    recommendedTracks: ((score.recommended_tracks ?? []) as string[]).map((t) => ({
      id: t,
      label: TRACK_LABELS[t] ?? t,
    })),
    priorities: ((priorities ?? []) as { priority: string }[]).map((p) => ({
      id: p.priority,
      label: PRIORITY_LABELS[p.priority] ?? p.priority,
    })),
  };
}

export async function getAdvisorSummary(leadId: string): Promise<LeadDetail | null> {
  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (!lead) return null;

  const [{ data: profile }, { data: financial }, { data: priorities }, { data: dime }, { data: score }, { data: booking }] =
    await Promise.all([
      supabase.from("intake_profiles").select("*").eq("lead_id", leadId).maybeSingle(),
      supabase.from("financial_intake").select("*").eq("lead_id", leadId).maybeSingle(),
      supabase
        .from("client_priorities")
        .select("priority, importance_rank, why_important")
        .eq("lead_id", leadId)
        .order("importance_rank", { ascending: true }),
      supabase.from("dime_calculations").select("*").eq("lead_id", leadId).maybeSingle(),
      supabase.from("intake_scores").select("*").eq("lead_id", leadId).maybeSingle(),
      supabase.from("booking_events").select("clicked_at").eq("lead_id", leadId).maybeSingle(),
    ]);

  return {
    id: lead.id,
    firstName: lead.first_name,
    lastName: lead.last_name,
    email: lead.email,
    phone: lead.phone,
    state: lead.state,
    journey: lead.journey,
    createdAt: lead.created_at,
    clientScore: score?.client_score ?? null,
    advisorScore: score?.advisor_score ?? null,
    urgency: score?.urgency ?? null,
    profile: profile
      ? {
          maritalStatus: profile.marital_status,
          spouseName: profile.spouse_name,
          ageRange: profile.age_range,
          smoker: profile.smoker,
          hasChildren: profile.has_children,
          childrenAges: profile.children_ages,
          occupation: profile.occupation,
          familyNotes: profile.family_notes,
          recreationNotes: profile.recreation_notes,
          motivationNotes: profile.motivation_notes,
        }
      : null,
    financial: financial ?? null,
    priorities: (priorities ?? []).map((p) => ({
      priority: p.priority,
      label: PRIORITY_LABELS[p.priority] ?? p.priority,
      importanceRank: p.importance_rank,
      whyImportant: p.why_important,
    })),
    dime: dime
      ? {
          debt: Number(dime.debt),
          annualIncome: Number(dime.annual_income),
          incomeMultiplier: Number(dime.income_multiplier),
          mortgageBalance: Number(dime.mortgage_balance),
          educationGoal: Number(dime.education_goal),
          currentCoverage: Number(dime.current_coverage),
          calculatedNeed: Number(dime.calculated_need),
          coverageGap: Number(dime.coverage_gap),
        }
      : null,
    recommendedTracks: ((score?.recommended_tracks ?? []) as string[]).map((t) => ({
      id: t,
      label: TRACK_LABELS[t] ?? t,
    })),
    summary: score?.summary ?? null,
    bookingClickedAt: booking?.clicked_at ?? null,
  };
}

export async function listLeads(): Promise<LeadSummary[]> {
  const supabase = createAdminClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, phone, state, journey, created_at")
    .order("created_at", { ascending: false });

  if (!leads) return [];

  const { data: scores } = await supabase
    .from("intake_scores")
    .select("lead_id, client_score, advisor_score, urgency");

  const scoreMap = new Map((scores ?? []).map((s) => [s.lead_id, s]));

  return leads.map((lead) => {
    const score = scoreMap.get(lead.id);
    return {
      id: lead.id,
      firstName: lead.first_name,
      lastName: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      state: lead.state,
      journey: lead.journey,
      createdAt: lead.created_at,
      clientScore: score?.client_score ?? null,
      advisorScore: score?.advisor_score ?? null,
      urgency: score?.urgency ?? null,
    };
  });
}
