"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
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
  lastWeekWorkouts: number;
  thisWeekMinutes: number;
  lastWeekMinutes: number;
  monthlyRate: number;
  weeksCompleted: number;
  totalWeeksPassed: number;
  monthTotalMinutes: number;
  monthTotalWorkouts: number;
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

interface GroupSummary {
  id: string;
  name: string;
  weeklyGoal: number;
  memberCount: number;
  members: GroupMemberStatus[];
  myRank: number;
  myCount: number;
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
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchData = useCallback(() => {
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
        setCalMonth(now);
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

  useEffect(() => {
    fetchData();
    // Refetch on window focus (fixes stale data after profile edit)
    const handleFocus = () => fetchData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchData]);

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

  const [shareToast, setShareToast] = useState(false);
  const handleShare = async (type: "week" | "month") => {
    const res = await fetch(`/api/stats/share?type=${type}`);
    const data = await res.json();
    if (data.text) {
      if (navigator.share) {
        navigator.share({ text: data.text });
      } else {
        navigator.clipboard.writeText(data.text);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    }
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
  const startDayOfWeek = getDay(monthStart);
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Weekly comparison
  const weekDiff = weeklyStatus ? weeklyStatus.workoutsThisWeek - weeklyStatus.lastWeekWorkouts : 0;

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-20 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
          ))}
        </div>
        <div className="h-40 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero — Greeting + CTA */}
      <motion.div
        className="rounded-xl p-4 border border-white/[0.04] bg-white/[0.015]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-semibold text-neutral-200">
              {user?.nickname || user?.name || ""}님, {getGreeting()}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-neutral-600">
                {format(new Date(), "M월 d일 EEEE", { locale: ko })}
              </span>
              {streak > 0 && (
                <span className="text-[10px] font-medium text-neutral-500 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded">
                  {streak}일 연속
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative group">
              <button className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06] transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-1 py-1 w-28 bg-[#1a1a1c] border border-white/[0.08] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
                <button onClick={() => handleShare("week")} className="w-full text-left px-3 py-1.5 text-[10px] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-all">이번 주 공유</button>
                <button onClick={() => handleShare("month")} className="w-full text-left px-3 py-1.5 text-[10px] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-all">이번 달 공유</button>
              </div>
            </div>
            <Link
              href="/workout/new"
              className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-900 bg-white px-3.5 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              기록
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Row — 4 mini cards + share */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 relative"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Weekly progress */}
        <div className="rounded-xl p-3 border border-white/[0.04] bg-white/[0.015]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-neutral-600 font-medium">이번 주</span>
            {weekDiff !== 0 && (
              <span className={`text-[9px] font-medium ${weekDiff > 0 ? "text-emerald-400/80" : "text-red-400/80"}`}>
                {weekDiff > 0 ? "+" : ""}{weekDiff}
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-neutral-200 mt-1">
            {weeklyStatus?.workoutsThisWeek || 0}
            <span className="text-[11px] font-normal text-neutral-600">/{weeklyStatus?.goal || 3}회</span>
          </p>
        </div>

        {/* This week minutes */}
        <div className="rounded-xl p-3 border border-white/[0.04] bg-white/[0.015]">
          <span className="text-[9px] text-neutral-600 font-medium">운동 시간</span>
          <p className="text-xl font-bold text-neutral-200 mt-1">
            {weeklyStatus?.thisWeekMinutes || 0}
            <span className="text-[11px] font-normal text-neutral-600">분</span>
          </p>
        </div>

        {/* Monthly workouts */}
        <div className="rounded-xl p-3 border border-white/[0.04] bg-white/[0.015]">
          <span className="text-[9px] text-neutral-600 font-medium">이번 달</span>
          <p className="text-xl font-bold text-neutral-200 mt-1">
            {weeklyStatus?.monthTotalWorkouts || 0}
            <span className="text-[11px] font-normal text-neutral-600">회</span>
          </p>
        </div>

        {/* Monthly rate */}
        <div className="rounded-xl p-3 border border-white/[0.04] bg-white/[0.015]">
          <span className="text-[9px] text-neutral-600 font-medium">목표 달성률</span>
          <p className="text-xl font-bold text-neutral-200 mt-1">
            {weeklyStatus?.monthlyRate || 0}
            <span className="text-[11px] font-normal text-neutral-600">%</span>
          </p>
        </div>
      </motion.div>

      {/* Main content: Week + Ring + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Left: Week stamps + Ring (compact) */}
        <motion.div
          className="lg:col-span-3 rounded-xl p-4 border border-white/[0.04] bg-white/[0.015]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-neutral-600 font-medium">이번 주 기록</p>
            <button
              onClick={() => setShowGoalEdit(!showGoalEdit)}
              className="text-[9px] text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              목표 {weeklyStatus?.goal || 3}회
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Week stamps */}
            <div className="flex-1 grid grid-cols-7 gap-1">
              {weekDays.map(({ day, workout }, i) => {
                const dayLabel = ["월", "화", "수", "목", "금", "토", "일"][i];
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                const category = workout?.category as keyof typeof EXERCISE_CATEGORIES | undefined;
                const catColor = category ? EXERCISE_CATEGORIES[category]?.color : null;

                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className={`text-[8px] font-medium ${isToday ? "text-neutral-300" : "text-neutral-700"}`}>
                      {dayLabel}
                    </span>
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center"
                      style={workout ? {
                        background: `${catColor}15`,
                        border: `1px solid ${catColor}30`,
                      } : isToday ? {
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.02)",
                      } : {
                        border: "1px dashed rgba(255,255,255,0.04)",
                      }}
                    >
                      {workout ? (
                        <span className="text-[10px]">{workout.icon || "✓"}</span>
                      ) : isToday ? (
                        <div className="w-1 h-1 rounded-full bg-neutral-500" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ring — compact */}
            <div className="relative w-16 h-16 shrink-0">
              <svg width="64" height="64" className="transform -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                <motion.circle
                  cx="32" cy="32" r="26" fill="none"
                  stroke="rgba(255,255,255,0.6)" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 26) - (weeklyPercentage / 100) * (2 * Math.PI * 26) }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-neutral-200">{weeklyStatus?.workoutsThisWeek || 0}</span>
                <span className="text-[8px] text-neutral-600">/{weeklyStatus?.goal || 3}</span>
              </div>
            </div>
          </div>

          {/* Goal edit overlay */}
          {showGoalEdit && (
            <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-[10px] text-neutral-500">주간 목표</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGoalInput(Math.max(1, goalInput - 1))}
                  className="w-6 h-6 rounded bg-white/[0.04] border border-white/[0.08] text-neutral-400 flex items-center justify-center text-xs hover:bg-white/[0.08]"
                >-</button>
                <span className="text-sm font-bold text-neutral-200 w-4 text-center">{goalInput}</span>
                <button
                  onClick={() => setGoalInput(Math.min(7, goalInput + 1))}
                  className="w-6 h-6 rounded bg-white/[0.04] border border-white/[0.08] text-neutral-400 flex items-center justify-center text-xs hover:bg-white/[0.08]"
                >+</button>
                <button onClick={handleGoalSave} className="text-[10px] text-neutral-200 bg-white/[0.06] border border-white/[0.1] px-2.5 py-1 rounded hover:bg-white/[0.1] ml-1">저장</button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Right: Mini Monthly Calendar */}
        <motion.div
          className="lg:col-span-2 rounded-xl p-4 border border-white/[0.04] bg-white/[0.015] relative"
          ref={calRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setCalMonth(subMonths(calMonth, 1))}
              className="w-5 h-5 rounded flex items-center justify-center text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.04] transition-all"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-[10px] text-neutral-500 font-medium">
              {format(calMonth, "yyyy.MM", { locale: ko })}
            </span>
            <button
              onClick={() => setCalMonth(addMonths(calMonth, 1))}
              className="w-5 h-5 rounded flex items-center justify-center text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.04] transition-all"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
              <div key={d} className="text-center text-[7px] text-neutral-700 font-medium py-0.5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`e-${i}`} className="aspect-square" />
            ))}
            {calDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const workout = calendarData.find((d) => d.date === dateStr);
              const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
              const isFuture = day > new Date();
              const category = workout?.category as keyof typeof EXERCISE_CATEGORIES | undefined;
              const catColor = category ? EXERCISE_CATEGORIES[category]?.color : null;

              return (
                <div key={dateStr} className="aspect-square flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      if (isFuture) return;
                      if (workout) {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        const calRect = calRef.current?.getBoundingClientRect();
                        if (calRect) {
                          setPopupPos({ x: rect.left - calRect.left + rect.width / 2, y: rect.top - calRect.top - 4 });
                        }
                        setSelectedDay(workout);
                      } else {
                        router.push(`/workout/new?date=${dateStr}`);
                      }
                    }}
                    className={`w-full h-full max-w-[22px] max-h-[22px] rounded flex items-center justify-center text-[8px] transition-all ${
                      isFuture ? "cursor-default opacity-40" : "cursor-pointer hover:scale-110"
                    }`}
                    style={workout ? {
                      background: `${catColor}18`,
                      border: `1px solid ${catColor}30`,
                      color: catColor || undefined,
                      fontWeight: 600,
                    } : isToday ? {
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#e5e5e5",
                    } : {
                      color: "rgba(255,255,255,0.2)",
                    }}
                    disabled={isFuture}
                  >
                    {day.getDate()}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Workout detail popup */}
          <AnimatePresence>
            {selectedDay && popupPos && (
              <motion.div
                className="absolute z-20"
                style={{ left: popupPos.x, top: popupPos.y, transform: "translate(-50%, -100%)" }}
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className="bg-[#1a1a1c] border border-white/[0.1] rounded-xl p-3 shadow-xl min-w-[140px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-neutral-400">
                      {format(new Date(selectedDay.date), "M.d (E)", { locale: ko })}
                    </span>
                    <button
                      onClick={() => { setSelectedDay(null); setPopupPos(null); }}
                      className="text-neutral-600 hover:text-neutral-300 transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{selectedDay.icon || "🏋️"}</span>
                    <div>
                      <p className="text-[11px] font-medium text-neutral-200">{selectedDay.exerciseType}</p>
                      <p className="text-[9px] text-neutral-500">
                        {selectedDay.durationMin}분
                        {selectedDay.distanceKm && ` · ${selectedDay.distanceKm}km`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/workout/${selectedDay.workoutId}`}
                    className="mt-2 block text-center text-[9px] font-medium text-neutral-400 bg-white/[0.04] border border-white/[0.06] rounded-md py-1.5 hover:bg-white/[0.08] transition-all"
                    onClick={() => { setSelectedDay(null); setPopupPos(null); }}
                  >
                    상세 보기
                  </Link>
                </div>
                {/* Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-[#1a1a1c] border-b border-r border-white/[0.1] rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Recent Workouts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Recent */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {recentWorkouts.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2 px-0.5">
                <h2 className="text-[10px] text-neutral-600 font-medium">최근 기록</h2>
                <Link href="/workout" className="text-[10px] text-neutral-600 hover:text-neutral-300 transition-colors">전체</Link>
              </div>
              <div className="space-y-1.5">
                {recentWorkouts.map((workout, i) => {
                  const category = workout.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
                  const catInfo = EXERCISE_CATEGORIES[category];
                  return (
                    <Link
                      key={workout.id}
                      href={`/workout/${workout.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.07] transition-all"
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs"
                        style={{
                          background: `${catInfo?.color || "#666"}12`,
                          border: `1px solid ${catInfo?.color || "#666"}25`,
                        }}
                      >
                        {workout.exerciseType.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-neutral-300">{workout.exerciseType.name}</p>
                        <p className="text-[9px] text-neutral-600">
                          {format(new Date(workout.date), "M.d (E)", { locale: ko })} · {workout.durationMin}분
                          {workout.distanceKm && ` · ${workout.distanceKm}km`}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-500">
                  <path d="M6.5 6.5h11M6.5 17.5h11M2 12h2m16 0h2M6 12H4.5a2.5 2.5 0 0 1 0-5H6m0 10h-.5a2.5 2.5 0 0 0 0 5H6m12-10h.5a2.5 2.5 0 0 0 0-5H18m0 10h.5a2.5 2.5 0 0 1 0 5H18"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-neutral-300 text-[12px] font-medium">첫 운동을 기록해보세요</p>
                <p className="text-neutral-600 text-[10px] mt-0.5">캘린더에 스탬프가 쌓입니다</p>
              </div>
              <Link href="/workout/new" className="text-[10px] font-medium text-neutral-900 bg-white px-2.5 py-1.5 rounded-md hover:bg-neutral-100 transition-colors shrink-0">
                기록
              </Link>
            </div>
          )}
        </motion.div>

        {/* Right sidebar: Group + Quick links */}
        <motion.div
          className="lg:col-span-2 space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Group or Join CTA */}
          {groupMembers.length > 0 ? (
            <div className="rounded-xl p-3 border border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[9px] text-neutral-600 font-medium">그룹</p>
                <Link href="/group" className="text-[9px] text-neutral-600 hover:text-neutral-300 transition-colors">보기</Link>
              </div>
              <div className="space-y-1.5">
                {groupMembers.slice(0, 3).map((member, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <span className="text-[8px] font-medium text-neutral-500">{member.nickname[0]}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 flex-1 truncate">{member.nickname}</span>
                    <div className="flex items-center gap-px">
                      {Array.from({ length: weeklyStatus?.goal || 3 }).map((_, j) => (
                        <div key={j} className={`w-1.5 h-1.5 rounded-sm ${j < member.workoutCount ? "bg-neutral-400" : "bg-white/[0.04]"}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-3 border border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-500">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-neutral-400 font-medium">그룹 챌린지</p>
                  <p className="text-[9px] text-neutral-600">친구들과 함께 도전</p>
                </div>
                <Link href="/group" className="text-[9px] text-neutral-500 border border-white/[0.06] px-2 py-0.5 rounded hover:bg-white/[0.03] transition-all">참여</Link>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="rounded-xl p-3 border border-white/[0.04] bg-white/[0.015]">
            <p className="text-[9px] text-neutral-600 font-medium mb-2">바로가기</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { href: "/calendar", label: "캘린더", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
                { href: "/stats", label: "통계", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg> },
                { href: "/workout", label: "운동 목록", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6.5 6.5h11M6.5 17.5h11M2 12h2m16 0h2"/></svg> },
                { href: "/posts", label: "일지", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855z"/></svg> },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.07] transition-all"
                >
                  <span className="text-neutral-500">{item.icon}</span>
                  <span className="text-[10px] text-neutral-400">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Share toast */}
      {shareToast && (
        <motion.div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-800 border border-white/[0.1] text-neutral-200 text-[11px] font-medium px-4 py-2.5 rounded-full shadow-xl z-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          클립보드에 복사됨
        </motion.div>
      )}
    </motion.div>
  );
}
