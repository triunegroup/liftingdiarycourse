import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Workouts ────────────────────────────────────────────────

export const workouts = pgTable(
  "workouts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: varchar("name", { length: 255 }),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("workouts_user_id_idx").on(t.userId),
    index("workouts_started_at_idx").on(t.startedAt),
  ]
);

export const workoutsRelations = relations(workouts, ({ many }) => ({
  exercises: many(exercises),
}));

// ── Exercises ───────────────────────────────────────────────

export const exercises = pgTable(
  "exercises",
  {
    id: serial("id").primaryKey(),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    orderInWorkout: integer("order_in_workout").notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("exercises_workout_id_idx").on(t.workoutId)]
);

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
  sets: many(sets),
}));

// ── Sets ────────────────────────────────────────────────────

export const sets = pgTable(
  "sets",
  {
    id: serial("id").primaryKey(),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(1),
    weight: decimal("weight", { precision: 10, scale: 2 }).notNull(),
    reps: integer("reps").notNull(),
    setType: varchar("set_type", { length: 50 }).default("working"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("sets_exercise_id_idx").on(t.exerciseId)]
);

export const setsRelations = relations(sets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [sets.exerciseId],
    references: [exercises.id],
  }),
}));

// ── Inferred types ──────────────────────────────────────────

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;

