import type { APIRoute } from "astro";
import { translateText } from "../../utils/controllers";
import { getUser } from "@/utils/supabaseServer";
import { parseCookies } from "@/utils/utils";
import { accessTokenName, refreshTokenName } from "@/utils/config";

export const POST: APIRoute = async ({ request }) => {
  const { text } = await request.json();
  const cookies = parseCookies(request.headers.get("cookie"));
  const accessToken = cookies[accessTokenName];
  const refreshToken = cookies[refreshTokenName];
  if (!accessToken)
    return new Response(JSON.stringify({ error: "You must be logged." }), {
      status: 400,
    });

  const user = await getUser({ accessToken, refreshToken });
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
