"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ActivityData = { label: string; minutes: number; color: string };

interface ActivityProps {
  activities: ActivityData[];
}

export default function Activity({ activities }: ActivityProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Activity</CardTitle>
        <select className="text-sm border rounded-md px-2 py-1">
          <option>Week</option>
          <option>Month</option>
        </select>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.label}>
            <div className="flex justify-between text-sm font-medium">
              <span>{activity.label}</span>
              <span>{activity.minutes} min</span>
            </div>
            <Progress
              value={(activity.minutes / 200) * 100}
              className="mt-1 h-2 bg-gray-200"
            />
            <div
              className="h-2 rounded-full -mt-2"
              style={{
                width: `${(activity.minutes / 200) * 100}%`,
                backgroundColor: activity.color,
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
