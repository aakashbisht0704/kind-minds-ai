import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerComponentClient } from "@/lib/supabase";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = getSupabaseServerComponentClient(cookies());
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirect=/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, age_class, preferred_mode, onboarding_complete")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profile?.onboarding_complete) {
    redirect("/academic");
  }

  return (
    <OnboardingForm
      initialName={profile?.name ?? ""}
      initialAgeClass={profile?.age_class ?? ""}
      initialPreferredMode={(profile?.preferred_mode as "academic" | "mindfulness" | null) ?? null}
    />
  );
}


