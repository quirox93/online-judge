import { getPriceData } from "@/utils/scrappers.js";

export const POST = async ({ request }: any) => {
  const { card_number } = await request.json();
  const data = await getPriceData(card_number);
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
