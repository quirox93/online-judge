import { supabase } from "@/auth";
import LogOut from "@/components/LogOut";
import { useEffect, useState } from "react";
const getURL = () => {
  let url =
    import.meta.env.PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    import.meta.env.PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:4321/";
  return url;
};

export default function LoginStatus() {
  const [url, setUrl] = useState();
  const [session, setSession] = useState(false);
  useEffect(() => {
    const getData = async () => {
      const tokenData = localStorage.getItem("supabase.auth.token");
      if (!tokenData) return;
      const { currentSession } = JSON.parse(tokenData);
      var expiresAt = parseInt(currentSession.expires_at, 10);
      var ahora = Math.floor(Date.now() / 1000);
      setSession(expiresAt > ahora);
    };

    getData();
  }, []);
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getURL() + "signin",
      },
    });
  };

  return (
    <>
      {session ? (
        <LogOut client:load />
      ) : (
        <a
          onClick={handleLogin}
          href={url}
          className="flex-no-grow flex-no-shrink relative py-2 px-4 leading-normal text-foreground no-underline flex items-center hover:bg-background"
        >
          Login
        </a>
      )}
    </>
  );
}
