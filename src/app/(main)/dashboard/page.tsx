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

function ActivityRing({ percentage, size = 120, strokeWidth = 10, color = "#00FF87" }: { percentage: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
      />
    </svg>
  );
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

  const weeklyPercentage = weeklyStatus
    ? Math.min((weeklyStatus.workoutsThisWeek / weeklyStatus.goal) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card animate-pulse">
            <div className="h-20 bg-white/[0.03] rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero: Activity Ring + Today Status */}
      <div className="glow-card">
        <div className="flex items-center gap-6">
          <div className="relative">
            <ActivityRing percentage={weeklyPercentage} size={100} strokeWidth={8} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl font-bold text-white">
                  {weeklyStatus?.workoutsThisWeek || 0}
                </p>
                <p className="text-[10px] text-white/40">/{weeklyStatus?.goal || 3}회</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {todayWorkout ? (
              <>
                <p className="text-xs text-[#00FF87] font-medium uppercase tracking-wider mb-1">Today Complete</p>
                <p className="text-lg font-bold text-white">
                  {todayWorkout.exerciseType.name}
                </p>
                <p className="text-sm text-white/50 mt-0.5">
                  {todayWorkout.durationMin}분
                  {todayWorkout.distanceKm && ` · ${todayWorkout.distanceKm}km`}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Today</p>
                <p className="text-lg font-bold text-white/80">아직 기록 없음</p>
                <Link href="/workout/new" className="inline-block mt-2 text-sm text-[#00FF87] hover:underline">
                  운동 기록하기 →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">이번 주</h2>
          {weeklyStatus && weeklyStatus.workoutsThisWeek < weeklyStatus.goal && (
            <span className="text-xs text-[#FF8C00]">
              {weeklyStatus.goal - weeklyStatus.workoutsThisWeek}회 남음
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {["월", "화", "수", "목", "금", "토", "일"].map((day, i) => {
            const isWorkedOut = weeklyStatus?.daysWorkedOut?.includes(String(i));
            return (
              <div key={day} className="flex-1 text-center">
                <p className="text-[10px] text-white/30 mb-2">{day}</p>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-all ${
                    isWorkedOut
                      ? "bg-[#00FF87]/20 border border-[#00FF87]/30 text-[#00FF87] shadow-[0_0_10px_rgba(0,255,135,0.15)]"
                      : "bg-white/[0.03] border border-white/[0.06] text-white/20"
                  }`}
                >
                  <span className="text-xs font-bold">{isWorkedOut ? "✓" : "·"}</span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action */}
      <Link href="/workout/new" className="block">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-[#00FF87]/10 to-[#00D4FF]/10 border border-[#00FF87]/15"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-base">운동 기록하기</p>
              <p className="text-sm text-white/40 mt-0.5">오늘의 운동을 기록해보세요</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF87] to-[#00D4FF] flex items-center justify-center">
              <span className="text-lg font-bold text-black">+</span>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Recent Workouts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">최근 기록</h2>
          <Link href="/workout" className="text-xs text-[#00D4FF] hover:underline">
            전체보기
          </Link>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="glass-card text-center py-10">
            <p className="text-2xl mb-2">💪</p>
            <p className="text-white/40 text-sm">아직 운동 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentWorkouts.map((workout, i) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={`/workout/${workout.id}`}
                  className="glass-card flex items-center gap-3 !p-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-lg">
                    {workout.exerciseType.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">
                      {workout.exerciseType.name}
                    </p>
                    <p className="text-xs text-white/40">
                      {format(new Date(workout.date), "M월 d일 (E)", { locale: ko })} · {workout.durationMin}분
                      {workout.distanceKm && ` · ${workout.distanceKm}km`}
                    </p>
                  </div>
                  {workout.isVerified && (
                    <span className="badge-glow">인증</span>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
