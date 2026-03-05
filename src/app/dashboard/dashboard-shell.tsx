"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { BarChart2, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./date-picker";
import { WorkoutCard, type WorkoutWithExercises } from "./workout-card";
import { startWorkout } from "./active/actions";

interface DashboardShellProps {
  dateStr: string;
  workouts: WorkoutWithExercises[];
  userId: string;
}

export function DashboardShell({ dateStr, workouts, userId }: DashboardShellProps) {
  const router = useRouter();
  const [isStarting, startTransition] = useTransition();
  const selectedDate = new Date(`${dateStr}T00:00:00`);
  const displayDate = format(selectedDate, "MMM d, yyyy");

  function handleStartWorkout() {
    startTransition(async () => {
      const workoutId = await startWorkout(userId);
      router.push(`/dashboard/active?id=${workoutId}`);
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)] gap-6 p-6">
      <aside className="shrink-0 space-y-4">
        <DatePicker selectedDate={selectedDate} />
        <Link
          href="/progress"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <BarChart2 className="size-4" />
          Progress
        </Link>
      </aside>

      <main className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{displayDate}</h2>
          <Button
            size="sm"
            onClick={handleStartWorkout}
            disabled={isStarting}
          >
            <Play className="size-4" />
            {isStarting ? "Starting..." : "Start Workout"}
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/new?date=${dateStr}`}>
              <Plus /> Log Past Workout
            </Link>
          </Button>
        </div>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} userId={userId} />
          ))
        )}
      </main>
    </div>
  );
}
