import { config } from "dotenv";

config({ path: ".env.local" });
const { default: app } = await import("../api/index.js");
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
try {
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  const health = await fetch(`${base}/api/health`).then((response) => response.json());
  const productResult = await fetch(`${base}/api/products`).then((response) => response.json());
  if (!health.ok || !Array.isArray(productResult.data) || productResult.data.length === 0) throw new Error("Smoke check failed");
  const smokeHeaders = { "x-forwarded-for": "127.0.0.1" };
  const sessionResponse = await fetch(`${base}/api/auth/get-session`, { headers: smokeHeaders });
  const protectedResponse = await fetch(`${base}/api/admin/overview`, { headers: smokeHeaders });
  if (sessionResponse.status !== 200 || protectedResponse.status !== 401) throw new Error("Auth guard smoke check failed");
  const rejectedOrder = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://127.0.0.1:5173", "idempotency-key": crypto.randomUUID() },
    body: JSON.stringify({
      productId: "does-not-exist",
      quantity: 1,
      buyer: { fullName: "Quality Check", phone: "081234567890", email: "qa@example.com", ageRange: "30+", institutionLevel: "Masyarakat Umum", institutionName: "", category: "Masyarakat Umum" },
      attendees: [{ fullName: "Quality Check", phone: "", email: "", gender: "Laki-laki", birthDate: "", guardianName: "", ageRange: "30+", institutionLevel: "Masyarakat Umum", institutionName: "", category: "Masyarakat Umum" }],
      donation: 0,
      voucherCode: "",
      requestToken: "a".repeat(43),
    }),
  });
  if (rejectedOrder.status !== 409) throw new Error(`Order guard returned ${rejectedOrder.status}, expected 409`);
  console.log(`API smoke passed: ${productResult.data.length} products.`);
} finally {
  server.close();
}
