import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ streak: 0 });
  }

  // Get all workout dates for this user, ordered descending
  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  if (workouts.length === 0) {
    return NextResponse.json({ streak: 0 });
  }

  // Calculate consecutive days streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutDates = new Set(
    workouts.map((w) => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  // Check from today backwards
  const checkDate = new Date(today);

  // If no workout today, start from yesterday
  if (!workoutDates.has(checkDate.getTime())) {
    checkDate.setDate(checkDate.getDate() - 1);
    if (!workoutDates.has(checkDate.getTime())) {
      return NextResponse.json({ streak: 0 });
    }
  }

  // Count consecutive days
  while (workoutDates.has(checkDate.getTime())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return NextResponse.json({ streak });
}
