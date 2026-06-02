import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const lastWeekStart = subWeeks(weekStart, 1);
  const lastWeekEnd = subWeeks(weekEnd, 1);

  const workouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      date: { gte: weekStart, lte: weekEnd },
    },
    select: { date: true, durationMin: true },
  });

  const lastWeekWorkouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      date: { gte: lastWeekStart, lte: lastWeekEnd },
    },
    select: { date: true, durationMin: true },
  });

  const daysWorkedOut = workouts.map((w) => {
    const day = new Date(w.date).getDay();
    return String(day === 0 ? 6 : day - 1);
  });

  const thisWeekMinutes = workouts.reduce((sum, w) => sum + w.durationMin, 0);
  const lastWeekMinutes = lastWeekWorkouts.reduce((sum, w) => sum + w.durationMin, 0);

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthWorkouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      date: { gte: monthStart, lte: monthEnd },
    },
    select: { date: true, durationMin: true },
  });

  const monthTotalMinutes = monthWorkouts.reduce((sum, w) => sum + w.durationMin, 0);
  const monthTotalWorkouts = monthWorkouts.length;

  return NextResponse.json({
    workoutsThisWeek: workouts.length,
    daysWorkedOut,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    lastWeekWorkouts: lastWeekWorkouts.length,
    thisWeekMinutes,
    lastWeekMinutes,
    monthTotalMinutes,
    monthTotalWorkouts,
  });
}
