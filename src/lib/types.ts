export type Journey = "client" | "business_partner" | "both";

export type ContributionFrequency = "per_check" | "monthly" | "annual";
export type LifeInsuranceSource = "work" | "outside_work" | "both" | "none";
export type PremiumFrequency = "monthly" | "annual";
export type PolicyType = "term" | "permanent" | "unknown";
export type TaxStatus = "refund" | "owe" | "break_even" | "unknown";

export type Priority =
  | "tax_advantage"
  | "asset_protection"
  | "college_funding"
  | "debt_management"
  | "infinite_banking"
  | "life_insurance"
  | "estate_planning"
  | "indexed_growth"
  | "mortgage_protection"
  | "business_owner_strategies";

export interface IntakeFormData {
  // Step: Journey
  journey: Journey | null;

  // Step: Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;

  // Step: F.O.R.M. Trust Builder
  familyNotes: string;
  occupation: string;
  recreationNotes: string;
  motivationNotes: string;
  maritalStatus: string;
  spouseName: string;
  ageRange: string;
  smoker: boolean | null;
  hasChildren: boolean | null;
  childrenAges: string;

  // Step: Opening / PFR questions
  hasEmployerRetirement: boolean | null;
  retirementPlanTypes: string[];
  retirementBalance: string;
  retirementContribution: string;
  contributionFrequency: ContributionFrequency | null;
  hasCompanyMatch: boolean | null;
  companyMatchDetails: string;
  hasOutsideRetirement: boolean | null;

  hasLifeInsurance: boolean | null;
  lifeInsuranceSource: LifeInsuranceSource | null;
  coverageAmount: string;
  premiumAmount: string;
  premiumFrequency: PremiumFrequency | null;
  policyType: PolicyType | null;
  hasLivingBenefits: boolean | null;
  hasLtc: boolean | null;

  savingForChildren: boolean | null;
  additionalIncomeInterest: boolean | null;

  // Step: Client priorities
  selectedPriorities: Priority[];
  topPriorityWhy: string;

  // Step: Monthly numbers
  monthlyIncome: string;
  monthlyExpenses: string;
  taxStatus: TaxStatus | null;
  taxAmount: string;
  minMonthlySavings: string;
  maxMonthlySavings: string;

  // Step: Assets & coverage
  hasEmergencyFund: boolean | null;
  emergencyFundMonths: string;
  emergencyFund: string;
  marketAssets: string;

  // Step: DIME gap
  debt: string;
  mortgageBalance: string;
  educationGoal: string;
}

export const initialIntakeFormData: IntakeFormData = {
  journey: null,

  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  state: "",

  familyNotes: "",
  occupation: "",
  recreationNotes: "",
  motivationNotes: "",
  maritalStatus: "",
  spouseName: "",
  ageRange: "",
  smoker: null,
  hasChildren: null,
  childrenAges: "",

  hasEmployerRetirement: null,
  retirementPlanTypes: [],
  retirementBalance: "",
  retirementContribution: "",
  contributionFrequency: null,
  hasCompanyMatch: null,
  companyMatchDetails: "",
  hasOutsideRetirement: null,

  hasLifeInsurance: null,
  lifeInsuranceSource: null,
  coverageAmount: "",
  premiumAmount: "",
  premiumFrequency: null,
  policyType: null,
  hasLivingBenefits: null,
  hasLtc: null,

  savingForChildren: null,
  additionalIncomeInterest: null,

  selectedPriorities: [],
  topPriorityWhy: "",

  monthlyIncome: "",
  monthlyExpenses: "",
  taxStatus: null,
  taxAmount: "",
  minMonthlySavings: "",
  maxMonthlySavings: "",

  hasEmergencyFund: null,
  emergencyFundMonths: "",
  emergencyFund: "",
  marketAssets: "",

  debt: "",
  mortgageBalance: "",
  educationGoal: "",
};
