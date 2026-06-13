import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for trusted server-side writes (intake submissions,
// notification logging). Never expose this client or its key to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
