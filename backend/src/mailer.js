import nodemailer from "nodemailer";

function transport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

export async function sendPriceDropEmail({ to, product, price, target }) {
  const from = process.env.SMTP_FROM || "Dropwatch <alerts@localhost>";
  const subject = `Price drop: ${product.name} is now $${price.toFixed(2)}`;
  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;background:#0d0d0f;color:#f5f5f5;padding:24px">
      <h2 style="color:#00d97e;margin:0 0 8px">Price dropped</h2>
      <p style="color:#a1a1aa">${product.name}</p>
      <p>Current price: <strong>$${price.toFixed(2)}</strong> (your target: $${Number(target).toFixed(2)})</p>
      <p><a href="${product.source_url}" style="color:#4f8cff">View product</a></p>
    </div>
  `;
  const mailer = transport();
  if (!mailer) {
    console.log(`[email:dry-run] to=${to} subject=${subject}`);
    return;
  }
  await mailer.sendMail({ from, to, subject, html });
}
