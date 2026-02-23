"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./date-picker";
import { WorkoutCard, type WorkoutWithExercises } from "./workout-card";

interface DashboardShellProps {
  dateStr: string;
  workouts: WorkoutWithExercises[];
}

export function DashboardShell({ dateStr, workouts }: DashboardShellProps) {
  const selectedDate = new Date(`${dateStr}T00:00:00`);
  const displayDate = format(selectedDate, "MMM d, yyyy");

  return (
    <div className="flex min-h-[calc(100vh-65px)] gap-6 p-6">
      <aside className="shrink-0">
        <DatePicker selectedDate={selectedDate} />
      </aside>

      <main className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{displayDate}</h2>
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/new?date=${dateStr}`}>
              <Plus /> New Workout
            </Link>
          </Button>
        </div>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))
        )}
      </main>
    </div>
  );
}
