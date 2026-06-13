import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-brand-navy/10 bg-brand-navy text-brand-cream">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex flex-col">
          <span className="text-lg font-semibold tracking-wide">
            Latimore Life &amp; Legacy
          </span>
          <span className="text-xs text-brand-gold">
            Protecting Today. Securing Tomorrow.
          </span>
        </Link>
      </div>
    </header>
  );
}
