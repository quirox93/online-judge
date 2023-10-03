import type { APIRoute } from "astro";
import { generateResponse, translateText } from "./controllers";
import { getUser, supabase } from "@/auth";

export const POST: APIRoute = async ({ request }) => {
  const { token, text } = await request.json();
  if (!token)
    return new Response(JSON.stringify({ error: "You must be logged." }), {
      status: 400,
    });
  const { access_token } = JSON.parse(token);
  const user = await getUser(access_token);
  if (!user)
    return new Response(JSON.stringify({ error: "You must be logged." }), {
      status: 400,
    });
  if (user?.role !== "premium")
    return new Response(JSON.stringify({ error: "Paid me 🐭" }), {
      status: 400,
    });
  const translation = (await translateText(text)) as any;

  return new Response(JSON.stringify(translation));
};
