"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateWorkout } from "./actions";

interface SetState {
  weight: string;
  reps: string;
  setType: string;
}

interface ExerciseState {
  name: string;
  notes: string;
  sets: SetState[];
}

function emptySet(): SetState {
  return { weight: "", reps: "", setType: "working" };
}

function emptyExercise(): ExerciseState {
  return { name: "", notes: "", sets: [emptySet()] };
}

const SET_TYPES = [
  { value: "working", label: "Working" },
  { value: "warmup", label: "Warmup" },
  { value: "drop", label: "Drop" },
  { value: "failure", label: "Failure" },
] as const;

interface WorkoutData {
  id: number;
  name: string | null;
  exercises: {
    name: string;
    notes: string | null;
    sets: {
      weight: string;
      reps: number;
      setType: string | null;
    }[];
  }[];
}

interface EditWorkoutFormProps {
  workout: WorkoutData;
  userId: string;
}

export function EditWorkoutForm({ workout, userId }: EditWorkoutFormProps) {
  const [isPending, startTransition] = useTransition();
  const [workoutName, setWorkoutName] = useState(workout.name ?? "");
  const [exercises, setExercises] = useState<ExerciseState[]>(() =>
    workout.exercises.length > 0
      ? workout.exercises.map((ex) => ({
          name: ex.name,
          notes: ex.notes ?? "",
          sets:
            ex.sets.length > 0
              ? ex.sets.map((s) => ({
                  weight: Number(s.weight) > 0 ? String(Number(s.weight)) : "",
                  reps: String(s.reps),
                  setType: s.setType ?? "working",
                }))
              : [emptySet()],
        }))
      : [emptyExercise()]
  );

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(exIndex: number) {
    setExercises((prev) => prev.filter((_, i) => i !== exIndex));
  }

  function updateExercise(
    exIndex: number,
    field: "name" | "notes",
    value: string
  ) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIndex ? { ...ex, [field]: value } : ex))
    );
  }

  function addSet(exIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex ? { ...ex, sets: [...ex.sets, emptySet()] } : ex
      )
    );
  }

  function removeSet(exIndex: number, setIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) }
          : ex
      )
    );
  }

  function updateSet(
    exIndex: number,
    setIndex: number,
    field: keyof SetState,
    value: string
  ) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j === setIndex ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateWorkout(workout.id, userId, {
        name: workoutName,
        exercises: exercises.map((ex) => ({
          name: ex.name,
          notes: ex.notes,
          sets: ex.sets.map((s) => ({
            weight: s.weight || "0",
            reps: parseInt(s.reps) || 0,
            setType: s.setType,
          })),
        })),
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Workout</h2>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workout-name">Workout Name</Label>
        <Input
          id="workout-name"
          placeholder="e.g. Push Day, Upper Body"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
        />
      </div>

      {exercises.map((exercise, exIndex) => (
        <Card key={exIndex}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">
              Exercise {exIndex + 1}
            </CardTitle>
            {exercises.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeExercise(exIndex)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`ex-name-${exIndex}`}>Name</Label>
                <Input
                  id={`ex-name-${exIndex}`}
                  placeholder="e.g. Bench Press"
                  value={exercise.name}
                  onChange={(e) =>
                    updateExercise(exIndex, "name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`ex-notes-${exIndex}`}>Notes</Label>
                <Input
                  id={`ex-notes-${exIndex}`}
                  placeholder="Optional"
                  value={exercise.notes}
                  onChange={(e) =>
                    updateExercise(exIndex, "notes", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sets</Label>
              <div className="space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center gap-2">
                    <span className="w-6 text-right text-sm text-muted-foreground tabular-nums">
                      {setIndex + 1}.
                    </span>
                    <Input
                      type="number"
                      placeholder="Weight"
                      className="w-24"
                      value={set.weight}
                      onChange={(e) =>
                        updateSet(exIndex, setIndex, "weight", e.target.value)
                      }
                      min="0"
                      step="0.5"
                    />
                    <span className="text-sm text-muted-foreground">kg</span>
                    <span className="text-sm text-muted-foreground">×</span>
                    <Input
                      type="number"
                      placeholder="Reps"
                      className="w-20"
                      value={set.reps}
                      onChange={(e) =>
                        updateSet(exIndex, setIndex, "reps", e.target.value)
                      }
                      min="0"
                    />
                    <Select
                      value={set.setType}
                      onValueChange={(value) =>
                        updateSet(exIndex, setIndex, "setType", value)
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SET_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {exercise.sets.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeSet(exIndex, setIndex)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSet(exIndex)}
              >
                <Plus /> Add Set
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={addExercise}>
          <Plus /> Add Exercise
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
