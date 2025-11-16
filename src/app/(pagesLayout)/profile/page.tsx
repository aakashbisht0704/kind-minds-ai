"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import TopTabs from "@/app/components/TopTabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useAuth } from "@/app/contexts/AuthContext";
import { fetchProfile, getAvatarUrl, ProfileRecord, updateProfile, uploadAvatar } from "@/lib/profileAPI";
import { fetchActivities, ActivityRecord } from "@/lib/toolsAPI";
import ChatInputDock from "@/app/components/ChatInputDock";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis } from "recharts";

interface MoodPoint {
  dateLabel: string;
  avgScore: number;
}

export default function ProfileDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editState, setEditState] = useState({
    name: "",
    preferred_mode: "academic",
    age_class: "" as string | null,
    mbti_type: "" as string | null,
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [moodSeries, setMoodSeries] = useState<MoodPoint[]>([]);
  const [chatCount, setChatCount] = useState<number | null>(null);

  const isLoading = !profile;

  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      const { data, error } = await fetchProfile(user.id);
      if (error) {
        console.error("Failed to fetch profile", error);
        return;
      }
      if (data) {
        setProfile(data);
        setEditState({
          name: data.name ?? "",
          preferred_mode: data.preferred_mode ?? "academic",
          age_class: data.age_class,
          mbti_type: data.mbti_type,
        });

        if (data.avatar_path) {
          const { url } = await getAvatarUrl(data.avatar_path);
          if (url) setAvatarUrl(url);
        }
      }
    };

    loadProfile();
  }, [user?.id]);

  // Load total chat count directly from Supabase so it doesn't depend on visiting tabs first
  useEffect(() => {
    if (!user?.id) return;
    const loadChatCount = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { count, error } = await supabase
          .from("chats")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (error) {
          console.error("Failed to load chat count", error);
          setChatCount(null);
        } else {
          setChatCount(count ?? 0);
        }
      } catch (err) {
        console.error("Unexpected error loading chat count", err);
        setChatCount(null);
      }
    };
    loadChatCount();
  }, [user?.id]);

  // Load recent activities as a simple log
  useEffect(() => {
    if (!user?.id) return;
    const loadActivities = async () => {
      const { data, error } = await fetchActivities(user.id);
      if (error) {
        console.error("Failed to load activities", error);
        setActivities([]);
        return;
      }
      const items: ActivityRecord[] =
        data?.map((a) => ({
          id: a.id,
          title: a.title,
          type: a.type,
          date: a.date,
          completed: a.completed,
        })) ?? [];
      // Show most recent first
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(items);
    };
    loadActivities();
  }, [user?.id]);

  // Load mood series from sentiment_logs joined through chats
  useEffect(() => {
    if (!user?.id) return;
    const loadMood = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("sentiment_logs")
          .select("score, created_at, chats!inner(user_id)")
          .eq("chats.user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Failed to load sentiment logs", error);
          setMoodSeries([]);
          return;
        }

        const byDay = new Map<string, { sum: number; count: number }>();
        (data ?? []).forEach((row: any) => {
          const date = new Date(row.created_at);
          const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
          const existing = byDay.get(key) ?? { sum: 0, count: 0 };
          byDay.set(key, { sum: existing.sum + row.score, count: existing.count + 1 });
        });

        const series: MoodPoint[] = Array.from(byDay.entries())
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([day, agg]) => ({
            dateLabel: day,
            avgScore: agg.count ? agg.sum / agg.count : 0,
          }));

        setMoodSeries(series);
      } catch (err) {
        console.error("Unexpected error loading mood series", err);
        setMoodSeries([]);
      }
    };
    loadMood();
  }, [user?.id]);

  const chatsCount = useMemo(() => {
    if (chatCount != null) return chatCount;
    if (!profile || !user?.id) return 0;
    if (profile.chats_count) return profile.chats_count;
    return 0;
  }, [chatCount, profile, user?.id]);

  const meditationMinutes = profile?.meditation_minutes ?? 0;
  const streakDays = profile?.streak_days ?? 0;

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    const { filePath, error } = await uploadAvatar({ file, userId: user.id });
    if (error) {
      console.error("Failed to upload avatar", error);
      setAvatarUploading(false);
      return;
    }

    const { data, error: updateError } = await updateProfile(user.id, { avatar_path: filePath });
    if (updateError) {
      console.error("Failed to update profile with avatar path", updateError);
    } else if (data) {
      setProfile(data);
      const { url } = await getAvatarUrl(filePath);
      if (url) setAvatarUrl(url);
    }
    setAvatarUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    const { data, error } = await updateProfile(user.id, {
      name: editState.name.trim(),
      preferred_mode: editState.preferred_mode as "academic" | "mindfulness",
      age_class: editState.age_class,
      mbti_type: editState.mbti_type,
    });

    if (error) {
      console.error("Failed to update profile", error);
    } else if (data) {
      setProfile(data);
      setEditOpen(false);
    }
    setSavingProfile(false);
  };

  const avatarFallback = profile?.name?.charAt(0)?.toUpperCase() ?? profile?.id?.slice(0, 2).toUpperCase() ?? "K";

  return (
    <div className="relative grid min-h-dvh grid-cols-1 md:grid-cols-[320px_1fr] overflow-x-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="relative h-dvh flex flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-8">
            <TopTabs />

            <div className="mt-6 flex flex-col gap-6 lg:flex-row">
              <Card className="w-full lg:w-80 rounded-3xl border border-gray-200 bg-white/95 shadow-sm">
                <CardContent className="flex flex-col items-center gap-4 py-8">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      {avatarUrl ? <AvatarImage src={avatarUrl} alt={profile?.name ?? ""} /> : <AvatarFallback>{avatarFallback}</AvatarFallback>}
                    </Avatar>
                    <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-purple-600 p-2 text-xs font-semibold text-white shadow-lg">
                      <Input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
                      Upload
                    </label>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">{profile?.name ?? "KindMinds Member"}</h2>
                    <p className="text-sm text-gray-500">{user?.email ?? "Anonymous user"}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Joined {profile?.created_at ? format(new Date(profile.created_at), "MMM d, yyyy") : "--"}
                    </p>
                  </div>
                  <div className="flex w-full justify-between rounded-2xl bg-purple-50 px-4 py-3 text-sm text-purple-700">
                    <span>Preferred Mode</span>
                    <span className="font-semibold capitalize">
                      {profile?.preferred_mode ?? "academic"}
                    </span>
                  </div>
                  <Button className="w-full rounded-full" onClick={() => setEditOpen(true)}>
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <div className="flex-1 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="rounded-3xl border border-gray-200 bg-white/95 shadow-sm">
                    <CardHeader>
                      <CardDescription>Total Chats</CardDescription>
                      <CardTitle className="text-3xl">{chatsCount}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="rounded-3xl border border-gray-200 bg-white/95 shadow-sm">
                    <CardHeader>
                      <CardDescription>Meditation Minutes</CardDescription>
                      <CardTitle className="text-3xl">{meditationMinutes}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="rounded-3xl border border-gray-200 bg-white/95 shadow-sm">
                    <CardHeader>
                      <CardDescription>Current Streak</CardDescription>
                      <CardTitle className="text-3xl">{streakDays} days</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <Card className="rounded-3xl border border-gray-200 bg-white/95 shadow-sm">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>A simple log of what you’ve done lately</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activities.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Activities you complete (like meditations or tools) will show up here.
                      </p>
                    )}
                    {activities.slice(0, 10).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{activity.title}</span>
                          <span className="text-xs capitalize text-gray-500">{activity.type}</span>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {format(new Date(activity.date), "MMM d, yyyy")}
                          <br />
                          {format(new Date(activity.date), "p")}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border border-gray-200 bg-white/95 shadow-sm">
                  <CardHeader>
                    <CardTitle>Mood over time</CardTitle>
                    <CardDescription>Based on the sentiment of your chats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {moodSeries.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Start a conversation and we’ll begin tracking how your mood trends over time.
                      </p>
                    ) : (
                      <ChartContainer
                        config={
                          {
                            mood: {
                              label: "Average sentiment",
                              color: "hsl(221.2 83.2% 53.3%)",
                            },
                          } satisfies ChartConfig
                        }
                        className="h-60 w-full"
                      >
                        <LineChart data={moodSeries}>
                          <XAxis
                            dataKey="dateLabel"
                            stroke="#9ca3af"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#9ca3af"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            domain={[-1, 1]}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value) => (
                                  <>
                                    <span className="font-medium">
                                      {typeof value === "number" ? value.toFixed(2) : value}
                                    </span>
                                    <span className="ml-1 text-xs text-gray-500">sentiment</span>
                                  </>
                                )}
                              />
                            }
                          />
                          <Line
                            type="monotone"
                            dataKey="avgScore"
                            stroke="var(--color-mood)"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <ChatInputDock position="fixed" />
        </div>
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500">Name</label>
              <Input
                value={editState.name}
                onChange={(event) =>
                  setEditState((state) => ({ ...state, name: event.target.value }))
                }
                className="mt-2"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500">Preferred Mode</label>
              <Select
                value={editState.preferred_mode}
                onValueChange={(value) =>
                  setEditState((state) => ({ ...state, preferred_mode: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500">Age / Class</label>
              <Select
                value={editState.age_class ?? ""}
                onValueChange={(value) =>
                  setEditState((state) => ({ ...state, age_class: value || null }))
                }
              >
                <SelectTrigger className="mt-2">
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
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500">
                MBTI Type
              </label>
              <Input
                value={editState.mbti_type ?? ""}
                onChange={(event) =>
                  setEditState((state) => ({
                    ...state,
                    mbti_type: event.target.value.toUpperCase().slice(0, 4),
                  }))
                }
                className="mt-2"
                placeholder="e.g. INFP, ESTJ"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
