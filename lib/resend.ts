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

export async function sendLiveClassRegistrationAlert(opts: {
  fullName: string;
  phone: string;
  batchTitle?: string | null;
  preferredSlot?: string | null;
}) {
  const resend = getClient();
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const to = process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_FROM;
  if (!resend || !to) return { skipped: true as const };
  const submittedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  await resend.emails.send({
    from,
    to,
    subject: `New workshop registration: ${opts.fullName}`,
    html: `<p>New live class registration.</p><ul><li><strong>Name:</strong> ${opts.fullName}</li><li><strong>WhatsApp:</strong> ${opts.phone}</li><li><strong>Batch:</strong> ${opts.batchTitle ?? "Not selected"}</li><li><strong>Slot:</strong> ${opts.preferredSlot ?? "—"}</li><li><strong>Submitted:</strong> ${submittedAt} IST</li></ul><p>— Yummmo Learn</p>`,
  });
  return { skipped: false as const };
}
