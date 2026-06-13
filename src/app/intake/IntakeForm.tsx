"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/intake/ProgressBar";
import {
  Field,
  TextInput,
  TextArea,
  YesNo,
  SelectField,
  MultiSelectGrid,
} from "@/components/intake/fields";
import { Disclaimer } from "@/components/Disclaimer";
import { initialIntakeFormData, type IntakeFormData, type Journey, type Priority } from "@/lib/types";
import { submitIntake } from "@/app/actions/intake";

const TOTAL_STEPS = 9;

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "tax_advantage", label: "Tax Advantage Strategies" },
  { value: "asset_protection", label: "Asset Protection" },
  { value: "college_funding", label: "College Funding" },
  { value: "debt_management", label: "Debt Management" },
  { value: "infinite_banking", label: "Infinite Banking" },
  { value: "life_insurance", label: "Life Insurance" },
  { value: "estate_planning", label: "Estate Planning" },
  { value: "indexed_growth", label: "Indexed Growth Strategies" },
  { value: "mortgage_protection", label: "Mortgage Protection" },
  { value: "business_owner_strategies", label: "Business Owner Strategies" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
].map((s) => ({ value: s, label: s }));

const RETIREMENT_PLAN_OPTIONS = [
  { value: "401k", label: "401(k)" },
  { value: "403b", label: "403(b)" },
  { value: "pension", label: "Pension" },
  { value: "tsp", label: "TSP" },
  { value: "other", label: "Other" },
];

