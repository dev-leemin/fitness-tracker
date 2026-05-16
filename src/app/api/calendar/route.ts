import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const workouts = await prisma.workout.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      exerciseType: { select: { name: true, icon: true, category: true } },
      photos: { select: { id: true } },
    },
    orderBy: { date: "asc" },
  });

  const calendarData = workouts.map((w) => ({
    date: w.date.toISOString().split("T")[0],
    exerciseType: w.exerciseType.name,
    icon: w.exerciseType.icon,
    category: w.exerciseType.category,
    durationMin: w.durationMin,
    distanceKm: w.distanceKm,
    hasPhoto: w.photos.length > 0,
    workoutId: w.id,
  }));

  return NextResponse.json(calendarData);
}
