"use server";

import { db } from "@/db";
import { workouts, exercises, sets } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  maxReps: number;
  bestVolumeSet: number; // weight × reps for a single set
  achievedAt: Date;
}

export async function getPersonalRecords(
  userId: string
): Promise<PersonalRecord[]> {
  // Fetch all sets for this user with their exercise names and workout dates
  const rows = await db
    .select({
      exerciseName: exercises.name,
      weight: sets.weight,
      reps: sets.reps,
      startedAt: workouts.startedAt,
    })
    .from(sets)
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .innerJoin(workouts, eq(exercises.workoutId, workouts.id))
    .where(eq(workouts.userId, userId));

  // Group by exercise name and find PRs
  const byExercise = new Map<
    string,
    { maxWeight: number; maxReps: number; bestVolume: number; achievedAt: Date }
  >();

  for (const row of rows) {
    const weight = Number(row.weight);
    const reps = row.reps;
    const volume = weight * reps;
    const existing = byExercise.get(row.exerciseName);

    if (!existing || weight > existing.maxWeight) {
      byExercise.set(row.exerciseName, {
        maxWeight: weight,
        maxReps: reps,
        bestVolume: volume,
        achievedAt: row.startedAt,
      });
    } else if (weight === existing.maxWeight && reps > existing.maxReps) {
      byExercise.set(row.exerciseName, {
        ...existing,
        maxReps: reps,
        bestVolume: volume,
        achievedAt: row.startedAt,
      });
    }
  }

  return Array.from(byExercise.entries())
    .map(([exerciseName, data]) => ({
      exerciseName,
      maxWeight: data.maxWeight,
      maxReps: data.maxReps,
      bestVolumeSet: data.bestVolume,
      achievedAt: data.achievedAt,
    }))
    .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}

export interface ExerciseHistoryPoint {
  date: Date;
  maxWeight: number;
  totalVolume: number;
}

export async function getExerciseHistory(
  userId: string,
  exerciseName: string
): Promise<ExerciseHistoryPoint[]> {
  const rows = await db
    .select({
      startedAt: workouts.startedAt,
      weight: sets.weight,
      reps: sets.reps,
    })
    .from(sets)
    .innerJoin(exercises, eq(sets.exerciseId, exercises.id))
    .innerJoin(workouts, eq(exercises.workoutId, workouts.id))
    .where(
      and(eq(workouts.userId, userId), eq(exercises.name, exerciseName))
    )
    .orderBy(desc(workouts.startedAt));

  // Group by workout date
  const byDate = new Map<
    string,
    { date: Date; maxWeight: number; totalVolume: number }
  >();

  for (const row of rows) {
    const dateKey = row.startedAt.toISOString().slice(0, 10);
    const weight = Number(row.weight);
    const volume = weight * row.reps;
    const existing = byDate.get(dateKey);

    if (!existing) {
      byDate.set(dateKey, {
        date: row.startedAt,
        maxWeight: weight,
        totalVolume: volume,
      });
    } else {
      byDate.set(dateKey, {
        date: existing.date,
        maxWeight: Math.max(existing.maxWeight, weight),
        totalVolume: existing.totalVolume + volume,
      });
    }
  }

  return Array.from(byDate.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}

export async function getExerciseNames(userId: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ name: exercises.name })
    .from(exercises)
    .innerJoin(workouts, eq(exercises.workoutId, workouts.id))
    .where(eq(workouts.userId, userId))
    .orderBy(exercises.name);

  return rows.map((r) => r.name);
}
