import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";
import { ko } from "date-fns/locale";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "week"; // "day", "week", "month"
  const dateParam = searchParams.get("date"); // for "day" type

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nickname: true, name: true },
  });

  const displayName = user?.nickname || user?.name || "사용자";
  const now = new Date();

  if (type === "day" && dateParam) {
    const workout = await prisma.workout.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(dateParam),
      },
      include: { exerciseType: true },
    });

    if (!workout) {
      return NextResponse.json({ text: null });
    }

    let text = `📋 ${displayName}의 운동 기록\n`;
    text += `${format(new Date(dateParam), "yyyy.M.d (E)", { locale: ko })}\n\n`;
    text += `${workout.exerciseType.icon} ${workout.exerciseType.name}\n`;
    text += `⏱ ${workout.durationMin}분`;
    if (workout.distanceKm) text += ` | 📏 ${workout.distanceKm}km`;
    if (workout.calories) text += ` | 🔥 ${workout.calories}kcal`;
    text += "\n\n— FitLog";

    return NextResponse.json({ text });
  }

  if (type === "week") {
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const workouts = await prisma.workout.findMany({
      where: {
        userId: session.user.id,
        date: { gte: weekStart, lte: weekEnd },
      },
      include: { exerciseType: true },
      orderBy: { date: "asc" },
    });

    const totalMin = workouts.reduce((sum, w) => sum + w.durationMin, 0);

    let text = `📋 ${displayName}의 이번 주 운동\n`;
    text += `${format(weekStart, "M.d", { locale: ko })} ~ ${format(weekEnd, "M.d", { locale: ko })}\n\n`;

    if (workouts.length === 0) {
      text += "아직 이번 주 운동 기록이 없어요!\n";
    } else {
      workouts.forEach((w) => {
        text += `${w.exerciseType.icon} ${format(new Date(w.date), "E", { locale: ko })} ${w.exerciseType.name} ${w.durationMin}분\n`;
      });
      text += `\n📊 총 ${workouts.length}회 | ⏱ ${totalMin}분\n`;
    }
    text += "\n— FitLog";

    return NextResponse.json({ text });
  }

  if (type === "month") {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const workouts = await prisma.workout.findMany({
      where: {
        userId: session.user.id,
        date: { gte: monthStart, lte: monthEnd },
      },
      include: { exerciseType: true },
      orderBy: { date: "asc" },
    });

    const totalMin = workouts.reduce((sum, w) => sum + w.durationMin, 0);
    const totalDist = workouts.reduce((sum, w) => sum + (w.distanceKm || 0), 0);

    // Category breakdown
    const categories: Record<string, number> = {};
    workouts.forEach((w) => {
      const name = w.exerciseType.name;
      categories[name] = (categories[name] || 0) + 1;
    });

    let text = `📋 ${displayName}의 ${format(now, "M")}월 운동 리포트\n\n`;
    text += `📊 총 ${workouts.length}회 운동\n`;
    text += `⏱ 총 ${totalMin}분 (${Math.round(totalMin / 60 * 10) / 10}시간)\n`;
    if (totalDist > 0) text += `📏 총 ${Math.round(totalDist * 10) / 10}km\n`;
    text += "\n";

    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    sorted.slice(0, 5).forEach(([name, count]) => {
      text += `  ${name}: ${count}회\n`;
    });

    text += "\n— FitLog";

    return NextResponse.json({ text });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
