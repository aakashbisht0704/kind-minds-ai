"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DailyProgressProps {
  progress: number;
}

export default function DailyProgress({ progress }: DailyProgressProps) {
  return (
    <Card className="w-full max-w-xs mx-auto">
      <CardHeader>
        <CardTitle>Daily progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <Progress value={progress} className="w-24 h-3 bg-zinc-200" />
        <div className="text-sm font-semibold text-purple-600">{progress}%</div>
        <p className="mt-1 text-sm text-zinc-500 text-center">
          Keep working on your mental health
        </p>
      </CardContent>
    </Card>
  );
}
