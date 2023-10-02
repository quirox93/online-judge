import { getUser, supabase } from "@/auth";
import LogOut from "@/components/LogOut";
const getURL = () => {
  let url =
    import.meta.env.PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    import.meta.env.PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:4321/";
  return url;
};

const user = await getUser(Astro.request);
const isLoggedIn = !(user == null);

export default async function LoginStatus() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getURL() + "signin",
    },
  });
  const user = await getUser(Astro.request);
  const isLoggedIn = !(user == null);

  isLoggedIn ? (
    <LogOut client:load />
  ) : (
    <a
      href={data.url}
      class="flex-no-grow flex-no-shrink relative py-2 px-4 leading-normal text-foreground no-underline flex items-center hover:bg-background"
    >
      Login
    </a>
  );
}
