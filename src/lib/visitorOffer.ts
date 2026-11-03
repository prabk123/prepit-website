import { headers } from "next/headers";
import { COUNTRY_HEADER, type WebMarket, webMarketFor } from "@/lib/markets";
import { PRICES, type Prices, WEB_PRICES } from "@/lib/pricing";
import { webBillingSellerFor } from "@/lib/revenuecat/sellers";

/**
 * The visitor's market and the prices to show them, from the country the
 * proxy passes, as on the homepage and /try. Server components only: reading
 * the request headers makes the page render per request.
 */
export async function visitorOffer(): Promise<{ market: WebMarket; prices: Prices }> {
  const country = (await headers()).get(COUNTRY_HEADER);
  const market = webMarketFor(country);
  const prices = market === "web" ? WEB_PRICES[webBillingSellerFor(country)] : PRICES;
  return { market, prices };
}
