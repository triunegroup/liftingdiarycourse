"use server";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getWorkoutHistory(userId: string) {
  return db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
    with: {
      exercises: { with: { sets: true } },
    },
    orderBy: [desc(workouts.startedAt)],
  });
}
