import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { NewWorkoutForm } from "./new-workout-form";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const params = await searchParams;
  const dateStr = params.date ?? format(new Date(), "yyyy-MM-dd");

  return (
    <div className="mx-auto max-w-2xl p-6">
      <NewWorkoutForm dateStr={dateStr} userId={userId} />
    </div>
  );
}
