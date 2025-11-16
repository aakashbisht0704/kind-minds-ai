"use client";

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import TopTabs from "../../components/TopTabs";
import ChatInputDock from "../../components/ChatInputDock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  ActivityRecord,
  createActivity,
  deleteActivity,
  fetchActivities,
  updateActivityCompletion,
} from "@/lib/toolsAPI";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Checkbox from "@/components/ui/checkbox";

const ACTIVITY_BADGES: Record<string, { label: string; color: string }> = {
  meditation: { label: "Meditation", color: "bg-purple-100 text-purple-700" },
  reminder: { label: "Reminder", color: "bg-blue-100 text-blue-700" },
  streak: { label: "Streak", color: "bg-green-100 text-green-700" },
  journaling: { label: "Journaling", color: "bg-amber-100 text-amber-700" },
  breathing: { label: "Breathing", color: "bg-pink-100 text-pink-700" },
};

export default function ActivitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    type: "meditation",
    date: "",
    time: "",
  });

  const upcomingActivities = useMemo(
    () =>
      activities
        .filter((activity) => !activity.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [activities]
  );

  const completedActivities = useMemo(
    () =>
      activities
        .filter((activity) => activity.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [activities]
  );

  const streakData = useMemo(() => {
    const byDate = new Map<string, number>();
    completedActivities.forEach((activity) => {
      const key = new Date(activity.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    });
    return Array.from(byDate.entries()).map(([name, value]) => ({ name, value }));
  }, [completedActivities]);

  useEffect(() => {
    const loadActivities = async () => {
      if (!user) {
        setActivities([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await fetchActivities(user.id);
      if (error) {
        console.error("Failed to load activities", error);
        setActivities([]);
      } else {
        setActivities(
          (data ?? []).map((activity) => ({
            id: activity.id,
            title: activity.title,
            type: activity.type,
            date: activity.date,
            completed: activity.completed,
          }))
        );
      }
      setLoading(false);
    };

    loadActivities();
  }, [user]);

  const toggleCompletion = async (activityId: string, completed: boolean) => {
    setUpdating(activityId);
    const { error } = await updateActivityCompletion(activityId, completed);
    if (error) {
      console.error("Failed to update activity", error);
    } else {
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId ? { ...activity, completed } : activity
        )
      );
    }
    setUpdating(null);
  };

  const handleDeleteActivity = async (activityId: string) => {
    setUpdating(activityId);
    const { error } = await deleteActivity(activityId);
    if (error) {
      console.error("Failed to delete activity", error);
    } else {
      setActivities((prev) => prev.filter((activity) => activity.id !== activityId));
    }
    setUpdating(null);
  };

  const handleAddActivity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || submitting) return;

    if (!formState.title.trim() || !formState.date || !formState.time) {
      return;
    }

    setSubmitting(true);
    const isoDate = new Date(`${formState.date}T${formState.time}`).toISOString();
    const { data, error } = await createActivity({
      userId: user.id,
      title: formState.title.trim(),
      type: formState.type,
      date: isoDate,
    });

    if (error) {
      console.error("Failed to add activity", error);
    } else if (data) {
      setActivities((prev) => [...prev, data]);
      setFormState({
        title: "",
        type: "meditation",
        date: "",
        time: "",
      });
    }
    setSubmitting(false);
  };

  const renderActivityCard = (activity: ActivityRecord) => {
    const badge = ACTIVITY_BADGES[activity.type] || {
      label: activity.type,
      color: "bg-zinc-100 text-zinc-700",
    };
    const activityDate = new Date(activity.date);
    const isPast = activityDate.getTime() < Date.now();

    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="group rounded-3xl border border-gray-200 bg-white/95 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div>
                <Checkbox
                  id={`activity-${activity.id}`}
                  checked={activity.completed}
                  onChange={(event) =>
                    toggleCompletion(activity.id, event.target.checked)
                  }
                  disabled={updating === activity.id}
                  className="mt-1 h-5 w-5 rounded-md border-2 border-purple-300 accent-purple-600"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  {activity.completed && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-600">
                      Completed
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  {activity.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activityDate.toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {isPast && !activity.completed && (
                    <span className="ml-2 text-xs font-semibold text-red-500">Overdue</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => toggleCompletion(activity.id, !activity.completed)}
                disabled={updating === activity.id}
              >
                {activity.completed ? "Mark as Incomplete" : "Mark Completed"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-red-500 hover:text-red-600"
                onClick={() => handleDeleteActivity(activity.id)}
                disabled={updating === activity.id}
              >
                Remove
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="relative grid min-h-dvh grid-cols-1 md:grid-cols-[320px_1fr] overflow-x-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="relative h-dvh flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1080px] px-4 sm:px-6 py-8">
            <TopTabs />

            {/* Activities hero section */}
            <section className="mt-6 grid gap-4 md:grid-cols-3">
              {/* Meditation card */}
              <div className="group rounded-3xl bg-gradient-to-br from-slate-900/0 to-slate-900/0 hover:from-slate-900/40 hover:to-slate-800/40 p-[1.5px] transition-colors">
                <Card className="h-full rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-sm group-hover:shadow-md flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">Meditation</h2>
                    <p className="text-sm text-zinc-600">
                      Slip into a dark, ambient space and follow gentle inhale–exhale cues at your own
                      pace.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href="/meditation">
                      <Button className="w-full rounded-full bg-sky-500 hover:bg-sky-400 text-white">
                        Start Meditation
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>

              {/* 5-4-3-2-1 Grounding card */}
              <div className="group rounded-3xl bg-gradient-to-br from-blue-900/0 to-slate-900/0 hover:from-blue-900/40 hover:to-slate-900/40 p-[1.5px] transition-colors">
                <Card className="h-full rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-sm group-hover:shadow-md flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">5‑4‑3‑2‑1 Grounding</h2>
                    <p className="text-sm text-zinc-600">
                      A fully automatic one‑minute grounding flow to help you ride out waves of
                      anxiety.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href="/grounding">
                      <Button className="w-full rounded-full bg-indigo-500 hover:bg-indigo-400 text-white">
                        Begin Grounding
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>

              {/* Memory game card */}
              <div className="group rounded-3xl bg-gradient-to-br from-emerald-900/0 to-slate-900/0 hover:from-emerald-500/30 hover:to-sky-500/30 p-[1.5px] transition-colors">
                <Card className="h-full rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-sm group-hover:shadow-md flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">Memory Game</h2>
                    <p className="text-sm text-zinc-600">
                      A soothing card‑matching game to exercise your focus and short‑term memory.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href="/tools/memory">
                      <Button className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-white">
                        Play Memory Game
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </section>

            <header className="mt-10 flex flex-col gap-3">
              <h1 className="text-3xl font-semibold text-gray-900">Your Activities</h1>
              <p className="text-gray-600">
                Track your upcoming mindfulness sessions, daily streaks, and KindMinds reminders.
              </p>
            </header>

            <section className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card className="rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Schedule a new activity</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Align your activities with your goals. Set a date and time to receive gentle nudges.
                </p>

                <form onSubmit={handleAddActivity} className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold uppercase text-gray-500">Activity name</label>
                    <Input
                      value={formState.title}
                      onChange={(event) =>
                        setFormState((state) => ({ ...state, title: event.target.value }))
                      }
                      placeholder="Morning breathing practice"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-500">Category</label>
                    <Select
                      value={formState.type}
                      onValueChange={(value) =>
                        setFormState((state) => ({ ...state, type: value }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meditation">Meditation</SelectItem>
                        <SelectItem value="breathing">Breathing</SelectItem>
                        <SelectItem value="streak">Streak</SelectItem>
                        <SelectItem value="journaling">Journaling</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-500">Date</label>
                    <Input
                      type="date"
                      value={formState.date}
                      onChange={(event) =>
                        setFormState((state) => ({ ...state, date: event.target.value }))
                      }
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-500">Time</label>
                    <Input
                      type="time"
                      value={formState.time}
                      onChange={(event) =>
                        setFormState((state) => ({ ...state, time: event.target.value }))
                      }
                      className="mt-2"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-wrap items-center gap-3 justify-between">
                    <Button
                      type="submit"
                      disabled={submitting || !user}
                      className="rounded-full"
                    >
                      {submitting ? "Adding..." : "Add Activity"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-full text-purple-600 hover:text-purple-700"
                      onClick={() => router.push("/mindfulness")}
                    >
                      Open Meditation Scheduler
                    </Button>
                  </div>
                </form>
              </Card>

              <Card className="rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Completion outlook</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Keep an eye on your consistency over the past sessions.
                </p>
                <div className="mt-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={streakData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </section>

            <section className="mt-8 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming</h2>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Stay consistent by checking off activities as you complete them.
                </p>
                <div className="mt-4 space-y-4">
                  {loading && <p className="text-sm text-gray-500">Loading activities...</p>}
                  {!loading && upcomingActivities.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Nothing scheduled yet. Add a meditation or mindfulness goal to get started.
                    </p>
                  )}
                  <AnimatePresence>
                    {upcomingActivities.map(renderActivityCard)}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">Completed</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Celebrate your wins and keep the momentum going.
                </p>
                <div className="mt-4 space-y-4">
                  <AnimatePresence>
                    {completedActivities.map(renderActivityCard)}
                  </AnimatePresence>
                  {!loading && completedActivities.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Complete an activity to see it here.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex-shrink-0">
          <ChatInputDock position="fixed" />
        </div>
      </main>
    </div>
  );
}


