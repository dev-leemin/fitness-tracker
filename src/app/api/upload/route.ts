import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const workoutId = formData.get("workoutId") as string;

    if (!files.length) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: "최대 5개까지 업로드 가능합니다." },
        { status: 400 }
      );
    }

    // 운동 기록 소유권 확인
    if (workoutId) {
      const workout = await prisma.workout.findFirst({
        where: { id: workoutId, userId: session.user.id },
      });
      if (!workout) {
        return NextResponse.json({ error: "운동 기록을 찾을 수 없습니다." }, { status: 404 });
      }
    }

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const uploadDir = path.join(process.cwd(), "uploads", session.user.id, yearMonth);

    await mkdir(uploadDir, { recursive: true });

    const photos = [];

    for (const file of files) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
      if (!allowedTypes.includes(file.type)) {
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        continue; // 10MB 제한
      }

      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(session.user.id, yearMonth, fileName);
      const fullPath = path.join(process.cwd(), "uploads", filePath);

      const bytes = await file.arrayBuffer();
      await writeFile(fullPath, Buffer.from(bytes));

      if (workoutId) {
        const photo = await prisma.workoutPhoto.create({
          data: {
            workoutId,
            filePath,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          },
        });
        photos.push(photo);
      } else {
        photos.push({ filePath, fileName: file.name });
      }
    }

    // 사진이 있으면 인증 완료 처리
    if (workoutId && photos.length > 0) {
      await prisma.workout.update({
        where: { id: workoutId },
        data: { isVerified: true },
      });
    }

    return NextResponse.json({ photos }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
