"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";

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
          <div key={i} className="glass-card animate-pulse">
            <div className="h-24 bg-white/[0.02] rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">운동 일지</h1>
        <Link href="/posts/new" className="btn-glow !py-2 !px-4 text-sm">
          + 글쓰기
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
            <span className="text-3xl text-white/20">▣</span>
          </div>
          <p className="text-white/50 mb-4">아직 작성된 일지가 없습니다</p>
          <Link href="/posts/new" className="btn-glow inline-flex">
            첫 일지를 작성해보세요
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/posts/${post.id}`}
                className="glass-card block group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#6366F1]/20 to-[#818CF8]/20 rounded-full flex items-center justify-center text-[10px] font-bold text-[#6366F1]">
                    {post.user.nickname[0]}
                  </div>
                  <span className="text-sm text-white/50">{post.user.nickname}</span>
                  <span className="text-xs text-white/25 ml-auto">
                    {format(new Date(post.createdAt), "M.d (E)", { locale: ko })}
                  </span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-[#6366F1] transition-colors">{post.title}</h3>
                <p className="text-sm text-white/35 mt-1 line-clamp-2">{post.content}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
