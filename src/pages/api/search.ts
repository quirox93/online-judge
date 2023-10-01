import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { cardName } = await request.json();
  const response = await fetch(
    `https://api.bandai-tcg-plus.com/api/user/card/list?game_title_id=2&limit=20&offset=0&card_name=${cardName}&default_regulation=4&playable_regulation[]=4&reverse_card=0&infinite=false`
  );
  const data = await response.json();

  return new Response(JSON.stringify({ data }));
};
