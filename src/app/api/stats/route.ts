import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { subWeeks, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();

  // 최근 12주 주간 데이터
  const weeklyData = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });

    const count = await prisma.workout.count({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
    });

    weeklyData.push({
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      count,
    });
  }

  // 최근 6개월 월간 데이터
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
      select: { durationMin: true, distanceKm: true },
    });

    monthlyData.push({
      month: `${monthStart.getMonth() + 1}월`,
      count: workouts.length,
      totalDuration: workouts.reduce((s, w) => s + w.durationMin, 0),
      totalDistance: workouts.reduce((s, w) => s + (w.distanceKm || 0), 0),
    });
  }

  // 운동 종류 분포
  const typeDistribution = await prisma.workout.groupBy({
    by: ["exerciseTypeId"],
    where: { userId },
    _count: true,
  });

  const exerciseTypes = await prisma.exerciseType.findMany();
  const typeStats = typeDistribution.map((t) => {
    const type = exerciseTypes.find((et) => et.id === t.exerciseTypeId);
    return {
      name: type?.name || "기타",
      icon: type?.icon || "🏅",
      category: type?.category || "OTHER",
      count: t._count,
    };
  });

  // 총 통계
  const totalWorkouts = await prisma.workout.count({ where: { userId } });
  const totalStats = await prisma.workout.aggregate({
    where: { userId },
    _sum: { durationMin: true, distanceKm: true, calories: true },
  });

  // 연속 기록 (스트릭) 계산
  const allWorkouts = await prisma.workout.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // 주 단위 스트릭 계산
  const weekSet = new Set(
    allWorkouts.map((w) => {
      const d = new Date(w.date);
      const weekStart = startOfWeek(d, { weekStartsOn: 1 });
      return weekStart.toISOString().split("T")[0];
    })
  );

  const sortedWeeks = Array.from(weekSet).sort().reverse();
  for (let i = 0; i < sortedWeeks.length; i++) {
    const thisWeekStart = new Date(sortedWeeks[i]);
    const prevWeekStart = i > 0 ? new Date(sortedWeeks[i - 1]) : null;

    if (i === 0) {
      tempStreak = 1;
    } else if (prevWeekStart) {
      const diff = (prevWeekStart.getTime() - thisWeekStart.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 7) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // 현재 스트릭 (이번 주 포함 연속)
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekStr = thisWeekStart.toISOString().split("T")[0];
  if (weekSet.has(thisWeekStr)) {
    currentStreak = 1;
    for (let i = 1; i <= sortedWeeks.length; i++) {
      const checkWeek = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      if (weekSet.has(checkWeek.toISOString().split("T")[0])) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return NextResponse.json({
    weeklyData,
    monthlyData,
    typeStats,
    totalWorkouts,
    totalDuration: totalStats._sum.durationMin || 0,
    totalDistance: totalStats._sum.distanceKm || 0,
    totalCalories: totalStats._sum.calories || 0,
    currentStreak,
    longestStreak,
  });
}
