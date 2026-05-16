import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId } = await params;

  // 멤버 확인
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });

  if (!membership) {
    return NextResponse.json({ error: "그룹 멤버가 아닙니다." }, { status: 403 });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, nickname: true, name: true, profileImage: true } } },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 이번 주 각 멤버의 운동 현황
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const memberIds = group.members.map((m) => m.userId);

  const thisWeekWorkouts = await prisma.workout.findMany({
    where: {
      userId: { in: memberIds },
      date: { gte: weekStart, lte: weekEnd },
    },
    select: { userId: true, date: true, exerciseType: { select: { icon: true, name: true } } },
  });

  // 멤버별 이번 주 현황
  const weeklyStatus = group.members.map((member) => {
    const memberWorkouts = thisWeekWorkouts.filter((w) => w.userId === member.userId);
    const days = memberWorkouts.map((w) => {
      const day = new Date(w.date).getDay();
      return day === 0 ? 6 : day - 1;
    });
    return {
      userId: member.userId,
      nickname: member.user.nickname,
      name: member.user.name,
      role: member.role,
      workoutCount: memberWorkouts.length,
      days,
      workouts: memberWorkouts.map((w) => ({
        date: format(new Date(w.date), "yyyy-MM-dd"),
        icon: w.exerciseType.icon,
        name: w.exerciseType.name,
      })),
    };
  });

  return NextResponse.json({
    ...group,
    weeklyStatus,
  });
}
