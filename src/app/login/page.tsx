import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerComponentClient } from "@/lib/supabase";
import LoginClient from "./LoginClient";

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string;
  }>;
}

export default async function LoginPage(props: LoginPageProps) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const supabase = getSupabaseServerComponentClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const redirectTarget = searchParams.redirect || "/academic";

  if (session) {
    await supabase.from("profiles").upsert(
      {
        id: session.user.id,
      },
      { onConflict: "id" }
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profile?.onboarding_complete) {
      redirect("/onboarding");
    }

    redirect(redirectTarget);
  }

  return <LoginClient redirectTo={redirectTarget} />;
}


