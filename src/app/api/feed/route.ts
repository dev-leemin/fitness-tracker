import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const cursor = searchParams.get("cursor");

  const workouts = await prisma.workout.findMany({
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      date: true,
      durationMin: true,
      distanceKm: true,
      calories: true,
      createdAt: true,
      exerciseType: {
        select: { name: true, icon: true, category: true },
      },
      user: {
        select: { nickname: true, name: true },
      },
    },
  });

  const nextCursor = workouts.length === limit ? workouts[workouts.length - 1].id : null;

  return NextResponse.json({
    workouts: workouts.map((w) => ({
      id: w.id,
      date: w.date,
      durationMin: w.durationMin,
      distanceKm: w.distanceKm,
      calories: w.calories,
      createdAt: w.createdAt,
      exerciseType: w.exerciseType,
      userName: w.user.nickname || w.user.name || "익명",
    })),
    nextCursor,
  });
}
