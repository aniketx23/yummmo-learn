export async function postN8nWebhook(
  url: string | undefined,
  payload: Record<string, unknown>
) {
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("n8n webhook failed", e);
  }
}
