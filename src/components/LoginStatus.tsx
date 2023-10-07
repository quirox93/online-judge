import { supabase } from "@/utils/supabaseBrowser";

const getURL = () => {
  let url =
    import.meta.env.PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    import.meta.env.PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:4321/";
  return url;
};

export default function LoginStatus({ isLoggedIn }: any) {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getURL(),
      },
    });
  };
  const handleLogOut = async () => {
    await supabase.auth.signOut();
  };
  return (
    <>
      {isLoggedIn ? (
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
