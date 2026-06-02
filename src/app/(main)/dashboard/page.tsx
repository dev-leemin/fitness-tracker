"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  daysWorkedOut: string[];
  lastWeekWorkouts: number;
  thisWeekMinutes: number;
  lastWeekMinutes: number;
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

interface FeedItem {
  id: string;
  date: string;
  durationMin: number;
  distanceKm: number | null;
  calories: number | null;
  createdAt: string;
  exerciseType: {
    name: string;
    icon: string | null;
    category: string;
  };
  userName: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "새벽 운동 준비 됐나요?";
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "오늘도 화이팅";
  return "오늘 하루 고생했어요";
}

// ===== Public Feed (unauthenticated) =====
function PublicFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feed?limit=20")
      .then((r) => r.json())
      .then((data) => setFeed(data.workouts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 px-1">
        <div className="h-40 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-stone-50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* CTA Banner */}
      <motion.div
        className="rounded-2xl p-6 bg-gradient-to-br from-[#FC5200] to-[#FF6B2B] relative overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <h1 className="text-[20px] font-bold text-white leading-tight">
            운동을 기록하고<br />공유해보세요
          </h1>
          <p className="text-white/70 text-[13px] mt-2">매일의 기록이 쌓여 성장이 됩니다</p>
          <div className="flex gap-2.5 mt-5">
            <Link
              href="/register"
              className="text-[13px] font-semibold bg-white text-[#FC5200] px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors"
            >
              시작하기
            </Link>
            <Link
              href="/login"
              className="text-[13px] font-medium text-white/90 border border-white/30 px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Community Feed */}
      {feed.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-stone-800 mb-3 px-1">최근 활동</h2>
          <div className="space-y-2.5">
            {feed.map((item, idx) => {
              const category = item.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
              const catInfo = EXERCISE_CATEGORIES[category];
              return (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] shrink-0"
                    style={{ background: `${catInfo?.color}15`, color: catInfo?.color }}
                  >
                    {item.exerciseType.icon || "🏅"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-stone-800">{item.userName}</span>
                      <span className="text-[11px] text-stone-400">
                        {format(new Date(item.date), "M.d", { locale: ko })}
                      </span>
                    </div>
                    <p className="text-[12px] text-stone-500 mt-0.5">
                      {item.exerciseType.name} · {item.durationMin}분
                      {item.distanceKm ? ` · ${item.distanceKm}km` : ""}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold text-stone-600 shrink-0">
                    {item.durationMin}분
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {feed.length === 0 && (
        <div className="rounded-2xl bg-stone-50 p-10 text-center">
          <div className="text-[32px] mb-3">🏋️</div>
          <p className="text-stone-600 text-[14px] font-medium">아직 운동 기록이 없어요</p>
          <p className="text-stone-400 text-[12px] mt-1">첫 번째 기록을 남겨보세요!</p>
        </div>
      )}
    </motion.div>
  );
}

// ===== Personal Dashboard (authenticated) =====
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyStatus | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [shareToast, setShareToast] = useState(false);
  const [userName, setUserName] = useState("");

  const isLoggedIn = status === "authenticated" && !!session?.user;

  const fetchData = useCallback(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    const now = new Date();
    Promise.all([
      fetch("/api/user").then((r) => r.json()),
      fetch("/api/workout?limit=3").then((r) => r.json()),
      fetch("/api/stats/weekly").then((r) => r.json()),
      fetch(`/api/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`).then((r) => r.json()),
      fetch("/api/workout/streak").then((r) => r.json()),
    ])
      .then(([userData, workoutData, weeklyData, calData, streakData]) => {
        setUserName(userData?.nickname || userData?.name || "");
        setRecentWorkouts(workoutData.workouts || []);
        setWeeklyStatus(weeklyData);
        setCalendarData(calData || []);
        setStreak(streakData?.streak || 0);
        setCalMonth(now);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    if (status === "loading") return;
    fetchData();
    const handleFocus = () => fetchData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchData, status]);

  useEffect(() => {
    if (loading || !isLoggedIn) return;
    fetch(`/api/calendar?year=${calMonth.getFullYear()}&month=${calMonth.getMonth() + 1}`)
      .then((r) => r.json())
      .then((data) => setCalendarData(data || []))
      .catch(() => {});
  }, [calMonth, loading, isLoggedIn]);

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

  // Loading skeleton
  if (status === "loading") {
    return (
      <div className="space-y-5 px-1">
        <div className="h-16 rounded-2xl bg-stone-50 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-stone-50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <PublicFeed />;
  }

  // ===== Authenticated Dashboard =====
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const dateStr = format(day, "yyyy-MM-dd");
    const workout = calendarData.find((d) => d.date === dateStr);
    return { day, dateStr, workout };
  });

  const monthStartDate = startOfMonth(calMonth);
  const monthEndDate = endOfMonth(calMonth);
  const calDays = eachDayOfInterval({ start: monthStartDate, end: monthEndDate });
  const startDayOfWeek = getDay(monthStartDate);
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const weekDiff = weeklyStatus ? weeklyStatus.workoutsThisWeek - weeklyStatus.lastWeekWorkouts : 0;

  if (loading) {
    return (
      <div className="space-y-5 px-1">
        <div className="h-16 rounded-2xl bg-stone-50 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-stone-50 animate-pulse" />
          ))}
        </div>
        <div className="h-32 rounded-2xl bg-stone-50 animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h1 className="text-[22px] font-bold text-stone-900 tracking-tight leading-tight">
          {userName}님,<br />{getGreeting()}
        </h1>
        <div className="flex items-center gap-2.5 mt-2">
          <span className="text-[13px] text-stone-400">
            {format(new Date(), "M월 d일 EEEE", { locale: ko })}
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#FC5200] bg-orange-50 px-2.5 py-0.5 rounded-full">
              🔥 {streak}일 연속
            </span>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="rounded-2xl p-4 bg-[#FFF4ED]">
          <span className="text-[11px] text-[#FC5200]/60 font-semibold tracking-wide uppercase">이번 주</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-[30px] font-extrabold text-[#FC5200] leading-none tabular-nums">
              {weeklyStatus?.workoutsThisWeek || 0}
            </span>
            <span className="text-[13px] font-medium text-[#FC5200]/50">회</span>
          </div>
          {weekDiff !== 0 && (
            <span className={`text-[11px] font-medium mt-1 block ${weekDiff > 0 ? "text-emerald-500" : "text-red-400"}`}>
              지난주 대비 {weekDiff > 0 ? "+" : ""}{weekDiff}
            </span>
          )}
        </div>

        <div className="rounded-2xl p-4 bg-blue-50">
          <span className="text-[11px] text-blue-500/60 font-semibold tracking-wide uppercase">운동 시간</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-[30px] font-extrabold text-blue-600 leading-none tabular-nums">
              {weeklyStatus?.thisWeekMinutes || 0}
            </span>
            <span className="text-[13px] font-medium text-blue-500/50">분</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-emerald-50">
          <span className="text-[11px] text-emerald-500/60 font-semibold tracking-wide uppercase">이번 달</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-[30px] font-extrabold text-emerald-600 leading-none tabular-nums">
              {weeklyStatus?.monthTotalWorkouts || 0}
            </span>
            <span className="text-[13px] font-medium text-emerald-500/50">회</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-amber-50">
          <span className="text-[11px] text-amber-500/60 font-semibold tracking-wide uppercase">연속 기록</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-[30px] font-extrabold text-amber-600 leading-none tabular-nums">
              {streak}
            </span>
            <span className="text-[13px] font-medium text-amber-500/50">일</span>
          </div>
        </div>
      </motion.div>

      {/* This Week Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[15px] font-semibold text-stone-800">이번 주</h2>
          <div className="relative group">
            <button className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              공유
            </button>
            <div className="absolute right-0 top-full mt-1 py-1 w-28 bg-white rounded-xl shadow-lg border border-stone-100 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
              <button onClick={() => handleShare("week")} className="w-full text-left px-3 py-2 text-[12px] text-stone-600 hover:bg-stone-50 transition-all">이번 주</button>
              <button onClick={() => handleShare("month")} className="w-full text-left px-3 py-2 text-[12px] text-stone-600 hover:bg-stone-50 transition-all">이번 달</button>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          {weekDays.map(({ day, workout }, i) => {
            const dayLabel = ["월", "화", "수", "목", "금", "토", "일"][i];
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const category = workout?.category as keyof typeof EXERCISE_CATEGORIES | undefined;
            const catColor = category ? EXERCISE_CATEGORIES[category]?.color : null;

            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className={`text-[11px] font-semibold ${isToday ? "text-[#FC5200]" : "text-stone-400"}`}>
                  {dayLabel}
                </span>
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={workout ? {
                    background: `${catColor}18`,
                    boxShadow: `inset 0 0 0 2.5px ${catColor}50`,
                  } : isToday ? {
                    boxShadow: "inset 0 0 0 2.5px #FC5200",
                  } : {
                    background: "#F5F5F4",
                  }}
                >
                  {workout ? (
                    <span className="text-[16px]">{workout.icon || "✓"}</span>
                  ) : isToday ? (
                    <div className="w-2 h-2 rounded-full bg-[#FC5200]" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Mini Calendar */}
      <motion.div
        ref={calRef}
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCalMonth(subMonths(calMonth, 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="text-[15px] font-semibold text-stone-800">
            {format(calMonth, "yyyy년 M월", { locale: ko })}
          </span>
          <button
            onClick={() => setCalMonth(addMonths(calMonth, 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
            <div key={d} className="text-center text-[11px] text-stone-400 font-medium py-1.5">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5">
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
              <div key={dateStr} className="flex items-center justify-center py-0.5">
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
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] transition-all ${
                    isFuture ? "cursor-default" : "cursor-pointer hover:scale-110"
                  }`}
                  style={workout ? {
                    background: `${catColor}15`,
                    color: catColor || undefined,
                    fontWeight: 700,
                  } : isToday ? {
                    background: "#FC5200",
                    color: "#fff",
                    fontWeight: 700,
                  } : {
                    color: isFuture ? "#D6D3D1" : "#78716C",
                  }}
                  disabled={isFuture}
                >
                  {day.getDate()}
                </button>
              </div>
            );
          })}
        </div>

        {/* Calendar popup */}
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
              <div className="bg-white rounded-2xl p-3.5 shadow-xl border border-stone-100 min-w-[160px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-stone-400 font-medium">
                    {format(new Date(selectedDay.date), "M월 d일 (E)", { locale: ko })}
                  </span>
                  <button
                    onClick={() => { setSelectedDay(null); setPopupPos(null); }}
                    className="text-stone-300 hover:text-stone-500 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[18px]">{selectedDay.icon || "🏋️"}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-stone-800">{selectedDay.exerciseType}</p>
                    <p className="text-[11px] text-stone-400">
                      {selectedDay.durationMin}분
                      {selectedDay.distanceKm && ` · ${selectedDay.distanceKm}km`}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/workout/${selectedDay.workoutId}`}
                  className="mt-3 block text-center text-[12px] font-semibold text-[#FC5200] bg-orange-50 rounded-xl py-2 hover:bg-orange-100 transition-all"
                  onClick={() => { setSelectedDay(null); setPopupPos(null); }}
                >
                  상세 보기
                </Link>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2.5 h-2.5 bg-white border-b border-r border-stone-100 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {recentWorkouts.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[15px] font-semibold text-stone-800">최근 기록</h2>
              <Link href="/workout" className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors">
                전체 보기
              </Link>
            </div>
            <div className="space-y-2">
              {recentWorkouts.map((workout) => {
                const category = workout.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
                const catInfo = EXERCISE_CATEGORIES[category];
                return (
                  <Link
                    key={workout.id}
                    href={`/workout/${workout.id}`}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-[18px] shrink-0"
                      style={{
                        background: catInfo?.bgAlpha,
                        border: `1px solid ${catInfo?.borderAlpha}`,
                      }}
                    >
                      {workout.exerciseType.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-stone-800">{workout.exerciseType.name}</p>
                      <p className="text-[12px] text-stone-400 mt-0.5">
                        {format(new Date(workout.date), "M월 d일 (E)", { locale: ko })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-bold text-stone-700">{workout.durationMin}분</p>
                      {workout.distanceKm && (
                        <p className="text-[12px] text-stone-400">{workout.distanceKm}km</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-stone-50 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6.5 6.5h11M6.5 17.5h11M2 12h2m16 0h2M6 12H4.5a2.5 2.5 0 0 1 0-5H6m0 10h-.5a2.5 2.5 0 0 0 0 5H6m12-10h.5a2.5 2.5 0 0 0 0-5H18m0 10h.5a2.5 2.5 0 0 1 0 5H18"/>
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-stone-700">첫 운동을 기록해보세요</p>
            <p className="text-[12px] text-stone-400 mt-1">아래 + 버튼으로 시작할 수 있어요</p>
          </div>
        )}
      </motion.div>

      {/* Share toast */}
      {shareToast && (
        <motion.div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[13px] font-medium px-5 py-3 rounded-full shadow-xl z-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          클립보드에 복사됨
        </motion.div>
      )}
    </motion.div>
  );
}
