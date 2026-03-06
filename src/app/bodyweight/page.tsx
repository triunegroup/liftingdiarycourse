import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getBodyWeightEntries } from "./actions";
import { BodyWeightShell } from "./bodyweight-shell";

export default async function BodyWeightPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const entries = await getBodyWeightEntries(userId);

  return <BodyWeightShell entries={entries} userId={userId} />;
}
