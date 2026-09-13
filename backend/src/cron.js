import cron from "node-cron";
import { checkAllProducts } from "./engine.js";

export function startPriceCron() {
  const hours = Math.max(1, Number(process.env.CHECK_INTERVAL_HOURS || 6));
  const expr = `0 */${hours} * * *`;
  cron.schedule(expr, async () => {
    console.log(`[cron] checking ${hours}h price job`);
    await checkAllProducts();
  });
  console.log(`Price cron scheduled every ${hours} hour(s)`);
}
