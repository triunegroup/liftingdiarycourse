import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  decimal,
  date,
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

// ── Templates ────────────────────────────────────────────────

export const templates = pgTable(
  "templates",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("templates_user_id_idx").on(t.userId)]
);

export const templatesRelations = relations(templates, ({ many }) => ({
  exercises: many(templateExercises),
}));

export const templateExercises = pgTable(
  "template_exercises",
  {
    id: serial("id").primaryKey(),
    templateId: integer("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    orderInTemplate: integer("order_in_template").notNull().default(0),
    notes: text("notes"),
  },
  (t) => [index("template_exercises_template_id_idx").on(t.templateId)]
);

export const templateExercisesRelations = relations(
  templateExercises,
  ({ one, many }) => ({
    template: one(templates, {
      fields: [templateExercises.templateId],
      references: [templates.id],
    }),
    sets: many(templateSets),
  })
);

export const templateSets = pgTable(
  "template_sets",
  {
    id: serial("id").primaryKey(),
    templateExerciseId: integer("template_exercise_id")
      .notNull()
      .references(() => templateExercises.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(1),
    weight: decimal("weight", { precision: 10, scale: 2 }).notNull(),
    reps: integer("reps").notNull(),
    setType: varchar("set_type", { length: 50 }).default("working"),
  },
  (t) => [
    index("template_sets_exercise_id_idx").on(t.templateExerciseId),
  ]
);

export const templateSetsRelations = relations(templateSets, ({ one }) => ({
  exercise: one(templateExercises, {
    fields: [templateSets.templateExerciseId],
    references: [templateExercises.id],
  }),
}));

// ── Body Weight ──────────────────────────────────────────────

export const bodyWeightEntries = pgTable(
  "body_weight_entries",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: date("date").notNull(),
    weight: decimal("weight", { precision: 6, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("body_weight_entries_user_id_idx").on(t.userId),
    index("body_weight_entries_date_idx").on(t.date),
  ]
);

// ── Inferred types ──────────────────────────────────────────

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;

export type TemplateExercise = typeof templateExercises.$inferSelect;
export type NewTemplateExercise = typeof templateExercises.$inferInsert;

export type TemplateSet = typeof templateSets.$inferSelect;
export type NewTemplateSet = typeof templateSets.$inferInsert;

export type BodyWeightEntry = typeof bodyWeightEntries.$inferSelect;
export type NewBodyWeightEntry = typeof bodyWeightEntries.$inferInsert;

