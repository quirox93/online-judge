import { getPriceData } from "@/utils/scrappers.js";

export const GET = async ({ url }: any) => {
  const start = new Date().getTime();
  const queryParams = new URLSearchParams(url.search);
  const card_number = queryParams.get("card_number");
  const webs = "dolarBlue,tcgPlayer,phoenix,guarida,spaceGaming";
  if (!webs || !card_number) {
    return new Response(
      JSON.stringify({ message: "Error en los parametros." }),
      {
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
  const websFilter = webs.split(",");
  const prices = await getPriceData(card_number, websFilter);
  console.log(prices);
  const end = new Date().getTime();
  const durationMs = end - start;
  return new Response(JSON.stringify({ prices, durationMs }), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
