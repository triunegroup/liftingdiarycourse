import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getActiveWorkout } from "./actions";
import { ActiveWorkout } from "./active-workout";

export default async function ActiveWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const params = await searchParams;
  const workoutId = params.id ? parseInt(params.id) : null;
  if (!workoutId) redirect("/dashboard");

  const workout = await getActiveWorkout(workoutId, userId);
  if (!workout) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl p-6">
      <ActiveWorkout workout={workout} userId={userId} />
    </div>
  );
}
