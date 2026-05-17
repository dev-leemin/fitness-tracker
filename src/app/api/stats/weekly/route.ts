import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { weeklyGoal: true },
  });

  const goal = user?.weeklyGoal || 3;
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // This week's workouts
  const workouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      date: { gte: weekStart, lte: weekEnd },
    },
    select: { date: true },
  });

  const daysWorkedOut = workouts.map((w) => {
    const day = new Date(w.date).getDay();
    return String(day === 0 ? 6 : day - 1);
  });

  // Monthly achievement rate: how many weeks this month met the goal
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weeksInMonth = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  const monthWorkouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      date: { gte: monthStart, lte: monthEnd },
    },
    select: { date: true },
  });

  let weeksCompleted = 0;
  let totalWeeksPassed = 0;

  for (const wkStart of weeksInMonth) {
    const wkEnd = endOfWeek(wkStart, { weekStartsOn: 1 });
    // Only count weeks that have fully passed or are the current week
    if (wkStart > now) break;
    totalWeeksPassed++;

    const countInWeek = monthWorkouts.filter((w) => {
      const d = new Date(w.date);
      return d >= wkStart && d <= wkEnd;
    }).length;

    if (countInWeek >= goal) {
      weeksCompleted++;
    }
  }

  const monthlyRate = totalWeeksPassed > 0 ? Math.round((weeksCompleted / totalWeeksPassed) * 100) : 0;

  return NextResponse.json({
    workoutsThisWeek: workouts.length,
    goal,
    daysWorkedOut,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    monthlyRate,
    weeksCompleted,
    totalWeeksPassed,
  });
}
