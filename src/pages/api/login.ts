import { supabase } from "@/auth";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { token } = await request.json();
  console.log(token);
  const { access_token } = JSON.parse(token);
  const user = await supabase.auth.getUser(access_token);
  console.log(user, access_token);
  return new Response(JSON.stringify(user));
};
