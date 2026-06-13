"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateAdvisorScore,
  calculateClientScore,
  calculateDimeGap,
} from "@/lib/scoring";
import { buildAdvisorAlertPayload, sendEmailAlert, sendGoogleChatAlert } from "@/lib/notifications";
import type { IntakeFormData } from "@/lib/types";

const PRIORITY_VALUES = new Set([
  "tax_advantage",
  "asset_protection",
  "college_funding",
  "debt_management",
  "infinite_banking",
  "life_insurance",
  "estate_planning",
  "indexed_growth",
  "mortgage_protection",
  "business_owner_strategies",
]);

function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export interface SubmitIntakeResult {
  success: boolean;
  leadId?: string;
  error?: string;
}

export async function submitIntake(
  data: IntakeFormData
): Promise<SubmitIntakeResult> {
  if (!data.journey) {
    return { success: false, error: "Please choose a journey." };
  }
  if (!data.firstName || !data.lastName || !data.email) {
    return { success: false, error: "Name and email are required." };
  }

  const supabase = createAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone || null,
      state: data.state || null,
      journey: data.journey,
    })
    .select("id")
    .single();

  if (leadError || !lead) {
    return { success: false, error: leadError?.message ?? "Could not create lead." };
  }

  const leadId: string = lead.id;

  await supabase.from("intake_profiles").insert({
    lead_id: leadId,
    marital_status: data.maritalStatus || null,
    spouse_name: data.spouseName || null,
    age_range: data.ageRange || null,
    smoker: data.smoker,
    has_children: data.hasChildren,
    children_ages: data.childrenAges || null,
    occupation: data.occupation || null,
    family_notes: data.familyNotes || null,
    recreation_notes: data.recreationNotes || null,
    motivation_notes: data.motivationNotes || null,
  });

  const monthlyIncome = toNumber(data.monthlyIncome);
  const annualIncome = monthlyIncome * 12;
  const emergencyFundMonths = toNumber(data.emergencyFundMonths);
  const minMonthlySavings = toNumber(data.minMonthlySavings);
  const maxMonthlySavings = toNumber(data.maxMonthlySavings);
  const coverageAmount = toNumber(data.coverageAmount);

  await supabase.from("financial_intake").insert({
    lead_id: leadId,
    monthly_income: monthlyIncome || null,
    monthly_expenses: toNumber(data.monthlyExpenses) || null,
    emergency_fund: toNumber(data.emergencyFund) || null,
    market_assets: toNumber(data.marketAssets) || null,

    has_employer_retirement: data.hasEmployerRetirement,
    retirement_plan_types: data.retirementPlanTypes,
    retirement_balance: toNumber(data.retirementBalance) || null,
    retirement_contribution: toNumber(data.retirementContribution) || null,
    contribution_frequency: data.contributionFrequency,
    has_company_match: data.hasCompanyMatch,
    company_match_details: data.companyMatchDetails || null,
    has_outside_retirement: data.hasOutsideRetirement,

    has_life_insurance: data.hasLifeInsurance,
    life_insurance_source: data.lifeInsuranceSource,
    coverage_amount: coverageAmount || null,
    premium_amount: toNumber(data.premiumAmount) || null,
    premium_frequency: data.premiumFrequency,
    policy_type: data.policyType,
    has_living_benefits: data.hasLivingBenefits,
    has_ltc: data.hasLtc,

    tax_status: data.taxStatus,
    tax_amount: toNumber(data.taxAmount) || null,

    min_monthly_savings: minMonthlySavings || null,
    max_monthly_savings: maxMonthlySavings || null,

    has_children: data.hasChildren,
    children_ages: data.childrenAges || null,
    saving_for_children: data.savingForChildren,
    additional_income_interest: data.additionalIncomeInterest,
  });

  const validPriorities = data.selectedPriorities.filter((p) =>
    PRIORITY_VALUES.has(p)
  );

  if (validPriorities.length > 0) {
    await supabase.from("client_priorities").insert(
      validPriorities.map((priority, index) => ({
        lead_id: leadId,
        priority,
        importance_rank: index + 1,
        why_important: index === 0 ? data.topPriorityWhy || null : null,
      }))
    );
  }

  const dimeInput = {
    debt: toNumber(data.debt),
    annualIncome,
    mortgageBalance: toNumber(data.mortgageBalance),
    educationGoal: toNumber(data.educationGoal),
    currentCoverage: coverageAmount,
  };
  const dime = calculateDimeGap(dimeInput);

  await supabase.from("dime_calculations").insert({
    lead_id: leadId,
    debt: dimeInput.debt,
    annual_income: dimeInput.annualIncome,
    income_multiplier: dime.incomeMultiplier,
    mortgage_balance: dimeInput.mortgageBalance,
    education_goal: dimeInput.educationGoal,
    current_coverage: dimeInput.currentCoverage,
  });

  const scoreInput = {
    hasLifeInsurance: !!data.hasLifeInsurance,
    hasLivingBenefits: !!data.hasLivingBenefits,
    hasLtc: !!data.hasLtc,
    hasChildren: !!data.hasChildren,
    savingForChildren: !!data.savingForChildren,
    hasEmergencyFund: !!data.hasEmergencyFund,
    emergencyFundMonths,
    hasRetirementPlan: !!data.hasEmployerRetirement,
    hasOutsideRetirement: !!data.hasOutsideRetirement,
    monthlySavingsCapacity: maxMonthlySavings || minMonthlySavings,
    coverageGap: dime.coverageGap,
    selectedPriorities: validPriorities,
  };

  const clientScore = calculateClientScore(scoreInput);
  const advisorResult = calculateAdvisorScore(scoreInput);

  await supabase.from("intake_scores").insert({
    lead_id: leadId,
    client_score: clientScore,
    advisor_score: advisorResult.advisorScore,
    urgency: advisorResult.urgency,
    recommended_tracks: advisorResult.tracks,
  });

  await supabase.from("booking_events").insert({
    lead_id: leadId,
    booking_url: process.env.BOOK_WITH_JACKSON_URL ?? "",
  });

  const alertPayload = buildAdvisorAlertPayload({
    leadId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || null,
    state: data.state || null,
    clientScore,
    advisorScore: advisorResult.advisorScore,
    urgency: advisorResult.urgency,
    priorities: validPriorities,
    coverageGap: dime.coverageGap,
    minMonthlySavings,
    maxMonthlySavings,
    recommendedTracks: advisorResult.tracks,
  });

  await sendAlert(supabase, leadId, "email", () => sendEmailAlert(alertPayload), alertPayload);
  await sendAlert(supabase, leadId, "google_chat", () => sendGoogleChatAlert(alertPayload), alertPayload);

  return { success: true, leadId };
}

async function sendAlert(
  supabase: ReturnType<typeof createAdminClient>,
  leadId: string,
  channel: "email" | "google_chat",
  send: () => Promise<unknown>,
  payload: unknown
) {
  try {
    await send();
    await supabase.from("notifications").insert({
      lead_id: leadId,
      channel,
      status: "sent",
      payload: payload as object,
    });
  } catch (err) {
    await supabase.from("notifications").insert({
      lead_id: leadId,
      channel,
      status: "failed",
      payload: payload as object,
      error_message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function trackBookingClick(leadId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("booking_events")
    .update({ clicked_at: new Date().toISOString() })
    .eq("lead_id", leadId)
    .is("clicked_at", null);
}
