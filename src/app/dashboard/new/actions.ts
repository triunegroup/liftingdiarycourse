"use server";

import { db } from "@/db";
import { workouts, exercises, sets } from "@/db/schema";
import { redirect } from "next/navigation";

interface SetInput {
  weight: string;
  reps: number;
  setType: string;
}

interface ExerciseInput {
  name: string;
  notes: string;
  sets: SetInput[];
}

interface CreateWorkoutInput {
  name: string;
  date: string;
  exercises: ExerciseInput[];
}

export async function createWorkout(userId: string, input: CreateWorkoutInput) {
  const startedAt = new Date(`${input.date}T00:00:00`);

  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: input.name || null,
      startedAt,
    })
    .returning({ id: workouts.id });

  for (let i = 0; i < input.exercises.length; i++) {
    const ex = input.exercises[i];
    if (!ex.name.trim()) continue;

    const [exercise] = await db
      .insert(exercises)
      .values({
        workoutId: workout.id,
        name: ex.name.trim(),
        orderInWorkout: i,
        notes: ex.notes.trim() || null,
      })
      .returning({ id: exercises.id });

    const setValues = ex.sets
      .filter((s) => s.reps > 0)
      .map((s, j) => ({
        exerciseId: exercise.id,
        order: j + 1,
        weight: s.weight || "0",
        reps: s.reps,
        setType: s.setType || "working",
      }));

    if (setValues.length > 0) {
      await db.insert(sets).values(setValues);
    }
  }

  redirect(`/dashboard?date=${input.date}`);
}
