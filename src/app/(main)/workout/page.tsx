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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">운동 기록</h1>
        <Link href="/workout/new" className="btn-glow !py-2 !px-4 text-sm">
          + 기록하기
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card animate-pulse">
              <div className="h-16 bg-white/[0.03] rounded-lg" />
            </div>
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
            <span className="text-3xl">💪</span>
          </div>
          <p className="text-white/50 mb-4">아직 운동 기록이 없습니다</p>
          <Link href="/workout/new" className="btn-glow inline-flex">
            첫 운동을 기록해보세요
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {workouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/workout/${workout.id}`}
                  className="glass-card flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl group-hover:border-[#00FF87]/30 transition-colors">
                    {workout.exerciseType.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">
                        {workout.exerciseType.name}
                      </p>
                      {workout.isVerified && (
                        <span className="badge-glow">인증</span>
                      )}
                    </div>
                    <p className="text-sm text-white/40">
                      {format(new Date(workout.date), "M월 d일 (E)", { locale: ko })} ·{" "}
                      {workout.durationMin}분
                      {workout.distanceKm && ` · ${workout.distanceKm}km`}
                    </p>
                    {workout.memo && (
                      <p className="text-sm text-white/25 truncate mt-0.5">
                        {workout.memo}
                      </p>
                    )}
                  </div>
                  {workout.photos.length > 0 && (
                    <span className="text-white/30 text-sm">📷 {workout.photos.length}</span>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-ghost !py-2 !px-4 text-sm disabled:opacity-30"
              >
                ← 이전
              </button>
              <span className="text-sm text-white/40">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-ghost !py-2 !px-4 text-sm disabled:opacity-30"
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
