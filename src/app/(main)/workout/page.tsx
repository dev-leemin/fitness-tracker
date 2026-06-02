"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";
import { EXERCISE_CATEGORIES } from "@/lib/constants";

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
        <h1 className="text-lg font-bold text-stone-900">운동 기록</h1>
        <Link href="/workout/new" className="btn-primary !py-2.5 !px-4 !text-[12px] !rounded-xl">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          기록하기
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[72px] bg-white border border-stone-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
            <span className="text-2xl">💪</span>
          </div>
          <p className="text-stone-500 text-sm font-medium">아직 운동 기록이 없습니다</p>
          <Link href="/workout/new" className="btn-primary inline-flex mt-5 !text-xs">
            첫 운동을 기록해보세요
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {workouts.map((workout, index) => {
              const category = workout.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
              const catInfo = EXERCISE_CATEGORIES[category];
              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    href={`/workout/${workout.id}`}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all group shadow-sm"
                  >
                    {/* Category colored icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        background: catInfo?.bgAlpha,
                        border: `1px solid ${catInfo?.borderAlpha}`,
                        boxShadow: `0 4px 12px ${catInfo?.shadowAlpha}`,
                      }}
                    >
                      {workout.exerciseType.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-stone-800">
                          {workout.exerciseType.name}
                        </p>
                        {workout.isVerified && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100">인증</span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {format(new Date(workout.date), "M월 d일 (E)", { locale: ko })} · {workout.durationMin}분
                        {workout.distanceKm && ` · ${workout.distanceKm}km`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {workout.photos.length > 0 && (
                        <span className="text-[10px] text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200">📷 {workout.photos.length}</span>
                      )}
                      {/* Category color bar */}
                      <div
                        className="w-1 h-8 rounded-full opacity-40"
                        style={{ background: catInfo?.color }}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="py-2 px-4 text-[12px] rounded-lg bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 transition-all cursor-pointer disabled:opacity-20"
              >
                ← 이전
              </button>
              <span className="text-[12px] text-stone-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="py-2 px-4 text-[12px] rounded-lg bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 transition-all cursor-pointer disabled:opacity-20"
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
