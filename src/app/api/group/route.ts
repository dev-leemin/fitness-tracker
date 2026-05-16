import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groups = await prisma.group.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      members: {
        include: { user: { select: { id: true, nickname: true, profileImage: true } } },
      },
      _count: { select: { members: true } },
    },
  });

  return NextResponse.json(groups);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, weeklyGoal, finePerMiss } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "그룹 이름을 입력해주세요." }, { status: 400 });
  }

  const inviteCode = randomBytes(4).toString("hex").toUpperCase();

  const group = await prisma.group.create({
    data: {
      name,
      description: description || null,
      inviteCode,
      weeklyGoal: weeklyGoal || 3,
      finePerMiss: finePerMiss || 5000,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
    include: { members: true },
  });

  return NextResponse.json(group, { status: 201 });
}
