import { Resend } from "resend";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendPurchaseConfirmation(opts: {
  to: string;
  courseTitle: string;
  amount: number;
}) {
  const resend = getClient();
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  if (!resend) return { skipped: true as const };
  await resend.emails.send({
    from,
    to: opts.to,
    subject: `Enrollment confirmed: ${opts.courseTitle}`,
    html: `<p>Namaste,</p><p>Your enrollment in <strong>${opts.courseTitle}</strong> is confirmed. Amount paid: ₹${opts.amount}.</p><p>Happy healthy cooking!</p><p>— Yummmo Learn</p>`,
  });
  return { skipped: false as const };
}
