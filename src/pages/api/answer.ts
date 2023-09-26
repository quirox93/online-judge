import type { APIRoute } from "astro";
import { generateResponse } from "./controllers";
import { getUser } from "@/auth";

export const POST: APIRoute = async ({ request }) => {
  const user = await getUser(request);
  if (!user)
    return new Response(JSON.stringify({ error: "Need be login" }), {
      status: 400,
    });
  if (user.role !== "premium")
    return new Response(JSON.stringify({ error: "Need be premium" }), {
      status: 400,
    });
  const { question } = await request.json();

  const response = await generateResponse(question);

  return new Response(JSON.stringify(response));
};
