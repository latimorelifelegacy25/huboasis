export type ScoreInput = {
  hasLifeInsurance: boolean;
  hasLivingBenefits: boolean;
  hasLtc: boolean;
  hasChildren: boolean;
  savingForChildren: boolean;
  hasEmergencyFund: boolean;
  emergencyFundMonths: number;
  hasRetirementPlan: boolean;
  hasOutsideRetirement: boolean;
  monthlySavingsCapacity: number;
  coverageGap: number;
  selectedPriorities: string[];
};

export function calculateClientScore(input: ScoreInput): number {
  let score = 0;

  if (input.hasLifeInsurance) score += 12;
  if (input.hasLivingBenefits) score += 8;
  if (input.hasLtc) score += 5;
  if (input.coverageGap <= 0) score += 5;

  if (input.hasEmergencyFund) score += 7;
  if (input.emergencyFundMonths >= 3) score += 8;

  if (input.hasRetirementPlan) score += 8;
  if (input.hasOutsideRetirement) score += 6;
  if (input.monthlySavingsCapacity >= 250) score += 6;

  if (input.hasChildren && input.savingForChildren) score += 8;
  if (input.selectedPriorities.includes("estate_planning")) score += 6;
  if (input.selectedPriorities.includes("college_funding")) score += 6;

  if (input.selectedPriorities.length >= 2) score += 8;
  if (input.selectedPriorities.includes("life_insurance")) score += 4;
  if (input.selectedPriorities.includes("tax_advantage")) score += 3;

  return Math.min(score, 100);
}

export type AdvisorScoreResult = {
  advisorScore: number;
  urgency: "low" | "medium" | "high";
  tracks: string[];
};

export function calculateAdvisorScore(input: ScoreInput): AdvisorScoreResult {
  let score = 0;
  const tracks: string[] = [];

  if (!input.hasLifeInsurance) {
    score += 20;
    tracks.push("life_insurance");
  }

  if (!input.hasLivingBenefits && !input.hasLtc) {
    score += 15;
    tracks.push("living_benefits_ltc");
  }

  if (input.coverageGap > 0) {
    score += 20;
    tracks.push("dime_gap_review");
  }

  if (input.hasChildren && !input.savingForChildren) {
    score += 10;
    tracks.push("college_legacy_planning");
  }

  if (input.monthlySavingsCapacity >= 250) {
    score += 15;
    tracks.push("savings_strategy");
  }

  if (input.selectedPriorities.includes("tax_advantage")) {
    score += 10;
    tracks.push("tax_advantage_education");
  }

  if (input.selectedPriorities.includes("business_owner_strategies")) {
    score += 10;
    tracks.push("business_owner_strategy");
  }

  const advisorScore = Math.min(score, 100);

  return {
    advisorScore,
    urgency:
      advisorScore >= 70 ? "high" : advisorScore >= 40 ? "medium" : "low",
    tracks: [...new Set(tracks)],
  };
}

export function calculateDimeGap(input: {
  debt: number;
  annualIncome: number;
  incomeMultiplier?: number;
  mortgageBalance: number;
  educationGoal: number;
  currentCoverage: number;
}) {
  const incomeMultiplier = input.incomeMultiplier ?? 10;
  const calculatedNeed =
    input.debt +
    input.annualIncome * incomeMultiplier +
    input.mortgageBalance +
    input.educationGoal;
  const coverageGap = Math.max(calculatedNeed - input.currentCoverage, 0);

  return { calculatedNeed, coverageGap, incomeMultiplier };
}

export const PRIORITY_LABELS: Record<string, string> = {
  tax_advantage: "Tax Advantage Strategies",
  asset_protection: "Asset Protection",
  college_funding: "College Funding",
  debt_management: "Debt Management",
  infinite_banking: "Infinite Banking",
  life_insurance: "Life Insurance",
  estate_planning: "Estate Planning",
  indexed_growth: "Indexed Growth Strategies",
  mortgage_protection: "Mortgage Protection",
  business_owner_strategies: "Business Owner Strategies",
};

export const TRACK_LABELS: Record<string, string> = {
  life_insurance: "Life Insurance Review",
  living_benefits_ltc: "Living Benefits & Long-Term Care Review",
  dime_gap_review: "Protection Gap (DIME) Review",
  college_legacy_planning: "College & Legacy Planning",
  savings_strategy: "Savings Strategy Review",
  tax_advantage_education: "Tax-Advantaged Strategy Education",
  business_owner_strategy: "Business Owner Strategy Review",
};
