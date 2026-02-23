"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  selectedDate: Date;
}

export function DatePicker({ selectedDate }: DatePickerProps) {
  const router = useRouter();

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    router.push(`/dashboard?date=${dateStr}`);
  }

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleSelect}
      className="rounded-lg border"
    />
  );
}
