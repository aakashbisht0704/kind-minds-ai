"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

type SessionData = { month: string; count: number };

interface SessionFrequencyProps {
  data: SessionData[];
}

export default function SessionFrequency({ data }: SessionFrequencyProps) {
  return (
    <Card className="bg-gradient-to-r from-[#ede9fe] to-[#fce7f3]">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Session frequency</CardTitle>
        <Select defaultValue="month">
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="month" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <Bar
              dataKey="count"
              fill="#fcd34d"
              radius={[8, 8, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
