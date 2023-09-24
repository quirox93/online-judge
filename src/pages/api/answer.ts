import type { APIRoute } from "astro";
import { generateResponse } from "./controllers";

export const POST: APIRoute = async ({ request }) => {
  const { question } = await request.json();

  const response = await generateResponse(question);

  return new Response(JSON.stringify(response));
};
