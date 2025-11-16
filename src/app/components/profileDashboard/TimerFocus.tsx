"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TimerFocus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer focus</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm">Mindfulness</span>
        <span className="text-sm">00:30</span>
        <Button size="sm">Start timer</Button>
      </CardContent>
    </Card>
  );
}
