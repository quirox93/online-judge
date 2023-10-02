import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_KEY
);

export async function getUser(token: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  if (!user) {
    return null;
  }
  return user;
}

export async function isLoggedIn(token: any) {
  return (await getUser(token)) != null;
}
