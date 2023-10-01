import type { APIRoute } from "astro";

const URLs = [
  "https://api.bandai-tcg-plus.com/api/user/card/list?game_title_id=2&limit=20&offset=0&default_regulation=4&playable_regulation[]=4&reverse_card=0&infinite=false",
  "https://api.bandai-tcg-plus.com/api/user/card/list?game_title_id=2&limit=20&offset=1&default_regulation=4&playable_regulation[]=4&reverse_card=0&infinite=false",
  "https://api.bandai-tcg-plus.com/api/user/card/list?game_title_id=2&limit=20&offset=2&default_regulation=4&playable_regulation[]=4&reverse_card=0&infinite=false",
];

export const GET: APIRoute = async () => {
  // Usamos Promise.all para realizar las tres llamadas en paralelo
  const responses = await Promise.all(URLs.map((url) => fetch(url)));

  // Procesamos los resultados de cada llamada
  const dataPromises = responses.map((response) => response.json());
  const dataArray = await Promise.all(dataPromises);

  const data = dataArray.reduce((acc, currentData) => acc.concat(currentData), []);

  return new Response(JSON.stringify({ data }));
};
