"use client";

import { useState, useTransition, useEffect } from "react";
import { CheckCircle2, Plus, Timer, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  addExerciseToWorkout,
  logSet,
  deleteSet,
  finishWorkout,
} from "./actions";

interface WorkoutSet {
  id: number;
  order: number;
  weight: string;
  reps: number;
  setType: string | null;
}

interface WorkoutExercise {
  id: number;
  name: string;
  sets: WorkoutSet[];
}

interface ActiveWorkoutData {
  id: number;
  name: string | null;
  startedAt: Date;
  exercises: WorkoutExercise[];
}

const SET_TYPES = [
  { value: "working", label: "Working" },
  { value: "warmup", label: "Warmup" },
  { value: "drop", label: "Drop" },
  { value: "failure", label: "Failure" },
] as const;

function useElapsedTime(startedAt: Date) {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface SetRowProps {
  set: WorkoutSet;
  userId: string;
}

function SetRow({ set, userId }: SetRowProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={`flex items-center gap-3 text-sm ${isPending ? "opacity-50" : ""}`}
    >
      <span className="w-6 text-right tabular-nums text-muted-foreground">
        {set.order}.
      </span>
      <span className="tabular-nums">
        {Number(set.weight) > 0
          ? `${Number(set.weight)} kg × ${set.reps}`
          : `${set.reps} reps`}
      </span>
      {set.setType && set.setType !== "working" && (
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {set.setType}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto size-6"
        disabled={isPending}
        onClick={() =>
          startTransition(() => deleteSet(set.id, userId))
        }
      >
        <Trash2 className="size-3" />
      </Button>
    </div>
  );
}

interface AddSetFormProps {
  exerciseId: number;
  userId: string;
}

function AddSetForm({ exerciseId, userId }: AddSetFormProps) {
  const [isPending, startTransition] = useTransition();
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [setType, setSetType] = useState("working");

  function handleAdd() {
    const parsedReps = parseInt(reps);
    if (!parsedReps || parsedReps <= 0) return;

    startTransition(async () => {
      await logSet(exerciseId, userId, weight || "0", parsedReps, setType);
      setWeight("");
      setReps("");
      setSetType("working");
    });
  }

  return (
    <div className="flex items-center gap-2 pt-1">
      <Input
        type="number"
        placeholder="Weight"
        className="w-24"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        min="0"
        step="0.5"
        disabled={isPending}
      />
      <span className="text-sm text-muted-foreground">kg ×</span>
      <Input
        type="number"
        placeholder="Reps"
        className="w-20"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        min="1"
        disabled={isPending}
      />
      <Select value={setType} onValueChange={setSetType} disabled={isPending}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SET_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        size="sm"
        onClick={handleAdd}
        disabled={isPending || !reps}
      >
        <Plus className="size-4" />
        Log Set
      </Button>
    </div>
  );
}

interface AddExerciseFormProps {
  workoutId: number;
  userId: string;
}

function AddExerciseForm({ workoutId, userId }: AddExerciseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  function handleAdd() {
    if (!name.trim()) return;
    startTransition(async () => {
      await addExerciseToWorkout(workoutId, userId, name);
      setName("");
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add Exercise
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        autoFocus
        placeholder="Exercise name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        disabled={isPending}
        className="max-w-xs"
      />
      <Button
        type="button"
        onClick={handleAdd}
        disabled={isPending || !name.trim()}
      >
        Add
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setName("");
          setOpen(false);
        }}
        disabled={isPending}
      >
        Cancel
      </Button>
    </div>
  );
}

export function ActiveWorkout({
  workout,
  userId,
}: {
  workout: ActiveWorkoutData;
  userId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const elapsed = useElapsedTime(workout.startedAt);

  function handleFinish() {
    startTransition(() => finishWorkout(workout.id, userId));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {workout.name || "Active Workout"}
          </h1>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
            <Timer className="size-4" />
            <span className="tabular-nums font-mono">{elapsed}</span>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isPending}>
              <CheckCircle2 className="size-4" />
              Finish Workout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finish workout?</AlertDialogTitle>
              <AlertDialogDescription>
                This will save your workout and record the finish time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Going</AlertDialogCancel>
              <AlertDialogAction onClick={handleFinish}>
                Finish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Exercises */}
      {workout.exercises.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No exercises yet. Add your first exercise below.
        </p>
      )}

      {workout.exercises.map((exercise) => (
        <Card key={exercise.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{exercise.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {exercise.sets.length > 0 && (
              <div className="space-y-1">
                {exercise.sets.map((set) => (
                  <SetRow key={set.id} set={set} userId={userId} />
                ))}
              </div>
            )}
            <AddSetForm exerciseId={exercise.id} userId={userId} />
          </CardContent>
        </Card>
      ))}

      <AddExerciseForm workoutId={workout.id} userId={userId} />
    </div>
  );
}
