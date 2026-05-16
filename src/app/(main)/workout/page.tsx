"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

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
        <h1 className="text-2xl font-bold text-gray-900">운동 기록</h1>
        <Link href="/workout/new" className="btn-primary">
          기록하기
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">💪</p>
          <p className="text-gray-500 mb-4">아직 운동 기록이 없습니다</p>
          <Link href="/workout/new" className="btn-primary inline-block">
            첫 운동을 기록해보세요
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {workouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="card flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                  {workout.exerciseType.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {workout.exerciseType.name}
                    </p>
                    {workout.isVerified && (
                      <span className="badge bg-green-100 text-green-700">인증</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(workout.date), "M월 d일 (E)", { locale: ko })} ·{" "}
                    {workout.durationMin}분
                    {workout.distanceKm && ` · ${workout.distanceKm}km`}
                  </p>
                  {workout.memo && (
                    <p className="text-sm text-gray-400 truncate mt-0.5">
                      {workout.memo}
                    </p>
                  )}
                </div>
                {workout.photos.length > 0 && (
                  <span className="text-gray-400">📷 {workout.photos.length}</span>
                )}
              </Link>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary"
              >
                이전
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
