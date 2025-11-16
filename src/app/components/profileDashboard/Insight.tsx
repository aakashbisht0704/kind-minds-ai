"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Insight {
  id: number;
  title: string;
  description: string;
  action: string;
}

interface InsightsProps {
  items: Insight[];
  className?: string; // <-- accept custom classes
}

export default function Insights({ items, className = "" }: InsightsProps) {
  return (
    <div className="">
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
        Insights
      </h3>
      <div className={className}>
        {items.map((insight) => (
          <Card
            key={insight.id}
            className="bg-gradient-to-br from-[#ede9fe] to-[#fce7f3] w-44 h-60"
          >
            <CardHeader>
              <CardTitle>{insight.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">{insight.description}</p>
              <Button className="mt-4">{insight.action}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
