import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutHistory } from "./actions";
import { HistoryShell } from "./history-shell";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const workouts = await getWorkoutHistory(userId);

  return <HistoryShell workouts={workouts} />;
}
