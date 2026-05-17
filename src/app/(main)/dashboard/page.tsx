"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, startOfWeek, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";
import { EXERCISE_CATEGORIES } from "@/lib/constants";

interface Workout {
  id: string;
  date: string;
  durationMin: number;
  distanceKm: number | null;
  exerciseType: {
    name: string;
    icon: string | null;
    category: string;
  };
}

interface WeeklyStatus {
  workoutsThisWeek: number;
  goal: number;
  daysWorkedOut: string[];
}

interface CalendarDay {
  date: string;
  exerciseType: string;
  icon: string | null;
  category: string;
  durationMin: number;
  distanceKm: number | null;
  hasPhoto: boolean;
  workoutId: string;
}

interface GroupMemberStatus {
  nickname: string;
  workoutCount: number;
}

export default function DashboardPage() {
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyStatus | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMemberStatus[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    Promise.all([
      fetch("/api/workout?limit=5").then((r) => r.json()),
      fetch("/api/stats/weekly").then((r) => r.json()),
      fetch(`/api/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`).then((r) => r.json()),
      fetch("/api/group").then((r) => r.json()),
      fetch("/api/workout/streak").then((r) => r.json()),
    ])
      .then(([workoutData, weeklyData, calData, groupData, streakData]) => {
        setRecentWorkouts(workoutData.workouts || []);
        setWeeklyStatus(weeklyData);
        setCalendarData(calData || []);
        setStreak(streakData?.streak || 0);
        if (groupData?.length > 0) {
          fetch(`/api/group/${groupData[0].id}`)
            .then((r) => r.json())
            .then((detail) => {
              if (detail.weeklyStatus) {
                setGroupMembers(detail.weeklyStatus.map((m: { nickname: string; workoutCount: number }) => ({
                  nickname: m.nickname,
                  workoutCount: m.workoutCount,
                })));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const weeklyPercentage = weeklyStatus
    ? Math.min((weeklyStatus.workoutsThisWeek / weeklyStatus.goal) * 100, 100)
    : 0;

  // Get this week's days with workout data
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const dateStr = format(day, "yyyy-MM-dd");
    const workout = calendarData.find((d) => d.date === dateStr);
    return { day, dateStr, workout };
  });

  const circumference = 2 * Math.PI * 42;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-32 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-40 rounded-3xl" />
          <div className="skeleton h-40 rounded-3xl" />
        </div>
        <div className="skeleton h-24 rounded-3xl" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero Card — Greeting + Streak + CTA */}
      <motion.div
        className="card-glass !p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C5CFC]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              오늘도 화이팅
              {streak > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FB923C]/10 border border-[#FB923C]/20">
                  <span className="streak-fire text-sm">🔥</span>
                  <span className="text-xs font-bold text-[#FB923C]">{streak}일 연속</span>
                </span>
              )}
            </h1>
            <p className="text-sm text-white/40 mt-1">
              {format(new Date(), "M월 d일 EEEE", { locale: ko })}
            </p>
          </div>

          <Link
            href="/workout/new"
            className="btn-primary !px-5 !py-3 !rounded-2xl !text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            기록
          </Link>
        </div>
      </motion.div>

      {/* Weekly Stamp Calendar + Ring */}
      <div className="grid grid-cols-5 gap-3">
        {/* Week Stamps — 3 cols */}
        <motion.div
          className="col-span-3 card-glass !p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[11px] text-white/35 font-medium uppercase tracking-wider mb-4">이번 주</p>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(({ day, workout }, i) => {
              const dayLabel = ["월", "화", "수", "목", "금", "토", "일"][i];
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              const category = workout?.category as keyof typeof EXERCISE_CATEGORIES | undefined;
              const catColor = category ? EXERCISE_CATEGORIES[category]?.color : null;

              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className={`text-[10px] font-medium ${isToday ? "text-[#A78BFA]" : "text-white/25"}`}>
                    {dayLabel}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      workout
                        ? "shadow-lg stamp-animate"
                        : isToday
                          ? "today-ring border border-[#7C5CFC]/30 bg-[#7C5CFC]/5"
                          : "border border-dashed border-white/10 bg-white/[0.02]"
                    }`}
                    style={workout ? {
                      background: `${catColor}15`,
                      border: `2px solid ${catColor}40`,
                      boxShadow: `0 4px 12px ${catColor}20`,
                    } : undefined}
                  >
                    {workout ? (
                      <span className="text-sm">{workout.icon || "✓"}</span>
                    ) : isToday ? (
                      <span className="text-[10px] text-[#A78BFA]/60">오늘</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Weekly Ring — 2 cols */}
        <motion.div
          className="col-span-2 card-glass !p-5 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="relative w-24 h-24">
            <svg width="96" height="96" className="transform -rotate-90">
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C5CFC" />
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
              <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <motion.circle
                cx="48" cy="48" r="42" fill="none"
                stroke="url(#ringGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (weeklyPercentage / 100) * circumference }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                style={{ filter: "drop-shadow(0 0 8px rgba(124,92,252,0.3))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">{weeklyStatus?.workoutsThisWeek || 0}</span>
              <span className="text-[9px] text-white/30">/ {weeklyStatus?.goal || 3}회</span>
            </div>
          </div>
          <p className="text-[10px] text-white/30 mt-3 font-medium">주간 목표</p>
        </motion.div>
      </div>

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[11px] text-white/30 font-medium uppercase tracking-wider">최근 기록</h2>
            <Link href="/workout" className="text-[10px] text-[#A78BFA]/70 hover:text-[#A78BFA] transition-colors">
              전체보기
            </Link>
          </div>
          <div className="space-y-2">
            {recentWorkouts.map((workout, i) => {
              const category = workout.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
              const catInfo = EXERCISE_CATEGORIES[category];
              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                >
                  <Link
                    href={`/workout/${workout.id}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{
                        background: catInfo?.bgAlpha || "rgba(255,255,255,0.04)",
                        border: `1px solid ${catInfo?.borderAlpha || "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      {workout.exerciseType.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white/80">{workout.exerciseType.name}</p>
                      <p className="text-[11px] text-white/30">
                        {format(new Date(workout.date), "M.d (E)", { locale: ko })} · {workout.durationMin}분
                        {workout.distanceKm && ` · ${workout.distanceKm}km`}
                      </p>
                    </div>
                    <div
                      className="w-1.5 h-8 rounded-full opacity-40"
                      style={{ background: catInfo?.color || "#6b7280" }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="card-glass text-center py-14"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#7C5CFC]/5 border border-[#7C5CFC]/10 flex items-center justify-center mb-4 float-element">
            <span className="text-2xl">💪</span>
          </div>
          <p className="text-white/40 text-sm font-medium">아직 운동 기록이 없습니다</p>
          <p className="text-white/20 text-xs mt-1">첫 운동을 기록하고 스트릭을 시작하세요</p>
          <Link href="/workout/new" className="btn-primary inline-flex mt-5 !text-xs">
            첫 운동 기록하기
          </Link>
        </motion.div>
      )}

      {/* Group Status */}
      {groupMembers.length > 0 && (
        <motion.div
          className="card-glass !p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-white/30 font-medium uppercase tracking-wider">그룹 현황</p>
            <Link href="/group" className="text-[10px] text-[#A78BFA]/70 hover:text-[#A78BFA] transition-colors">
              전체보기
            </Link>
          </div>
          <div className="space-y-2.5">
            {groupMembers.slice(0, 4).map((member, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C5CFC]/10 to-[#A78BFA]/10 border border-[#7C5CFC]/15 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#A78BFA]">{member.nickname[0]}</span>
                </div>
                <span className="text-[12px] text-white/50 flex-1 truncate">{member.nickname}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: weeklyStatus?.goal || 3 }).map((_, j) => (
                    <div
                      key={j}
                      className={`w-2 h-2 rounded-full transition-all ${
                        j < member.workoutCount
                          ? "bg-[#34D399] shadow-[0_0_4px_rgba(52,211,153,0.3)]"
                          : "bg-white/[0.06]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}