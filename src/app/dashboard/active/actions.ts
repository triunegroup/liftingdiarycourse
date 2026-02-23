"use server";

import { db } from "@/db";
import { workouts, exercises, sets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function startWorkout(userId: string, name?: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name: name || null, startedAt: new Date() })
    .returning({ id: workouts.id });

  return workout.id;
}

export async function getActiveWorkout(workoutId: number, userId: string) {
  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      exercises: {
        with: { sets: true },
        orderBy: (e, { asc }) => [asc(e.orderInWorkout)],
      },
    },
  });
}

export async function addExerciseToWorkout(
  workoutId: number,
  userId: string,
  name: string
) {
  // Verify ownership
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  });
  if (!workout) return;

  const existingCount = await db.query.exercises.findMany({
    where: eq(exercises.workoutId, workoutId),
  });

  await db.insert(exercises).values({
    workoutId,
    name: name.trim(),
    orderInWorkout: existingCount.length,
  });

  revalidatePath(`/dashboard/active`);
}

export async function logSet(
  exerciseId: number,
  userId: string,
  weight: string,
  reps: number,
  setType: string
) {
  // Verify ownership via join
  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
    with: { workout: true },
  });
  if (!exercise || exercise.workout.userId !== userId) return;

  const existingSets = await db.query.sets.findMany({
    where: eq(sets.exerciseId, exerciseId),
  });

  await db.insert(sets).values({
    exerciseId,
    order: existingSets.length + 1,
    weight: weight || "0",
    reps,
    setType,
  });

  revalidatePath(`/dashboard/active`);
}

export async function deleteSet(setId: number, userId: string) {
  const set = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: { exercise: { with: { workout: true } } },
  });
  if (!set || set.exercise.workout.userId !== userId) return;

  await db.delete(sets).where(eq(sets.id, setId));
  revalidatePath(`/dashboard/active`);
}

export async function finishWorkout(workoutId: number, userId: string) {
  await db
    .update(workouts)
    .set({ completedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
