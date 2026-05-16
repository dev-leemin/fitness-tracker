"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";

interface Workout {
  id: string;
  date: string;
  durationMin: number;
  distanceKm: number | null;
  intensity: number | null;
  isVerified: boolean;
  memo: string | null;
  exerciseType: {
    name: string;
    icon: string | null;
    category: string;
  };
  photos: { id: string; filePath: string }[];
}

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/workout?page=${page}&limit=10`)
      .then((r) => r.json())
      .then((data) => {
        setWorkouts(data.workouts || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">운동 기록</h1>
        <Link href="/workout/new" className="btn-primary !py-2 !px-3.5 text-[12px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          기록하기
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <div className="bento-card text-center py-16">
          <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <span className="text-2xl">💪</span>
          </div>
          <p className="text-white/35 text-sm mb-4">아직 운동 기록이 없습니다</p>
          <Link href="/workout/new" className="btn-primary inline-flex">
            첫 운동을 기록해보세요
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {workouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  href={`/workout/${workout.id}`}
                  className="bento-card bento-card-interactive flex items-center gap-3.5 !p-3.5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-lg group-hover:border-white/[0.1] transition-colors shrink-0">
                    {workout.exerciseType.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-white/80">
                        {workout.exerciseType.name}
                      </p>
                      {workout.isVerified && (
                        <span className="badge-glow">인증</span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {format(new Date(workout.date), "M월 d일 (E)", { locale: ko })} · {workout.durationMin}분
                      {workout.distanceKm && ` · ${workout.distanceKm}km`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {workout.photos.length > 0 && (
                      <span className="text-[10px] text-white/20">📷 {workout.photos.length}</span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10 group-hover:text-white/25 transition-colors" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-ghost !py-2 !px-3.5 text-[12px] disabled:opacity-20"
              >
                ← 이전
              </button>
              <span className="text-[12px] text-white/30">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-ghost !py-2 !px-3.5 text-[12px] disabled:opacity-20"
              >
                다음 →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
