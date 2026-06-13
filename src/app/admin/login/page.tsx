import { login } from "../actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: queryError } = await searchParams;

  async function handleLogin(formData: FormData) {
    "use server";
    const result = await login(formData);
    if (result?.error) {
      const { redirect } = await import("next/navigation");
      redirect(`/admin/login?error=${encodeURIComponent(result.error)}`);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-brand-navy">Advisor Login</h1>
        <p className="mt-1 text-sm text-gray-500">
          Latimore Life &amp; Legacy admin dashboard
        </p>

        <form action={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-navy">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          {queryError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {queryError}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
