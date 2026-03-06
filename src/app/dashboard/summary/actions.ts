"use server";

import { db } from "@/db";
import { workouts, exercises, sets } from "@/db/schema";
import { eq, and, ne, isNotNull } from "drizzle-orm";

export interface SummaryExercise {
  name: string;
  sets: { weight: string; reps: number }[];
  isNewPR: boolean;
  prWeight?: number;
}

export interface WorkoutSummary {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date;
  durationMinutes: number;
  totalSets: number;
  totalVolume: number;
  exercises: SummaryExercise[];
}

export async function getWorkoutSummary(
  workoutId: number,
  userId: string
): Promise<WorkoutSummary | null> {
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      exercises: {
        with: { sets: true },
        orderBy: (e, { asc }) => [asc(e.orderInWorkout)],
      },
    },
  });

  if (!workout || !workout.completedAt) return null;

  // Historical max weight per exercise (all other completed workouts)
  const historicalRows = await db
    .select({ exerciseName: exercises.name, weight: sets.weight })
    .from(sets)
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .innerJoin(workouts, eq(exercises.workoutId, workouts.id))
    .where(
      and(
        eq(workouts.userId, userId),
        ne(workouts.id, workoutId),
        isNotNull(workouts.completedAt)
      )
    );

  const historicalMax: Record<string, number> = {};
  for (const row of historicalRows) {
    const w = Number(row.weight);
    if (!historicalMax[row.exerciseName] || w > historicalMax[row.exerciseName]) {
      historicalMax[row.exerciseName] = w;
    }
  }

  let totalSets = 0;
  let totalVolume = 0;

  const summaryExercises: SummaryExercise[] = workout.exercises.map((ex) => {
    const exSets = ex.sets.map((s) => ({ weight: s.weight, reps: s.reps }));
    totalSets += exSets.length;
    totalVolume += exSets.reduce((sum, s) => sum + Number(s.weight) * s.reps, 0);

    const exMaxWeight = exSets.length > 0 ? Math.max(...exSets.map((s) => Number(s.weight))) : 0;
    const prevMax = historicalMax[ex.name] ?? 0;
    const isNewPR = exMaxWeight > 0 && exMaxWeight > prevMax;

    return {
      name: ex.name,
      sets: exSets,
      isNewPR,
      prWeight: isNewPR ? exMaxWeight : undefined,
    };
  });

  return {
    id: workout.id,
    name: workout.name,
    startedAt: workout.startedAt,
    completedAt: workout.completedAt,
    durationMinutes: Math.round(
      (workout.completedAt.getTime() - workout.startedAt.getTime()) / 60000
    ),
    totalSets,
    totalVolume,
    exercises: summaryExercises,
  };
}
