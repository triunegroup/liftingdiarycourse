"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { workouts, exercises, sets } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getWorkout(workoutId: number, userId: string) {
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      exercises: {
        with: { sets: true },
        orderBy: (exercises, { asc }) => [asc(exercises.orderInWorkout)],
      },
    },
  });

  return workout ?? null;
}

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

interface UpdateWorkoutInput {
  name: string;
  exercises: ExerciseInput[];
}

export async function updateWorkout(
  workoutId: number,
  userId: string,
  input: UpdateWorkoutInput
) {
  // Verify ownership
  const existing = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  });
  if (!existing) redirect("/dashboard");

  // Update workout name
  await db
    .update(workouts)
    .set({ name: input.name || null, updatedAt: new Date() })
    .where(eq(workouts.id, workoutId));

  // Delete all existing exercises (cascade deletes sets)
  await db.delete(exercises).where(eq(exercises.workoutId, workoutId));

  // Re-insert exercises and sets
  for (let i = 0; i < input.exercises.length; i++) {
    const ex = input.exercises[i];
    if (!ex.name.trim()) continue;

    const [exercise] = await db
      .insert(exercises)
      .values({
        workoutId,
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

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
