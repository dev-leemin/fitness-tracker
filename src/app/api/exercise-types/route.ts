import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEFAULT_EXERCISES } from "@/lib/constants";
import { ExerciseCategory } from "@prisma/client";

export async function GET() {
  let types = await prisma.exerciseType.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // 운동 종류가 없으면 기본값 시드
  if (types.length === 0) {
    await prisma.exerciseType.createMany({
      data: DEFAULT_EXERCISES.map((e) => ({
        name: e.name,
        category: e.category as ExerciseCategory,
        icon: e.icon,
        isDefault: true,
      })),
    });
    types = await prisma.exerciseType.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  } else {
    // 새로운 기본 운동이 추가된 경우 동기화
    const existingNames = new Set(types.map((t) => t.name));
    const newExercises = DEFAULT_EXERCISES.filter((e) => !existingNames.has(e.name));
    if (newExercises.length > 0) {
      await prisma.exerciseType.createMany({
        data: newExercises.map((e) => ({
          name: e.name,
          category: e.category as ExerciseCategory,
          icon: e.icon,
          isDefault: true,
        })),
        skipDuplicates: true,
      });
      types = await prisma.exerciseType.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
      });
    }
  }

  return NextResponse.json(types);
}
