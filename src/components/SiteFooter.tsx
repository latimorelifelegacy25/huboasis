import { Disclaimer } from "./Disclaimer";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-2">
        <Disclaimer />
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Latimore Life &amp; Legacy LLC. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
}
