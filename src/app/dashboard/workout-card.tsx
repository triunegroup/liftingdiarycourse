"use client";

import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WorkoutSet {
  id: number;
  order: number;
  weight: string;
  reps: number;
  setType: string | null;
}

interface WorkoutExercise {
  id: number;
  name: string;
  orderInWorkout: number;
  notes: string | null;
  sets: WorkoutSet[];
}

export interface WorkoutWithExercises {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  exercises: WorkoutExercise[];
}

export function WorkoutCard({ workout }: { workout: WorkoutWithExercises }) {
  const startTime = format(new Date(workout.startedAt), "h:mm a");
  const duration = workout.completedAt
    ? Math.round(
        (new Date(workout.completedAt).getTime() -
          new Date(workout.startedAt).getTime()) /
          60000
      )
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{workout.name || "Workout"}</CardTitle>
        <CardDescription>
          {startTime}
          {duration != null && ` · ${duration} min`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {workout.exercises.map((exercise) => (
          <div key={exercise.id}>
            <h4 className="font-medium text-sm">
              {exercise.name}
              {exercise.notes && (
                <span className="ml-2 text-muted-foreground font-normal">
                  — {exercise.notes}
                </span>
              )}
            </h4>
            <div className="mt-1 space-y-0.5">
              {exercise.sets.map((set) => (
                <div
                  key={set.id}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <span className="w-6 text-right tabular-nums">
                    {set.order}.
                  </span>
                  <span className="tabular-nums">
                    {Number(set.weight) > 0
                      ? `${Number(set.weight)} kg × ${set.reps}`
                      : `${set.reps} reps`}
                  </span>
                  {set.setType && set.setType !== "working" && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {set.setType}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {workout.exercises.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No exercises recorded.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
