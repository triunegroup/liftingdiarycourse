import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkout } from "./actions";
import { EditWorkoutForm } from "./edit-workout-form";

export default async function EditWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const params = await searchParams;
  const workoutId = Number(params.id);
  if (!workoutId) redirect("/dashboard");

  const workout = await getWorkout(workoutId, userId);
  if (!workout) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl p-6">
      <EditWorkoutForm workout={workout} userId={userId} />
    </div>
  );
}