export function IntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntakeFormData>(initialIntakeFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setError(null);
    if (step === 2 && !data.journey) {
      setError("Please choose a journey to continue.");
      return;
    }
    if (step === 3 && (!data.firstName || !data.lastName || !data.email)) {
      setError("Please share your name and email so Jackson can reach you.");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await submitIntake(data);
    setSubmitting(false);
    if (result.success && result.leadId) {
      router.push(`/intake/results/${result.leadId}`);
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ProgressBar step={step} total={TOTAL_STEPS} />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {step === 1 && <WelcomeStep />}
        {step === 2 && <JourneyStep value={data.journey} onChange={(v) => update("journey", v)} />}
        {step === 3 && <ContactStep data={data} update={update} />}
        {step === 4 && <TrustBuilderStep data={data} update={update} />}
        {step === 5 && <OpeningQuestionsStep data={data} update={update} />}
        {step === 6 && <PrioritiesStep data={data} update={update} />}
        {step === 7 && <MonthlyNumbersStep data={data} update={update} />}
        {step === 8 && <AssetsCoverageStep data={data} update={update} />}
        {step === 9 && <DimeGapStep data={data} update={update} />}

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-brand-gold"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              className="rounded-md bg-brand-navy px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-brand-gold px-5 py-2 text-sm font-semibold text-brand-navy hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "See My Results"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-brand-navy">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}

function WelcomeStep() {
  return (
    <div>
      <StepHeading
        title="Welcome to Latimore Life & Legacy"
        subtitle="Protecting Today. Securing Tomorrow."
      />
      <p className="text-sm text-gray-700">
        This short guided intake helps Jackson get to know you, understand
        your priorities, and prepare for a focused conversation. There are no
        wrong answers &mdash; just share what feels true for you and your
        family today.
      </p>
      <p className="mt-3 text-sm text-gray-700">
        At the end, you&rsquo;ll see a personalized Protection &amp; Legacy
        Score and have the option to book time with Jackson.
      </p>
    </div>
  );
}

function JourneyStep({
  value,
  onChange,
}: {
  value: Journey | null;
  onChange: (value: Journey) => void;
}) {
  const options: { value: Journey; label: string; description: string }[] = [
    {
      value: "client",
      label: "I'm exploring my personal protection & legacy plan",
      description: "Family, retirement, insurance, and savings priorities.",
    },
    {
      value: "business_partner",
      label: "I'm interested in a business partnership opportunity",
      description: "Learn more about working with Jackson professionally.",
    },
    {
      value: "both",
      label: "Both",
      description: "I'd like to explore my own plan and a partnership.",
    },
  ];

  return (
    <div>
      <StepHeading title="Which best describes you today?" />
      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`block w-full rounded-md border p-4 text-left transition ${
              value === opt.value
                ? "border-brand-gold bg-brand-gold/20"
                : "border-gray-300 hover:border-brand-gold"
            }`}
          >
            <span className="block text-sm font-semibold text-brand-navy">
              {opt.label}
            </span>
            <span className="block text-xs text-gray-600">{opt.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ContactStep({
  data,
  update,
}: {
  data: IntakeFormData;
  update: <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading title="A few details so Jackson can follow up" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name">
          <TextInput value={data.firstName} onChange={(v) => update("firstName", v)} required />
        </Field>
        <Field label="Last name">
          <TextInput value={data.lastName} onChange={(v) => update("lastName", v)} required />
        </Field>
      </div>
      <Field label="Email">
        <TextInput type="email" value={data.email} onChange={(v) => update("email", v)} required />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Phone">
          <TextInput type="tel" value={data.phone} onChange={(v) => update("phone", v)} />
        </Field>
        <Field label="State">
          <SelectField value={data.state || null} onChange={(v) => update("state", v)} options={US_STATES} />
        </Field>
      </div>
    </div>
  );
}

function TrustBuilderStep({
  data,
  update,
}: {
  data: IntakeFormData;
  update: <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading
        title="Tell us a little about your life"
        subtitle="Family, occupation, recreation, and what motivates you (F.O.R.M.)"
      />
      <Field label="Family" hint="Marital status, children, who's important to you">
        <TextArea
          value={data.familyNotes}
          onChange={(v) => update("familyNotes", v)}
          placeholder="e.g. Married with two kids, ages 6 and 9"
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Marital status">
          <SelectField
            value={data.maritalStatus || null}
            onChange={(v) => update("maritalStatus", v)}
            options={[
              { value: "single", label: "Single" },
              { value: "married", label: "Married" },
              { value: "divorced", label: "Divorced" },
              { value: "widowed", label: "Widowed" },
            ]}
          />
        </Field>
        <Field label="Spouse/partner name (optional)">
          <TextInput value={data.spouseName} onChange={(v) => update("spouseName", v)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Age range">
          <SelectField
            value={data.ageRange || null}
            onChange={(v) => update("ageRange", v)}
            options={[
              { value: "18-25", label: "18-25" },
              { value: "26-35", label: "26-35" },
              { value: "36-45", label: "36-45" },
              { value: "46-55", label: "46-55" },
              { value: "56-65", label: "56-65" },
              { value: "66+", label: "66+" },
            ]}
          />
        </Field>
        <Field label="Do you use tobacco products?">
          <YesNo value={data.smoker} onChange={(v) => update("smoker", v)} />
        </Field>
      </div>
      <Field label="Occupation">
        <TextInput value={data.occupation} onChange={(v) => update("occupation", v)} />
      </Field>
      <Field label="Recreation" hint="What do you enjoy doing in your free time?">
        <TextArea value={data.recreationNotes} onChange={(v) => update("recreationNotes", v)} />
      </Field>
      <Field label="Motivation" hint="What's most important to you when it comes to your finances and future?">
        <TextArea value={data.motivationNotes} onChange={(v) => update("motivationNotes", v)} />
      </Field>
      <Field label="Do you have children?">
        <YesNo value={data.hasChildren} onChange={(v) => update("hasChildren", v)} />
      </Field>
      {data.hasChildren && (
        <Field label="Children's ages">
          <TextInput value={data.childrenAges} onChange={(v) => update("childrenAges", v)} placeholder="e.g. 6, 9, 14" />
        </Field>
      )}
    </div>
  );
}

function OpeningQuestionsStep({
  data,
  update,
}: {
  data: IntakeFormData;
  update: <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <StepHeading title="Retirement, protection, and income" />

      <Field label="Do you have an employer-sponsored retirement plan?">
        <YesNo value={data.hasEmployerRetirement} onChange={(v) => update("hasEmployerRetirement", v)} />
      </Field>
      {data.hasEmployerRetirement && (
        <>
          <Field label="What type of plan(s)?">
            <MultiSelectGrid
              values={data.retirementPlanTypes}
              onChange={(v) => update("retirementPlanTypes", v)}
              options={RETIREMENT_PLAN_OPTIONS}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Approximate balance ($)">
              <TextInput type="number" value={data.retirementBalance} onChange={(v) => update("retirementBalance", v)} />
            </Field>
            <Field label="Current contribution ($)">
              <TextInput type="number" value={data.retirementContribution} onChange={(v) => update("retirementContribution", v)} />
            </Field>
          </div>
          <Field label="Contribution frequency">
            <SelectField
              value={data.contributionFrequency}
              onChange={(v) => update("contributionFrequency", v as IntakeFormData["contributionFrequency"])}
              options={[
                { value: "per_check", label: "Per paycheck" },
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annually" },
              ]}
            />
          </Field>
          <Field label="Does your employer match contributions?">
            <YesNo value={data.hasCompanyMatch} onChange={(v) => update("hasCompanyMatch", v)} />
          </Field>
          {data.hasCompanyMatch && (
            <Field label="Match details">
              <TextInput value={data.companyMatchDetails} onChange={(v) => update("companyMatchDetails", v)} placeholder="e.g. 100% up to 4%" />
            </Field>
          )}
        </>
      )}

      <Field label="Do you have any retirement accounts outside of work (IRA, Roth, brokerage)?">
        <YesNo value={data.hasOutsideRetirement} onChange={(v) => update("hasOutsideRetirement", v)} />
      </Field>

      <Field label="Do you currently have life insurance?">
        <YesNo value={data.hasLifeInsurance} onChange={(v) => update("hasLifeInsurance", v)} />
      </Field>
      {data.hasLifeInsurance && (
        <>
          <Field label="Where is your coverage from?">
            <SelectField
              value={data.lifeInsuranceSource}
              onChange={(v) => update("lifeInsuranceSource", v as IntakeFormData["lifeInsuranceSource"])}
              options={[
                { value: "work", label: "Through work" },
                { value: "outside_work", label: "Outside of work" },
                { value: "both", label: "Both" },
              ]}
            />
          </Field>
          <Field label="What type of policy?">
            <SelectField
              value={data.policyType}
              onChange={(v) => update("policyType", v as IntakeFormData["policyType"])}
              options={[
                { value: "term", label: "Term" },
                { value: "permanent", label: "Permanent (whole/universal/indexed)" },
                { value: "unknown", label: "Not sure" },
              ]}
            />
          </Field>
        </>
      )}

      <Field label="Do you have living benefits riders (chronic/critical/terminal illness)?">
        <YesNo value={data.hasLivingBenefits} onChange={(v) => update("hasLivingBenefits", v)} />
      </Field>
      <Field label="Do you have long-term care (LTC) coverage?">
        <YesNo value={data.hasLtc} onChange={(v) => update("hasLtc", v)} />
      </Field>

      {data.hasChildren && (
        <Field label="Are you currently saving toward your children's future (college, etc.)?">
          <YesNo value={data.savingForChildren} onChange={(v) => update("savingForChildren", v)} />
        </Field>
      )}

      <Field label="Would you be interested in learning about strategies for additional income?">
        <YesNo value={data.additionalIncomeInterest} onChange={(v) => update("additionalIncomeInterest", v)} />
      </Field>
    </div>
  );
}

function PrioritiesStep({
  data,
  update,
}: {
  data: IntakeFormData;
  update: <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading
        title="What matters most to you right now?"
        subtitle="Select up to 3, in order of importance. Your first choice helps shape your review."
      />
      <MultiSelectGrid
        values={data.selectedPriorities}
        onChange={(v) => update("selectedPriorities", v as Priority[])}
        options={PRIORITY_OPTIONS}
        max={3}
      />
      {data.selectedPriorities.length > 0 && (
        <Field label={`Why is "${PRIORITY_OPTIONS.find((p) => p.value === data.selectedPriorities[0])?.label}" important to you?`}>
          <TextArea value={data.topPriorityWhy} onChange={(v) => update("topPriorityWhy", v)} />
        </Field>
      )}
    </div>
  );
}

function MonthlyNumbersStep({
  data,
  update,
}: {
  data: IntakeFormData;
  update: <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading title="Your monthly numbers" subtitle="Approximate is fine." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Monthly household income ($)">
          <TextInput type="number" value={data.monthlyIncome} onChange={(v) => update("monthlyIncome", v)} />
        </Field>
        <Field label="Monthly expenses ($)">
          <TextInput type="number" value={data.monthlyExpenses} onChange={(v) => update("monthlyExpenses", v)} />
        </Field>
      </div>
      <Field label="At tax time, do you typically...">
        <SelectField
          value={data.taxStatus}
          onChange={(v) => update("taxStatus", v as IntakeFormData["taxStatus"])}
          options={[
            { value: "refund", label: "Get a refund" },
            { value: "owe", label: "Owe money" },
            { value: "break_even", label: "Break even" },
            { value: "unknown", label: "Not sure" },
          ]}
        />
      </Field>
      {(data.taxStatus === "refund" || data.taxStatus === "owe") && (
        <Field label={`Approximate ${data.taxStatus === "refund" ? "refund" : "amount owed"} ($)`}>
          <TextInput type="number" value={data.taxAmount} onChange={(v) => update("taxAmount", v)} />
        </Field>
      )}
      <div>
        <Field label="If you found extra room in your budget, how much could you comfortably set aside each month?">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-1">
            <TextInput type="number" placeholder="Minimum ($)" value={data.minMonthlySavings} onChange={(v) => update("minMonthlySavings", v)} />
            <TextInput type="number" placeholder="Maximum ($)" value={data.maxMonthlySavings} onChange={(v) => update("maxMonthlySavings", v)} />
          </div>
        </Field>
      </div>
    </div>
  );
}

function AssetsCoverageStep({
  data,
  update,
}: {
  data: IntakeFormData;
  update: <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading title="Savings, assets, and current coverage" />
      <Field label="Do you have an emergency fund?">
        <YesNo value={data.hasEmergencyFund} onChange={(v) => update("hasEmergencyFund", v)} />
      </Field>
      {data.hasEmergencyFund && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="How many months of expenses does it cover?">
            <TextInput type="number" value={data.emergencyFundMonths} onChange={(v) => update("emergencyFundMonths", v)} />
          </Field>
          <Field label="Approximate amount ($)">
            <TextInput type="number" value={data.emergencyFund} onChange={(v) => update("emergencyFund", v)} />
          </Field>
        </div>
      )}
      <Field label="Approximate value of market-based assets (brokerage, crypto, etc.) ($)">
        <TextInput type="number" value={data.marketAssets} onChange={(v) => update("marketAssets", v)} />
      </Field>
      {data.hasLifeInsurance && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Current life insurance coverage amount ($)">
            <TextInput type="number" value={data.coverageAmount} onChange={(v) => update("coverageAmount", v)} />
          </Field>
          <Field label="Premium amount ($)">
            <TextInput type="number" value={data.premiumAmount} onChange={(v) => update("premiumAmount", v)} />
          </Field>
        </div>
      )}
      {data.hasLifeInsurance && (
        <Field label="Premium frequency">
          <SelectField
            value={data.premiumFrequency}
            onChange={(v) => update("premiumFrequency", v as IntakeFormData["premiumFrequency"])}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "annual", label: "Annually" },
            ]}
          />
        </Field>
      )}
    </div>
  );
}

function DimeGapStep({
  data,
  update,
}: {
  data: IntakeFormData;
  update: <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading
        title="Protection gap snapshot"
        subtitle="A few last numbers help us show how your current coverage compares to your family's needs (Debt, Income, Mortgage, Education)."
      />
      <Field label="Total debt (excluding mortgage) ($)">
        <TextInput type="number" value={data.debt} onChange={(v) => update("debt", v)} />
      </Field>
      <Field label="Remaining mortgage balance ($)">
        <TextInput type="number" value={data.mortgageBalance} onChange={(v) => update("mortgageBalance", v)} />
      </Field>
      <Field label="Future education goal for your children ($)">
        <TextInput type="number" value={data.educationGoal} onChange={(v) => update("educationGoal", v)} />
      </Field>
    </div>
  );
}
