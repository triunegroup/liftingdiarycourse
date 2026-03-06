"use server";

import { db } from "@/db";
import { bodyWeightEntries } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getBodyWeightEntries(userId: string) {
  return db.query.bodyWeightEntries.findMany({
    where: eq(bodyWeightEntries.userId, userId),
    orderBy: (t, { asc }) => [asc(t.date)],
  });
}

export async function logBodyWeight(userId: string, date: string, weight: string) {
  const existing = await db.query.bodyWeightEntries.findFirst({
    where: and(
      eq(bodyWeightEntries.userId, userId),
      eq(bodyWeightEntries.date, date)
    ),
  });

  if (existing) {
    await db
      .update(bodyWeightEntries)
      .set({ weight })
      .where(eq(bodyWeightEntries.id, existing.id));
  } else {
    await db.insert(bodyWeightEntries).values({ userId, date, weight });
  }

  revalidatePath("/bodyweight");
}

export async function deleteBodyWeightEntry(entryId: number, userId: string) {
  await db
    .delete(bodyWeightEntries)
    .where(
      and(eq(bodyWeightEntries.id, entryId), eq(bodyWeightEntries.userId, userId))
    );

  revalidatePath("/bodyweight");
}
