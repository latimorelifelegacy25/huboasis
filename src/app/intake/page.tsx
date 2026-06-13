import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { IntakeForm } from "./IntakeForm";

export default function IntakePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[var(--background)]">
        <IntakeForm />
      </main>
      <SiteFooter />
    </>
  );
}
