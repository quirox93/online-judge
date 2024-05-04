import { getPriceData } from "@/utils/scrappers.js";

export const POST = async ({ request }: any) => {
  const { card_number } = await request.json();
  const start = Date.now();
  const data = await getPriceData(card_number);
  const end = Date.now();
  console.log(`La llamada tomó ${Math.floor((end - start) / 1000)} segundos`);
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
