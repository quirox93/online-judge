import { getCardRulingJp } from "@/utils/scrappers.js";

export const POST = async ({ request }: any) => {
  const { card_number } = await request.json();
  const ruleData = await getCardRulingJp(card_number);

  return new Response(JSON.stringify(ruleData));
};
