import { supabase } from "@/utils/supabaseBrowser";
import { isLoggedIn } from "@/store/store.js";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
const getURL = () => {
  let url =
    import.meta.env.PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    import.meta.env.PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:4321/";
  return url;
};

export default function LoginStatus() {
  const $isLoggedIn = useStore(isLoggedIn);
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getURL(),
      },
    });
  };
  const handleLogOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };
  if (loading)
    return (
      <button className="flex-no-grow flex-no-shrink relative py-2 px-4 leading-normal text-foreground no-underline flex items-center hover:bg-background">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </button>
    );
  return (
    <>
      {$isLoggedIn ? (
        <button
          className="flex-no-grow flex-no-shrink relative py-2 px-4 leading-normal text-foreground no-underline flex items-center hover:bg-background"
          onClick={handleLogOut}
        >
          Logout
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="flex-no-grow flex-no-shrink relative py-2 px-4 leading-normal text-foreground no-underline flex items-center hover:bg-background"
        >
          Login
        </button>
      )}
    </>
  );
}
