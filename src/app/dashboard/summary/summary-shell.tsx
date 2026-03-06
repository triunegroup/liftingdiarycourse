"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Clock, Dumbbell, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutSummary } from "./actions";

interface SummaryShellProps {
  summary: WorkoutSummary;
}

export function SummaryShell({ summary }: SummaryShellProps) {
  const newPRs = summary.exercises.filter((e) => e.isNewPR);

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <CheckCircle2 className="mx-auto size-12 text-green-500" />
        <h1 className="text-2xl font-bold">Workout Complete!</h1>
        <p className="text-muted-foreground">
          {summary.name ?? "Workout"} &middot;{" "}
          {format(new Date(summary.startedAt), "MMM d, yyyy")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="mx-auto size-5 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold tabular-nums">{summary.durationMinutes}</p>
            <p className="text-xs text-muted-foreground">minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Dumbbell className="mx-auto size-5 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold tabular-nums">{summary.totalSets}</p>
            <p className="text-xs text-muted-foreground">sets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Flame className="mx-auto size-5 text-muted-foreground mb-1" />
            <p className="text-2xl font-bold tabular-nums">
              {Math.round(summary.totalVolume).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">kg volume</p>
          </CardContent>
        </Card>
      </div>

      {/* New PRs */}
      {newPRs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-yellow-500" />
              New Personal Records!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {newPRs.map((ex) => (
              <div key={ex.name} className="flex items-center justify-between">
                <span className="font-medium">{ex.name}</span>
                <Badge variant="secondary">{ex.prWeight} kg</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Exercise breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary.exercises.map((ex) => (
            <div key={ex.name}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{ex.name}</span>
                {ex.isNewPR && (
                  <Badge variant="secondary" className="text-xs py-0 gap-1">
                    <Trophy className="size-3 text-yellow-500" />
                    PR
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {ex.sets.map((s, i) => (
                  <span key={i} className="tabular-nums">
                    {i + 1}.{" "}
                    {Number(s.weight) > 0
                      ? `${Number(s.weight)} kg × ${s.reps}`
                      : `${s.reps} reps`}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button asChild className="w-full">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
