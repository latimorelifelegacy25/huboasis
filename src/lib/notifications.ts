import { Resend } from "resend";
import { PRIORITY_LABELS, TRACK_LABELS } from "./scoring";

export interface AdvisorAlertPayload {
  leadId: string;
  title: string;
  client: string;
  phone: string | null;
  email: string;
  state: string | null;
  clientScore: number;
  advisorScore: number;
  urgency: "low" | "medium" | "high";
  topPriorities: string[];
  coverageGap: number;
  monthlySavingsRange: string;
  recommendedTracks: string[];
  bookingCta: string;
  bookingUrl: string;
}

export function buildAdvisorAlertPayload(input: {
  leadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  state: string | null;
  clientScore: number;
  advisorScore: number;
  urgency: "low" | "medium" | "high";
  priorities: string[];
  coverageGap: number;
  minMonthlySavings: number | null;
  maxMonthlySavings: number | null;
  recommendedTracks: string[];
}): AdvisorAlertPayload {
  const min = input.minMonthlySavings ?? 0;
  const max = input.maxMonthlySavings ?? 0;

  return {
    leadId: input.leadId,
    title: "New Protection & Legacy Intake",
    client: `${input.firstName} ${input.lastName}`.trim(),
    phone: input.phone,
    email: input.email,
    state: input.state,
    clientScore: input.clientScore,
    advisorScore: input.advisorScore,
    urgency: input.urgency,
    topPriorities: input.priorities
      .slice(0, 3)
      .map((p) => PRIORITY_LABELS[p] ?? p),
    coverageGap: input.coverageGap,
    monthlySavingsRange: `$${min} - $${max}`,
    recommendedTracks: input.recommendedTracks,
    bookingCta: "Book With Jackson",
    bookingUrl: process.env.BOOK_WITH_JACKSON_URL ?? "",
  };
}

export async function sendEmailAlert(payload: AdvisorAlertPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADVISOR_ALERT_EMAIL;
  const from = process.env.ADVISOR_ALERT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    throw new Error("Email alert is not configured (missing Resend env vars)");
  }

  const resend = new Resend(apiKey);

  const trackLines = payload.recommendedTracks
    .map((t) => `<li>${TRACK_LABELS[t] ?? t}</li>`)
    .join("");

  const html = `
    <h2>${payload.title}</h2>
    <p><strong>Client:</strong> ${payload.client}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Phone:</strong> ${payload.phone ?? "N/A"}</p>
    <p><strong>State:</strong> ${payload.state ?? "N/A"}</p>
    <p><strong>Protection & Legacy Score:</strong> ${payload.clientScore}/100</p>
    <p><strong>Advisor Score:</strong> ${payload.advisorScore}/100</p>
    <p><strong>Urgency:</strong> ${payload.urgency.toUpperCase()}</p>
    <p><strong>Top Priorities:</strong> ${payload.topPriorities.join(", ")}</p>
    <p><strong>Coverage Gap:</strong> $${payload.coverageGap.toLocaleString()}</p>
    <p><strong>Monthly Savings Capacity:</strong> ${payload.monthlySavingsRange}</p>
    <p><strong>Recommended Review Tracks:</strong></p>
    <ul>${trackLines}</ul>
    <p><a href="${payload.bookingUrl}">${payload.bookingCta}</a></p>
  `;

  return resend.emails.send({
    from,
    to,
    subject: `${payload.title}: ${payload.client} (${payload.urgency.toUpperCase()})`,
    html,
  });
}

export async function sendGoogleChatAlert(payload: AdvisorAlertPayload) {
  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Google Chat alert is not configured (missing webhook URL)");
  }

  const tracks = payload.recommendedTracks
    .map((t) => `• ${TRACK_LABELS[t] ?? t}`)
    .join("\n");

  const text =
    `*${payload.title}*\n` +
    `*Client:* ${payload.client}\n` +
    `*Email:* ${payload.email}\n` +
    `*Phone:* ${payload.phone ?? "N/A"}\n` +
    `*State:* ${payload.state ?? "N/A"}\n` +
    `*Protection & Legacy Score:* ${payload.clientScore}/100\n` +
    `*Advisor Score:* ${payload.advisorScore}/100\n` +
    `*Urgency:* ${payload.urgency.toUpperCase()}\n` +
    `*Top Priorities:* ${payload.topPriorities.join(", ")}\n` +
    `*Coverage Gap:* $${payload.coverageGap.toLocaleString()}\n` +
    `*Monthly Savings Capacity:* ${payload.monthlySavingsRange}\n` +
    `*Recommended Review Tracks:*\n${tracks}\n` +
    `${payload.bookingCta}: ${payload.bookingUrl}`;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Google Chat webhook responded with ${response.status}`);
  }

  return response;
}
