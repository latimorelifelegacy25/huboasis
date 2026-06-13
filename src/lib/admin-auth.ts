import { notFound, redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_ADMIN_EMAILS = ["jackson1989@latimorelegacy.com"];

export function getAdminEmails() {
  const configuredEmails = process.env.ADMIN_EMAILS?.split(",") ?? [];

  const emails = configuredEmails
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return emails.length > 0 ? emails : DEFAULT_ADMIN_EMAILS;
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function requireAdminUser(): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (error || !user) {
    redirect("/admin/login");
  }

  if (!isAdminEmail(user.email)) {
    await supabase.auth.signOut();
    notFound();
  }

  return user;
}
