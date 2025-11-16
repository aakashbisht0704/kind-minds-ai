"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OnboardingFormProps {
  initialName?: string | null;
  initialAgeClass?: string | null;
  initialPreferredMode?: "academic" | "mindfulness" | null;
}

export default function OnboardingForm({
  initialName,
  initialAgeClass,
  initialPreferredMode,
}: OnboardingFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [name, setName] = useState(initialName ?? "");
  const [ageClass, setAgeClass] = useState<string | undefined>(
    initialAgeClass && initialAgeClass.length > 0 ? initialAgeClass : undefined
  );
  const [preferredMode, setPreferredMode] = useState<"academic" | "mindfulness" | "">(
    initialPreferredMode ?? ""
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (!name.trim() || !ageClass || !preferredMode) {
      toast.error("Please complete all fields to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw sessionError || new Error("You must be signed in to continue.");
      }

      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        name: name.trim(),
        age_class: ageClass ?? null,
        preferred_mode: preferredMode,
        onboarding_complete: true,
      });

      if (error) {
        throw error;
      }

      toast.success("Profile saved! Redirecting you to academic tools.");
      router.replace("/academic");
    } catch (error: any) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 px-4 py-12">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Let&rsquo;s get to know you</h1>
          <p className="mt-2 text-gray-600">
            Complete your profile so we can tailor your KindMinds experience.
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="name" className="text-base font-semibold text-gray-800">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="How should we address you?"
              disabled={submitting}
              className="h-12 rounded-xl border-gray-200 text-base"
            />
          </div>

          <div className="space-y-2">
            <span className="text-base font-semibold text-gray-800">Age / Class</span>
            <Select value={ageClass} onValueChange={setAgeClass} disabled={submitting}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200 text-base">
                <SelectValue placeholder="Choose the option that fits you best" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="middle_school">Middle School</SelectItem>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="undergrad">Undergraduate</SelectItem>
                <SelectItem value="postgrad">Postgraduate</SelectItem>
                <SelectItem value="professional">Working Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <span className="text-base font-semibold text-gray-800">
              Preferred Mode
            </span>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-5 py-4 transition-colors ${preferredMode === "academic" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-400 hover:bg-purple-50"}`}>
                <input
                  type="radio"
                  name="preferred_mode"
                  value="academic"
                  checked={preferredMode === "academic"}
                  onChange={() => setPreferredMode("academic")}
                  disabled={submitting}
                  className="h-4 w-4 accent-purple-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">Academic</p>
                  <p className="text-sm text-gray-500">
                    Personalized study support, summaries, and productivity boosts.
                  </p>
                </div>
              </label>

              <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-5 py-4 transition-colors ${preferredMode === "mindfulness" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-400 hover:bg-purple-50"}`}>
                <input
                  type="radio"
                  name="preferred_mode"
                  value="mindfulness"
                  checked={preferredMode === "mindfulness"}
                  onChange={() => setPreferredMode("mindfulness")}
                  disabled={submitting}
                  className="h-4 w-4 accent-purple-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">Mindfulness</p>
                  <p className="text-sm text-gray-500">
                    Guided meditations, emotional check-ins, and wellbeing tracking.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 py-6 text-lg font-semibold text-white hover:from-purple-600 hover:to-purple-700"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </span>
            ) : (
              "Complete Onboarding"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}


