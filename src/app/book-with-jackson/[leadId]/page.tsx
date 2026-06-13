import { redirect } from "next/navigation";
import { trackBookingClick } from "@/app/actions/intake";

export default async function BookWithJacksonPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  await trackBookingClick(leadId);

  const bookingUrl = process.env.BOOK_WITH_JACKSON_URL;
  redirect(bookingUrl || "/");
}
