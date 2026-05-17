import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
    include: {
      exerciseType: true,
      photos: true,
    },
  });

  if (!workout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(workout);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { exerciseTypeId, durationMin, distanceKm, calories, intensity, memo, location, link } = body;

  const workout = await prisma.workout.update({
    where: { id },
    data: {
      ...(exerciseTypeId && { exerciseTypeId: parseInt(exerciseTypeId) }),
      ...(durationMin && { durationMin: parseInt(durationMin) }),
      distanceKm: distanceKm ? parseFloat(distanceKm) : null,
      calories: calories ? parseInt(calories) : null,
      intensity: intensity ? parseInt(intensity) : existing.intensity,
      memo: memo ?? existing.memo,
      location: location !== undefined ? (location || null) : existing.location,
      link: link !== undefined ? (link || null) : existing.link,
    },
    include: { exerciseType: true },
  });

  return NextResponse.json(workout);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.workout.delete({ where: { id } });

  return NextResponse.json({ message: "삭제 완료" });
}
