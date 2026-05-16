"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  user: { nickname: string; profileImage: string | null };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-24 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">운동 일지</h1>
        <Link href="/posts/new" className="btn-primary">
          글쓰기
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-500 mb-4">아직 작성된 일지가 없습니다</p>
          <Link href="/posts/new" className="btn-primary inline-block">
            첫 일지를 작성해보세요
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="card block hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center text-xs font-medium text-primary">
                  {post.user.nickname[0]}
                </div>
                <span className="text-sm text-gray-600">{post.user.nickname}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  {format(new Date(post.createdAt), "M.d (E)", { locale: ko })}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">{post.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
