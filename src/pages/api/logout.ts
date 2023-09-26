import type { APIRoute} from "astro";

export const GET: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: new Headers({
      "Set-Cookie": "sbat=removed; Max-Age=-1; Path=/;",
      Location: "/",
    }),
  });
};
