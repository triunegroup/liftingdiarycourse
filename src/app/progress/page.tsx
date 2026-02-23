import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getPersonalRecords,
  getExerciseHistory,
  getExerciseNames,
} from "./actions";
import { ProgressShell } from "./progress-shell";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const params = await searchParams;
  const [prs, exerciseNames] = await Promise.all([
    getPersonalRecords(userId),
    getExerciseNames(userId),
  ]);

  const selectedExercise = params.exercise ?? exerciseNames[0] ?? null;
  const history = selectedExercise
    ? await getExerciseHistory(userId, selectedExercise)
    : [];

  return (
    <ProgressShell
      prs={prs}
      exerciseNames={exerciseNames}
      selectedExercise={selectedExercise}
      history={history}
    />
  );
}
