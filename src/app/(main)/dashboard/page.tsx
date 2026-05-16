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
  exerciseType: {
    name: string;
    icon: string | null;
    category: string;
  };
  photos: { id: string }[];
}

interface WeeklyStatus {
  workoutsThisWeek: number;
  goal: number;
  daysWorkedOut: string[];
}

export default function DashboardPage() {
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/workout?limit=5").then((r) => r.json()),
      fetch("/api/stats/weekly").then((r) => r.json()),
    ])
      .then(([workoutData, weeklyData]) => {
        setRecentWorkouts(workoutData.workouts || []);
        setWeeklyStatus(weeklyData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayWorkout = recentWorkouts.find(
    (w) => w.date.split("T")[0] === todayStr
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-20 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 오늘 상태 */}
      <div className="card">
        {todayWorkout ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              {todayWorkout.exerciseType.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">오늘의 운동</p>
              <p className="text-lg font-semibold text-gray-900">
                {todayWorkout.exerciseType.name} · {todayWorkout.durationMin}분
              </p>
              {todayWorkout.distanceKm && (
                <p className="text-sm text-gray-600">
                  {todayWorkout.distanceKm}km
                </p>
              )}
            </div>
            {todayWorkout.isVerified && (
              <span className="badge bg-green-100 text-green-700">인증완료</span>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-3">오늘 아직 운동을 기록하지 않았어요</p>
            <Link href="/workout/new" className="btn-primary inline-block">
              운동 기록하기
            </Link>
          </div>
        )}
      </div>

      {/* 이번 주 현황 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">이번 주 현황</h2>
          <span className="text-sm text-gray-500">
            {weeklyStatus ? `${weeklyStatus.workoutsThisWeek}/${weeklyStatus.goal}회` : "0/3회"}
          </span>
        </div>
        <div className="flex gap-2">
          {["월", "화", "수", "목", "금", "토", "일"].map((day, i) => {
            const isWorkedOut = weeklyStatus?.daysWorkedOut?.includes(String(i));
            return (
              <div key={day} className="flex-1 text-center">
                <p className="text-xs text-gray-500 mb-1">{day}</p>
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                    isWorkedOut
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isWorkedOut ? "✓" : "·"}
                </div>
              </div>
            );
          })}
        </div>
        {weeklyStatus && weeklyStatus.workoutsThisWeek < weeklyStatus.goal && (
          <p className="text-sm text-amber-600 mt-3">
            이번 주 {weeklyStatus.goal - weeklyStatus.workoutsThisWeek}회 더 운동하면 목표 달성!
          </p>
        )}
      </div>

      {/* 최근 기록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">최근 기록</h2>
          <Link href="/workout" className="text-sm text-primary hover:underline">
            전체보기
          </Link>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400 text-lg mb-2">💪</p>
            <p className="text-gray-500">아직 운동 기록이 없습니다</p>
            <Link href="/workout/new" className="text-primary text-sm hover:underline mt-2 inline-block">
              첫 운동을 기록해보세요
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentWorkouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="card flex items-center gap-3 hover:shadow-md transition-shadow !p-4"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                  {workout.exerciseType.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {workout.exerciseType.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(workout.date), "M월 d일 (E)", { locale: ko })} · {workout.durationMin}분
                    {workout.distanceKm && ` · ${workout.distanceKm}km`}
                  </p>
                </div>
                {workout.photos.length > 0 && (
                  <span className="text-gray-400 text-sm">📷</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
