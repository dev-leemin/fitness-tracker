"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
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
  monthlyRate: number;
  weeksCompleted: number;
  totalWeeksPassed: number;
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

interface UserInfo {
  name: string;
  nickname: string;
  weeklyGoal: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "새벽 운동 준비 됐나요?";
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "오늘도 화이팅";
  return "오늘 하루 고생했어요";
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyStatus | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMemberStatus[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date());
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput] = useState(3);

  // Load dashboard data
  useEffect(() => {
    const now = new Date();
    Promise.all([
      fetch("/api/user").then((r) => r.json()),
      fetch("/api/workout?limit=3").then((r) => r.json()),
      fetch("/api/stats/weekly").then((r) => r.json()),
      fetch(`/api/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`).then((r) => r.json()),
      fetch("/api/group").then((r) => r.json()),
      fetch("/api/workout/streak").then((r) => r.json()),
    ])
      .then(([userData, workoutData, weeklyData, calData, groupData, streakData]) => {
        setUser(userData);
        setGoalInput(userData?.weeklyGoal || 3);
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

  // Load calendar data when month changes
  useEffect(() => {
    if (loading) return;
    fetch(`/api/calendar?year=${calMonth.getFullYear()}&month=${calMonth.getMonth() + 1}`)
      .then((r) => r.json())
      .then((data) => setCalendarData(data || []))
      .catch(() => {});
  }, [calMonth, loading]);

  const handleGoalSave = async () => {
    if (goalInput < 1 || goalInput > 7) return;
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyGoal: goalInput }),
    });
    setWeeklyStatus((prev) => prev ? { ...prev, goal: goalInput } : prev);
    setShowGoalEdit(false);
  };

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

  // Mini calendar
  const monthStart = startOfMonth(calMonth);
  const monthEnd = endOfMonth(calMonth);
  const calDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0=Sun
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Mon=0

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 h-48 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
          <div className="h-48 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        </div>
        <div className="h-32 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
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
              {user?.nickname || user?.name || ""}님, {getGreeting()}
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

      {/* Main grid: Week stamps + Ring | Mini calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Week + Ring */}
        <div className="lg:col-span-2 grid grid-cols-5 gap-3">
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

          {/* Weekly Ring + Goal */}
          <motion.div
            className="col-span-2 rounded-xl p-4 border border-white/[0.04] bg-white/[0.015] flex flex-col items-center justify-center relative"
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
            <button
              onClick={() => setShowGoalEdit(true)}
              className="text-[10px] text-neutral-600 mt-2 hover:text-neutral-400 transition-colors"
            >
              주간 목표 {showGoalEdit ? "" : `${weeklyStatus?.goal || 3}회`}
            </button>

            {/* Goal edit inline */}
            {showGoalEdit && (
              <div className="absolute inset-0 bg-neutral-950/95 rounded-xl flex flex-col items-center justify-center gap-3 z-10">
                <p className="text-[11px] text-neutral-400">주간 목표 설정</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGoalInput(Math.max(1, goalInput - 1))}
                    className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-neutral-300 flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold text-neutral-200 w-6 text-center">{goalInput}</span>
                  <button
                    onClick={() => setGoalInput(Math.min(7, goalInput + 1))}
                    className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] text-neutral-300 flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowGoalEdit(false)} className="text-[10px] text-neutral-600 hover:text-neutral-400 px-2 py-1">취소</button>
                  <button onClick={handleGoalSave} className="text-[10px] text-neutral-200 bg-white/[0.06] border border-white/[0.1] px-3 py-1 rounded-md hover:bg-white/[0.1]">저장</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Mini Monthly Calendar */}
        <motion.div
          className="rounded-xl p-4 border border-white/[0.04] bg-white/[0.015]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Month header with nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCalMonth(subMonths(calMonth, 1))}
              className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-[11px] text-neutral-400 font-medium">
              {format(calMonth, "yyyy년 M월", { locale: ko })}
            </span>
            <button
              onClick={() => setCalMonth(addMonths(calMonth, 1))}
              className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
              <div key={d} className="text-center text-[8px] text-neutral-700 font-medium py-0.5">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty cells for offset */}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {calDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const workout = calendarData.find((d) => d.date === dateStr);
              const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
              const category = workout?.category as keyof typeof EXERCISE_CATEGORIES | undefined;
              const catColor = category ? EXERCISE_CATEGORIES[category]?.color : null;

              return (
                <div
                  key={dateStr}
                  className="aspect-square flex items-center justify-center relative"
                >
                  <div
                    className="w-full h-full max-w-[26px] max-h-[26px] rounded-md flex items-center justify-center text-[9px]"
                    style={workout ? {
                      background: `${catColor}18`,
                      border: `1px solid ${catColor}35`,
                      color: catColor || undefined,
                    } : isToday ? {
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#e5e5e5",
                    } : {
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monthly rate */}
          {weeklyStatus && (
            <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-[10px] text-neutral-600">이번 달 달성률</span>
              <span className="text-[11px] font-medium text-neutral-300">
                {weeklyStatus.monthlyRate}%
                <span className="text-neutral-600 ml-1">({weeklyStatus.weeksCompleted}/{weeklyStatus.totalWeeksPassed}주)</span>
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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
                  transition={{ delay: 0.3 + i * 0.04 }}
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
                        {format(new Date(workout.date), "M.d (E)", { locale: ko })} · {workout.durationMin}��
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
          className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-500">
                <path d="M6.5 6.5h11M6.5 17.5h11M2 12h2m16 0h2M6 12H4.5a2.5 2.5 0 0 1 0-5H6m0 10h-.5a2.5 2.5 0 0 0 0 5H6m12-10h.5a2.5 2.5 0 0 0 0-5H18m0 10h.5a2.5 2.5 0 0 1 0 5H18"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-neutral-300 text-[13px] font-medium">첫 운동을 기록해보세요</p>
              <p className="text-neutral-600 text-[11px] mt-0.5">운동을 기록하면 캘린더에 스탬프가 쌓입니다</p>
            </div>
            <Link
              href="/workout/new"
              className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-900 bg-white px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
            >
              기록하기
            </Link>
          </div>
        </motion.div>
      )}

      {/* Group Status or Join CTA */}
      {groupMembers.length > 0 ? (
        <motion.div
          className="rounded-xl p-4 border border-white/[0.04] bg-white/[0.015]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
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
      ) : (
        <motion.div
          className="rounded-xl p-4 border border-white/[0.04] bg-white/[0.015]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-500">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-neutral-400 font-medium">그룹에 참여하세요</p>
              <p className="text-[10px] text-neutral-600">친구들과 함께 주간 목표를 달성해보세요</p>
            </div>
            <Link href="/group" className="text-[10px] text-neutral-500 hover:text-neutral-300 border border-white/[0.06] px-2.5 py-1 rounded-md hover:bg-white/[0.03] transition-all">
              참여
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
