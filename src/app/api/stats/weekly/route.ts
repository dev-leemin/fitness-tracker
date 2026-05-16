import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 월요일 시작
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const workouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    select: { date: true },
  });

  const daysWorkedOut = workouts.map((w) => {
    const day = new Date(w.date).getDay();
    // 일요일(0)을 6으로, 나머지는 -1
    return String(day === 0 ? 6 : day - 1);
  });

  return NextResponse.json({
    workoutsThisWeek: workouts.length,
    goal: 3,
    daysWorkedOut,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
  });
}
