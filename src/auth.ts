import { createClient } from "@supabase/supabase-js";
import cookie from "cookie";

export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_KEY
);

export async function getUser(req: Request) {
  const c = cookie.parse(req.headers.get("cookie") ?? "");
  if (!c.sbat) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(c.sbat);
  if (!user || (user.role !== "authenticated" && user.role !== "premium")) {
    return null;
  }
  return user;
}

export async function isLoggedIn(req: Request) {
  return (await getUser(req)) != null;
}
