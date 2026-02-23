import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { workouts, exercises, sets } from "./schema";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const USER_ID = "user_39WbJ2nbh3DFLSZW4thzCedMPJB";

async function seed() {
  console.log("Seeding database…");

  // ── Workout 1: Push Day (today, morning) ─────────────────
  const today = new Date();
  today.setHours(9, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(10, 15, 0, 0);

  const [pushDay] = await db
    .insert(workouts)
    .values({
      userId: USER_ID,
      name: "Push Day",
      startedAt: today,
      completedAt: todayEnd,
    })
    .returning();

  const [bench] = await db
    .insert(exercises)
    .values({
      workoutId: pushDay.id,
      name: "Bench Press",
      orderInWorkout: 0,
    })
    .returning();

  await db.insert(sets).values([
    { exerciseId: bench.id, order: 1, weight: "60.00", reps: 10, setType: "warmup" },
    { exerciseId: bench.id, order: 2, weight: "80.00", reps: 8, setType: "working" },
    { exerciseId: bench.id, order: 3, weight: "80.00", reps: 8, setType: "working" },
    { exerciseId: bench.id, order: 4, weight: "85.00", reps: 6, setType: "working" },
  ]);

  const [ohp] = await db
    .insert(exercises)
    .values({
      workoutId: pushDay.id,
      name: "Overhead Press",
      orderInWorkout: 1,
      notes: "Felt strong today",
    })
    .returning();

  await db.insert(sets).values([
    { exerciseId: ohp.id, order: 1, weight: "40.00", reps: 10, setType: "working" },
    { exerciseId: ohp.id, order: 2, weight: "40.00", reps: 8, setType: "working" },
    { exerciseId: ohp.id, order: 3, weight: "45.00", reps: 6, setType: "working" },
  ]);

  const [triceps] = await db
    .insert(exercises)
    .values({
      workoutId: pushDay.id,
      name: "Tricep Pushdowns",
      orderInWorkout: 2,
    })
    .returning();

  await db.insert(sets).values([
    { exerciseId: triceps.id, order: 1, weight: "25.00", reps: 12, setType: "working" },
    { exerciseId: triceps.id, order: 2, weight: "25.00", reps: 12, setType: "working" },
    { exerciseId: triceps.id, order: 3, weight: "25.00", reps: 10, setType: "working" },
  ]);

  console.log(`  ✓ Push Day (id: ${pushDay.id})`);

  // ── Workout 2: Pull Day (yesterday) ──────────────────────
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(10, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(11, 20, 0, 0);

  const [pullDay] = await db
    .insert(workouts)
    .values({
      userId: USER_ID,
      name: "Pull Day",
      startedAt: yesterday,
      completedAt: yesterdayEnd,
    })
    .returning();

  const [deadlift] = await db
    .insert(exercises)
    .values({
      workoutId: pullDay.id,
      name: "Deadlift",
      orderInWorkout: 0,
    })
    .returning();

  await db.insert(sets).values([
    { exerciseId: deadlift.id, order: 1, weight: "60.00", reps: 8, setType: "warmup" },
    { exerciseId: deadlift.id, order: 2, weight: "100.00", reps: 5, setType: "working" },
    { exerciseId: deadlift.id, order: 3, weight: "120.00", reps: 3, setType: "working" },
    { exerciseId: deadlift.id, order: 4, weight: "140.00", reps: 1, setType: "working" },
  ]);

  const [rows] = await db
    .insert(exercises)
    .values({
      workoutId: pullDay.id,
      name: "Barbell Rows",
      orderInWorkout: 1,
    })
    .returning();

  await db.insert(sets).values([
    { exerciseId: rows.id, order: 1, weight: "60.00", reps: 10, setType: "working" },
    { exerciseId: rows.id, order: 2, weight: "60.00", reps: 10, setType: "working" },
    { exerciseId: rows.id, order: 3, weight: "65.00", reps: 8, setType: "working" },
  ]);

  const [curls] = await db
    .insert(exercises)
    .values({
      workoutId: pullDay.id,
      name: "Bicep Curls",
      orderInWorkout: 2,
      notes: "Slow negatives",
    })
    .returning();

  await db.insert(sets).values([
    { exerciseId: curls.id, order: 1, weight: "15.00", reps: 12, setType: "working" },
    { exerciseId: curls.id, order: 2, weight: "15.00", reps: 10, setType: "working" },
    { exerciseId: curls.id, order: 3, weight: "17.50", reps: 8, setType: "working" },
  ]);

  console.log(`  ✓ Pull Day (id: ${pullDay.id})`);

  // ── Workout 3: Leg Day (2 days ago) ──────────────────────
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(7, 30, 0, 0);
  const twoDaysAgoEnd = new Date(twoDaysAgo);
  twoDaysAgoEnd.setHours(8, 45, 0, 0);

  const [legDay] = await db
    .insert(workouts)
    .values({
      userId: USER_ID,
      name: "Leg Day",
      startedAt: twoDaysAgo,
      completedAt: twoDaysAgoEnd,
    })
    .returning();

  const [squat] = await db
    .insert(exercises)
    .values({
      workoutId: legDay.id,
      name: "Back Squat",
      orderInWorkout: 0,
    })
    .returning();

  await db.insert(sets).values([
    { exerciseId: squat.id, order: 1, weight: "60.00", reps: 8, setType: "warmup" },
    { exerciseId: squat.id, order: 2, weight: "90.00", reps: 5, setType: "working" },
    { exerciseId: squat.id, order: 3, weight: "100.00", reps: 5, setType: "working" },
    { exerciseId: squat.id, order: 4, weight: "110.00", reps: 3, setType: "working" },
  ]);

  const [legPress] = await db
    .insert(exercises)
    .values({
      workoutId: legDay.id,
      name: "Leg Press",
      orderInWorkout: 1,
    })
    .returning();

  await db.insert(sets).values([
    { exerciseId: legPress.id, order: 1, weight: "140.00", reps: 10, setType: "working" },
    { exerciseId: legPress.id, order: 2, weight: "160.00", reps: 8, setType: "working" },
    { exerciseId: legPress.id, order: 3, weight: "180.00", reps: 6, setType: "working" },
  ]);

  const [rdl] = await db
    .insert(exercises)
    .values({
      workoutId: legDay.id,
      name: "Romanian Deadlift",
      orderInWorkout: 2,
      notes: "Focus on hamstring stretch",
    })
    .returning();

  await db.insert(sets).values([
    { exerciseId: rdl.id, order: 1, weight: "70.00", reps: 10, setType: "working" },
    { exerciseId: rdl.id, order: 2, weight: "70.00", reps: 10, setType: "working" },
    { exerciseId: rdl.id, order: 3, weight: "80.00", reps: 8, setType: "working" },
  ]);

  console.log(`  ✓ Leg Day (id: ${legDay.id})`);

  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
