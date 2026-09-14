import nodemailer from "nodemailer";

function transport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST;
  if (!host && !user) return null;
  if ((host || "").includes("gmail.com") || (!host && user?.endsWith("@gmail.com"))) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: user && pass ? { user, pass } : undefined,
    });
  }
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    auth: user && pass ? { user, pass } : undefined,
  });
}

export async function sendPriceDropEmail({ to, product, price, target }) {
  const { formatMoney } = await import("./fx.js");
  const current = formatMoney(price, product.currency);
  const goal = formatMoney(target, product.currency);
  const from = process.env.SMTP_FROM || "Dropwatch <alerts@localhost>";
  const subject = `Price drop: ${product.name} is now ${current}`;
  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;background:#0d0d0f;color:#f5f5f5;padding:24px">
      <h2 style="color:#00d97e;margin:0 0 8px">Price dropped</h2>
      <p style="color:#a1a1aa">${product.name}</p>
      <p>Current price: <strong>${current}</strong> (your target: ${goal})</p>
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
