import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutSummary } from "./actions";
import { SummaryShell } from "./summary-shell";

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const params = await searchParams;
  const workoutId = params.id ? parseInt(params.id) : null;
  if (!workoutId) redirect("/dashboard");

  const summary = await getWorkoutSummary(workoutId, userId);
  if (!summary) redirect("/dashboard");

  return <SummaryShell summary={summary} />;
}
