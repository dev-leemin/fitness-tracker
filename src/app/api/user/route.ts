import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, nickname: true, profileImage: true, weeklyGoal: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, nickname, weeklyGoal } = await request.json();

  if (nickname) {
    const existing = await prisma.user.findFirst({
      where: { nickname, NOT: { id: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 닉네임입니다." }, { status: 409 });
    }
  }

  if (weeklyGoal !== undefined && (weeklyGoal < 1 || weeklyGoal > 7)) {
    return NextResponse.json({ error: "주간 목표는 1~7 ��이여야 합니다." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name && { name }),
      ...(nickname && { nickname }),
      ...(weeklyGoal !== undefined && { weeklyGoal }),
    },
    select: { id: true, email: true, name: true, nickname: true, weeklyGoal: true },
  });

  return NextResponse.json(user);
}
