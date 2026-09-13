export function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export async function sendWhatsAppMessage(to, text) {
  const token = process.env.WHATSAPP_TOKEN || "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  if (!token || !phoneNumberId || !to) return;
  const version = process.env.WHATSAPP_API_VERSION || "v21.0";
  const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: String(to).replace(/[^\d]/g, ""),
      type: "text",
      text: { body: text, preview_url: true },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("WhatsApp send failed:", res.status, body);
  }
}
