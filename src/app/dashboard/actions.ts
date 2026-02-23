"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";

export async function getWorkoutsByDate(userId: string, date: string) {
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T00:00:00`);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, dayStart),
      lt(workouts.startedAt, dayEnd)
    ),
    with: {
      exercises: {
        with: { sets: true },
        orderBy: (exercises, { asc }) => [asc(exercises.orderInWorkout)],
      },
    },
    orderBy: (workouts, { asc }) => [asc(workouts.startedAt)],
  });
}

export async function deleteWorkout(workoutId: number, userId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  revalidatePath("/dashboard");
}
