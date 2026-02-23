import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getWorkoutsByDate } from "./actions";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const params = await searchParams;
  const dateStr = params.date ?? format(new Date(), "yyyy-MM-dd");
  const workouts = await getWorkoutsByDate(userId, dateStr);

  return <DashboardShell dateStr={dateStr} workouts={workouts} userId={userId} />;
}
