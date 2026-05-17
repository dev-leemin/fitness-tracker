import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [workouts, total] = await Promise.all([
    prisma.workout.findMany({
      where: { userId: session.user.id },
      include: {
        exerciseType: true,
        photos: { select: { id: true, filePath: true } },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.workout.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    workouts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { exerciseTypeId, date, durationMin, distanceKm, calories, intensity, memo, location, link } = body;

    if (!exerciseTypeId || !date || !durationMin) {
      return NextResponse.json(
        { error: "운동 종류, 날짜, 시간은 필수입니다." },
        { status: 400 }
      );
    }

    // 하루 1회 제한 체크
    const existingWorkout = await prisma.workout.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: new Date(date),
        },
      },
    });

    if (existingWorkout) {
      return NextResponse.json(
        { error: "해당 날짜에 이미 운동 기록이 있습니다." },
        { status: 409 }
      );
    }

    const workout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        exerciseTypeId: parseInt(exerciseTypeId),
        date: new Date(date),
        durationMin: parseInt(durationMin),
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        calories: calories ? parseInt(calories) : null,
        intensity: intensity ? parseInt(intensity) : 3,
        memo: memo || null,
        location: location || null,
        link: link || null,
      },
      include: {
        exerciseType: true,
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "운동 기록 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
