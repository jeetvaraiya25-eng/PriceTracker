import { db, nowSql } from "./db.js";
import { sendWhatsAppMessage, whatsappConfigured } from "./notify.js";

export function normalizePhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function extractUrl(text = "") {
  const match = String(text).match(/https?:\/\/[^\s<>]+/i);
  return match ? match[0].replace(/[),.;]+$/, "") : null;
}

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function userByPhone(phone) {
  return db.prepare("SELECT * FROM users WHERE whatsapp_phone = ?").get(normalizePhone(phone));
}

async function handleIncoming(phone, text) {
  const body = String(text || "").trim();
  const command = body.toLowerCase().replace(/^\//, "");
  const url = extractUrl(body);

  if (!body || ["hi", "hello", "hey", "start", "help"].includes(command)) {
    await sendWhatsAppMessage(
      phone,
      "Welcome to Dropwatch.\n\nI track product prices and message you when they drop.\n\n• Send connect to link this WhatsApp to your Dropwatch account\n• Then paste any product URL to start tracking"
    );
    return;
  }

  if (command === "connect") {
    const existing = userByPhone(phone);
    if (existing) {
      await sendWhatsAppMessage(
        phone,
        `This WhatsApp is already linked to ${existing.email}. Paste a product URL to track it.`
      );
      return;
    }
    const code = makeCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    db.prepare("DELETE FROM whatsapp_link_codes WHERE phone = ?").run(normalizePhone(phone));
    db.prepare("INSERT INTO whatsapp_link_codes (code, phone, expires_at) VALUES (?, ?, ?)").run(
      code,
      normalizePhone(phone),
      expires
    );
    await sendWhatsAppMessage(
      phone,
      `Your one-time code is:\n\n${code}\n\nEnter it on Dropwatch → Settings → Connect WhatsApp. It expires in 15 minutes.`
    );
    return;
  }

  if (url) {
    const user = userByPhone(phone);
    if (!user) {
      await sendWhatsAppMessage(
        phone,
        "Link your account first: send connect, then enter the code in Dropwatch Settings."
      );
      return;
    }
    await sendWhatsAppMessage(phone, "Looking up that product…");
    try {
      const { addProductFromUrl } = await import("./engine.js");
      const product = await addProductFromUrl(url, user.id);
      await sendWhatsAppMessage(
        phone,
        `Tracking ${product.name}\nCurrent price: $${Number(product.currentPrice).toFixed(2)}\n${product.source_site || ""}`
      );
    } catch (err) {
      await sendWhatsAppMessage(phone, `Could not add that product: ${err.message}`);
    }
    return;
  }

  await sendWhatsAppMessage(phone, "Send a product URL, or send connect to link your account.");
}

function incomingMessages(payload) {
  const messages = [];
  for (const entry of payload?.entry || []) {
    for (const change of entry.changes || []) {
      for (const msg of change.value?.messages || []) {
        if (msg.type === "text" && msg.text?.body) {
          messages.push({ from: msg.from, text: msg.text.body });
        }
      }
    }
  }
  return messages;
}

export function verifyWhatsAppWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send("Forbidden");
}

export async function handleWhatsAppWebhook(req, res) {
  res.status(200).json({ ok: true });
  if (!whatsappConfigured()) return;
  const messages = incomingMessages(req.body);
  for (const msg of messages) {
    try {
      await handleIncoming(msg.from, msg.text);
    } catch (err) {
      console.error("WhatsApp inbound failed:", err.message);
    }
  }
}

export function consumeLinkCode(code) {
  const row = db
    .prepare("SELECT * FROM whatsapp_link_codes WHERE code = ? AND expires_at > ?")
    .get(String(code).trim().toUpperCase(), nowSql());
  if (!row) return null;
  db.prepare("DELETE FROM whatsapp_link_codes WHERE code = ?").run(row.code);
  return row.phone;
}

export function whatsappPublicConfig() {
  const number = process.env.WHATSAPP_DISPLAY_NUMBER || "";
  const digits = normalizePhone(number);
  return {
    enabled: whatsappConfigured(),
    displayNumber: number || null,
    chatUrl: digits ? `https://wa.me/${digits}` : null,
  };
}

export function startWhatsApp() {
  if (!whatsappConfigured()) {
    console.log("WhatsApp bot disabled (set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID)");
    return;
  }
  console.log("WhatsApp Cloud API bot ready (webhook /api/whatsapp/webhook)");
}
