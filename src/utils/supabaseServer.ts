import { createClient } from "@supabase/supabase-js";

import { supabaseUrl, supabaseAnonKey } from "./config";

// to be used on server
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export const getUser = async (arg: {
  accessToken: string | undefined;
  refreshToken: string | undefined;
}) => {
  const { accessToken, refreshToken } = arg;
  console.log(supabaseAnonKey);
  try {
    if (!accessToken) throw "No accessToken";
    if (!refreshToken) throw "No refreshToken";

    //@todo retrieve also the email of the user
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const sessionReq = await supabase.auth.getSession();

    const user = sessionReq?.data?.session?.user;
    if (!user) throw "No user";
    return user;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
