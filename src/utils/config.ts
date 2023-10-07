export const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;
export const localStorageKey = import.meta.env.PUBLIC_SUPABASE_LOCALSTORAGE_KEY;
export const cookiePrefix = import.meta.env.PUBLIC_SUPABASE_COOKIE_PRE;

export const accessTokenName = `${
  import.meta.env.PUBLIC_SUPABASE_COOKIE_PRE
}-access-token`;
export const refreshTokenName = `${
  import.meta.env.PUBLIC_SUPABASE_COOKIE_PRE
}-refresh-token`;
