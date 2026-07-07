import { redirect } from "next/navigation";

/* The old simulated-confirmation page. The booking checklist at /checkout
 * now carries booked/unbooked progress, so this route just forwards. */
export default function ConfirmationPage() {
  redirect("/checkout");
}
