"use client";

import Link from "next/link";
import { format, differenceInMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Workout, Exercise, Set } from "@/db/schema";

type WorkoutWithExercises = Workout & {
  exercises: (Exercise & { sets: Set[] })[];
};

interface HistoryShellProps {
  workouts: WorkoutWithExercises[];
}

export function HistoryShell({ workouts }: HistoryShellProps) {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Workout History</h1>

      {workouts.length === 0 ? (
        <p className="text-muted-foreground">No workouts logged yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Workout</TableHead>
              <TableHead>Exercises</TableHead>
              <TableHead>Sets</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workouts.map((workout) => {
              const totalSets = workout.exercises.reduce(
                (sum, ex) => sum + ex.sets.length,
                0
              );
              const duration =
                workout.completedAt
                  ? `${differenceInMinutes(workout.completedAt, workout.startedAt)} min`
                  : "—";

              return (
                <TableRow key={workout.id}>
                  <TableCell>
                    {format(workout.startedAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{workout.name ?? "Workout"}</TableCell>
                  <TableCell>{workout.exercises.length}</TableCell>
                  <TableCell>{totalSets}</TableCell>
                  <TableCell>{duration}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/edit?id=${workout.id}`}>
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
