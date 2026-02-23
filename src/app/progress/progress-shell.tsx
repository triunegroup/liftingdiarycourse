"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import type { PersonalRecord, ExerciseHistoryPoint } from "./actions";

const chartConfig = {
  maxWeight: { label: "Max Weight (kg)", color: "hsl(var(--chart-1))" },
  totalVolume: { label: "Total Volume (kg)", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

interface ProgressShellProps {
  prs: PersonalRecord[];
  exerciseNames: string[];
  selectedExercise: string | null;
  history: ExerciseHistoryPoint[];
}

export function ProgressShell({
  prs,
  exerciseNames,
  selectedExercise,
  history,
}: ProgressShellProps) {
  const router = useRouter();

  function handleExerciseChange(name: string) {
    router.push(`/progress?exercise=${encodeURIComponent(name)}`);
  }

  const chartData = history.map((point) => ({
    date: format(new Date(point.date), "MMM d"),
    maxWeight: point.maxWeight,
    totalVolume: point.totalVolume,
  }));

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="size-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Progress</h1>
      </div>

      {prs.length === 0 ? (
        <p className="text-muted-foreground">
          No workout data yet. Log some workouts to see your progress here.
        </p>
      ) : (
        <Tabs defaultValue="records">
          <TabsList>
            <TabsTrigger value="records">Personal Records</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All-Time Bests</CardTitle>
                <CardDescription>
                  Your heaviest lift per exercise across all workouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exercise</TableHead>
                      <TableHead className="text-right">Max Weight</TableHead>
                      <TableHead className="text-right">Reps at Max</TableHead>
                      <TableHead className="text-right">Best Volume</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prs.map((pr) => (
                      <TableRow key={pr.exerciseName}>
                        <TableCell className="font-medium">
                          {pr.exerciseName}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {pr.maxWeight > 0 ? `${pr.maxWeight} kg` : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {pr.maxReps}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {pr.bestVolumeSet > 0
                            ? `${pr.bestVolumeSet} kg`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {format(new Date(pr.achievedAt), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Exercise</span>
              <Select
                value={selectedExercise ?? ""}
                onValueChange={handleExerciseChange}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {chartData.length < 2 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {chartData.length === 0
                    ? "No data for this exercise yet."
                    : "Need at least 2 sessions to show a chart."}
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Max Weight per Session</CardTitle>
                    <CardDescription>{selectedExercise}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} unit=" kg" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="maxWeight"
                          stroke="var(--color-maxWeight)"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Total Volume per Session</CardTitle>
                    <CardDescription>
                      {selectedExercise} — sum of weight × reps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} unit=" kg" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="totalVolume"
                          stroke="var(--color-totalVolume)"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
