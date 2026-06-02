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
          <div key={i} className="bg-white border border-stone-200 rounded-xl shadow-sm animate-pulse">
            <div className="h-24 bg-white rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-900">운동 일지</h1>
        <Link href="/posts/new" className="btn-primary !py-2 !px-3.5 text-[12px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          글쓰기
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm text-center py-14">
          <div className="w-12 h-12 mx-auto rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-20"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855z"/></svg>
          </div>
          <p className="text-stone-400 text-sm mb-3">아직 작성된 일지가 없습니다</p>
          <Link href="/posts/new" className="btn-primary inline-flex">
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
                className="bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md transition-shadow block group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-stone-100 border border-stone-200 rounded-md flex items-center justify-center text-[9px] font-bold text-stone-500">
                    {post.user.nickname[0]}
                  </div>
                  <span className="text-[12px] text-stone-500">{post.user.nickname}</span>
                  <span className="text-[10px] text-stone-300 ml-auto">
                    {format(new Date(post.createdAt), "M.d (E)", { locale: ko })}
                  </span>
                </div>
                <h3 className="text-[13px] font-medium text-stone-800 group-hover:text-stone-900 transition-colors">{post.title}</h3>
                <p className="text-[12px] text-stone-400 mt-1 line-clamp-2">{post.content}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
