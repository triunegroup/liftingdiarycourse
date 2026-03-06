"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Scale, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { logBodyWeight, deleteBodyWeightEntry } from "./actions";
import type { BodyWeightEntry } from "@/db/schema";

const chartConfig = {
  weight: { label: "Body Weight (kg)", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

interface BodyWeightShellProps {
  entries: BodyWeightEntry[];
  userId: string;
}

export function BodyWeightShell({ entries, userId }: BodyWeightShellProps) {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [weight, setWeight] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLog() {
    const parsed = parseFloat(weight);
    if (!parsed || parsed <= 0) return;
    startTransition(async () => {
      await logBodyWeight(userId, date, parsed.toFixed(2));
      setWeight("");
    });
  }

  const chartData = entries.map((e) => ({
    date: format(new Date(e.date + "T12:00:00"), "MMM d"),
    weight: Number(e.weight),
  }));

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="size-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Body Weight</h1>
      </div>

      {/* Log form */}
      <Card>
        <CardHeader>
          <CardTitle>Log Weight</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bw-date">Date</Label>
              <Input
                id="bw-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-40"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bw-weight">Weight (kg)</Label>
              <Input
                id="bw-weight"
                type="number"
                placeholder="75.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                step="0.1"
                className="w-28"
                disabled={isPending}
                onKeyDown={(e) => e.key === "Enter" && handleLog()}
              />
            </div>
            <Button onClick={handleLog} disabled={isPending || !weight}>
              Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {chartData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit=" kg" domain={["auto", "auto"]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-weight)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* History table */}
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">No entries yet. Log your first weight above.</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...entries].reverse().map((entry) => (
                  <EntryRow key={entry.id} entry={entry} userId={userId} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EntryRow({ entry, userId }: { entry: BodyWeightEntry; userId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <TableRow className={isPending ? "opacity-50" : ""}>
      <TableCell>{format(new Date(entry.date + "T12:00:00"), "MMM d, yyyy")}</TableCell>
      <TableCell className="text-right tabular-nums">{Number(entry.weight)} kg</TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isPending}
          onClick={() =>
            startTransition(() => deleteBodyWeightEntry(entry.id, userId))
          }
        >
          <Trash2 className="size-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
