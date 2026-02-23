import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Dumbbell, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const features = [
  {
    icon: Dumbbell,
    title: "Log Workouts",
    description:
      "Quickly log your sets, reps, and weight. No fluff — just the numbers that matter.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description:
      "See your strength grow over time with clear progress tracking across every lift.",
  },
  {
    icon: Calendar,
    title: "Stay Consistent",
    description:
      "Never miss a session. Your full workout history keeps you accountable.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex w-full flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
        <h1 className="max-w-2xl text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Track Your Gains
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          The no-nonsense lifting diary. Log every set, track every PR, and
          watch yourself get stronger — one workout at a time.
        </p>
        <div className="mt-4 flex gap-4">
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" className="text-base">
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button size="lg" className="text-base" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </SignedIn>
          <Button variant="outline" size="lg" className="text-base" asChild>
            <a href="#features">Learn More</a>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="grid w-full max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3"
      >
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="size-10 text-primary" />
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      {/* CTA Footer */}
      <section className="flex w-full flex-col items-center gap-6 px-6 py-24 text-center">
        <h2 className="max-w-xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Your strongest self is waiting.
        </h2>
        <p className="text-muted-foreground">
          Start logging today — it&apos;s free.
        </p>
        <SignedOut>
          <SignUpButton mode="modal">
            <Button size="lg" className="text-base">
              Get Started
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Button size="lg" className="text-base" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </SignedIn>
      </section>
    </div>
  );
}
