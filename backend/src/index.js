import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import accountRoutes from "./routes/account.js";
import { startPriceCron } from "./cron.js";
import { handleWhatsAppWebhook, startWhatsApp, verifyWhatsAppWebhook, whatsappPublicConfig } from "./whatsapp.js";
import { getUsdRates } from "./fx.js";

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "dropwatch" });
});

app.get("/api/config", (_req, res) => {
  res.json({ whatsapp: whatsappPublicConfig() });
});

app.get("/api/fx", async (_req, res) => {
  const rates = await getUsdRates();
  res.json({ base: "USD", rates });
});

const demoCatalog = {
  headphones: {
    name: "Sony WH-1000XM5 Wireless Headphones",
    price: 278,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=640&q=80",
  },
  shoes: {
    name: "Nike Pegasus 41 Road Running Shoes",
    price: 119,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=640&q=80",
  },
  kettle: {
    name: "Fellow Stagg EKG Electric Kettle",
    price: 165,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=640&q=80",
  },
  earbuds: {
    name: "boAt Airdopes 141 Wireless Earbuds",
    price: 1299,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=640&q=80",
  },
};

app.get("/demo/:slug", (req, res) => {
  const item = demoCatalog[req.params.slug];
  if (!item) return res.status(404).send("Unknown demo product");
  res.type("html").send(`<!doctype html>
<html><head>
<title>${item.name}</title>
<meta property="og:title" content="${item.name}" />
<meta property="og:image" content="${item.image}" />
<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org/",
  "@type": "Product",
  name: item.name,
  image: item.image,
  offers: { "@type": "Offer", price: item.price, priceCurrency: item.currency || "USD" },
})}
</script>
</head><body>
<h1>${item.name}</h1>
<p>${item.currency === "INR" ? "₹" : "$"}${item.price}</p>
<img src="${item.image}" alt="" width="240" />
</body></html>`);
});

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/products", productRoutes);

app.get("/api/whatsapp/webhook", verifyWhatsAppWebhook);
app.post("/api/whatsapp/webhook", handleWhatsAppWebhook);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Dropwatch API on http://localhost:${PORT}`);
  db.prepare("SELECT 1").get();
  startPriceCron();
  startWhatsApp();
});
