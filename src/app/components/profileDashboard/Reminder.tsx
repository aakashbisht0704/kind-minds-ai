"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReminderProps {
  message: string;
}

export default function Reminder({ message }: ReminderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminder</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{message}</p>
        <Button variant="ghost" size="icon">🔔</Button>
      </CardContent>
    </Card>
  );
}
