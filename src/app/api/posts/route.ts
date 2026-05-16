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
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { isPublic: true },
        ],
      },
      include: {
        user: { select: { nickname: true, profileImage: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.post.count({
      where: {
        OR: [
          { userId: session.user.id },
          { isPublic: true },
        ],
      },
    }),
  ]);

  return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, workoutId, isPublic } = await request.json();

  if (!title || !content) {
    return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      title,
      content,
      workoutId: workoutId || null,
      isPublic: isPublic ?? true,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
