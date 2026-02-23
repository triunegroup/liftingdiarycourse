"use server";

import { db } from "@/db";
import { workouts, templates, templateExercises, templateSets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveTemplate(userId: string, workoutId: number) {
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: { exercises: { with: { sets: true } } },
  });
  if (!workout) return;

  const [template] = await db
    .insert(templates)
    .values({ userId, name: workout.name || "Workout Template" })
    .returning({ id: templates.id });

  for (const ex of workout.exercises) {
    const [tmplEx] = await db
      .insert(templateExercises)
      .values({
        templateId: template.id,
        name: ex.name,
        orderInTemplate: ex.orderInWorkout,
        notes: ex.notes,
      })
      .returning({ id: templateExercises.id });

    const setValues = ex.sets.map((s) => ({
      templateExerciseId: tmplEx.id,
      order: s.order,
      weight: s.weight,
      reps: s.reps,
      setType: s.setType ?? "working",
    }));

    if (setValues.length > 0) {
      await db.insert(templateSets).values(setValues);
    }
  }

  revalidatePath("/dashboard");
}

export async function getTemplates(userId: string) {
  return db.query.templates.findMany({
    where: eq(templates.userId, userId),
    with: {
      exercises: {
        with: { sets: true },
        orderBy: (e, { asc }) => [asc(e.orderInTemplate)],
      },
    },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
}

export async function deleteTemplate(templateId: number, userId: string) {
  await db
    .delete(templates)
    .where(and(eq(templates.id, templateId), eq(templates.userId, userId)));
  revalidatePath("/dashboard");
}
