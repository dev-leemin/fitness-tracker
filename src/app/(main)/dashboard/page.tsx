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
        <div className="h-28 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-36 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
          <div className="h-36 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        </div>
        <div className="h-20 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
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
      {/* Hero — Greeting + Streak + CTA */}
      <motion.div
        className="rounded-xl p-5 border border-white/[0.04] bg-white/[0.015]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-neutral-200">
              오늘도 화이팅
              {streak > 0 && (
                <span className="ml-2 text-[11px] font-medium text-neutral-500 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md">
                  {streak}일 연속
                </span>
              )}
            </h1>
            <p className="text-[12px] text-neutral-600 mt-1">
              {format(new Date(), "M월 d일 EEEE", { locale: ko })}
            </p>
          </div>

          <Link
            href="/workout/new"
            className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-900 bg-white px-3.5 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            기록
          </Link>
        </div>
      </motion.div>

      {/* Weekly Stamp Calendar + Ring */}
      <div className="grid grid-cols-5 gap-3">
        {/* Week Stamps */}
        <motion.div
          className="col-span-3 rounded-xl p-4 border border-white/[0.04] bg-white/[0.015]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[10px] text-neutral-600 font-medium mb-3">이번 주</p>
          <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map(({ day, workout }, i) => {
              const dayLabel = ["월", "화", "수", "목", "금", "토", "일"][i];
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              const category = workout?.category as keyof typeof EXERCISE_CATEGORIES | undefined;
              const catColor = category ? EXERCISE_CATEGORIES[category]?.color : null;

              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[9px] font-medium ${isToday ? "text-neutral-300" : "text-neutral-600"}`}>
                    {dayLabel}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={workout ? {
                      background: `${catColor}12`,
                      border: `1px solid ${catColor}30`,
                    } : isToday ? {
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.02)",
                    } : {
                      border: "1px dashed rgba(255,255,255,0.05)",
                      background: "transparent",
                    }}
                  >
                    {workout ? (
                      <span className="text-xs">{workout.icon || "✓"}</span>
                    ) : isToday ? (
                      <div className="w-1 h-1 rounded-full bg-neutral-500" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Weekly Ring */}
        <motion.div
          className="col-span-2 rounded-xl p-4 border border-white/[0.04] bg-white/[0.015] flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="relative w-20 h-20">
            <svg width="80" height="80" className="transform -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
              <motion.circle
                cx="40" cy="40" r="34" fill="none"
                stroke="rgba(255,255,255,0.6)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 34}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: (2 * Math.PI * 34) - (weeklyPercentage / 100) * (2 * Math.PI * 34) }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-neutral-200">{weeklyStatus?.workoutsThisWeek || 0}</span>
              <span className="text-[9px] text-neutral-600">/ {weeklyStatus?.goal || 3}회</span>
            </div>
          </div>
          <p className="text-[10px] text-neutral-600 mt-2">주간 목표</p>
        </motion.div>
      </div>

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h2 className="text-[10px] text-neutral-600 font-medium">최근 기록</h2>
            <Link href="/workout" className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors">
              전체보기
            </Link>
          </div>
          <div className="space-y-1.5">
            {recentWorkouts.map((workout, i) => {
              const category = workout.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
              const catInfo = EXERCISE_CATEGORIES[category];
              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                >
                  <Link
                    href={`/workout/${workout.id}`}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.07] transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{
                        background: `${catInfo?.color || "#666"}10`,
                        border: `1px solid ${catInfo?.color || "#666"}25`,
                      }}
                    >
                      {workout.exerciseType.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-neutral-300">{workout.exerciseType.name}</p>
                      <p className="text-[10px] text-neutral-600">
                        {format(new Date(workout.date), "M.d (E)", { locale: ko })} · {workout.durationMin}분
                        {workout.distanceKm && ` · ${workout.distanceKm}km`}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="rounded-xl border border-white/[0.04] bg-white/[0.015] text-center py-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-neutral-400 text-[13px] font-medium">아직 운동 기록이 없습니다</p>
          <p className="text-neutral-600 text-[11px] mt-1">첫 운동을 기록하고 스트릭을 시작하세요</p>
          <Link
            href="/workout/new"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-900 bg-white px-3.5 py-2 rounded-lg mt-4 hover:bg-neutral-100 transition-colors"
          >
            첫 운동 기록하기
          </Link>
        </motion.div>
      )}

      {/* Group Status */}
      {groupMembers.length > 0 && (
        <motion.div
          className="rounded-xl p-4 border border-white/[0.04] bg-white/[0.015]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-neutral-600 font-medium">그룹 현황</p>
            <Link href="/group" className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors">
              전체보기
            </Link>
          </div>
          <div className="space-y-2">
            {groupMembers.slice(0, 4).map((member, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-[9px] font-medium text-neutral-500">{member.nickname[0]}</span>
                </div>
                <span className="text-[11px] text-neutral-500 flex-1 truncate">{member.nickname}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: weeklyStatus?.goal || 3 }).map((_, j) => (
                    <div
                      key={j}
                      className={`w-2 h-2 rounded-sm ${
                        j < member.workoutCount
                          ? "bg-neutral-400"
                          : "bg-white/[0.04]"
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
