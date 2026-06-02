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
      <div className="space-y-3">
        <div className="h-32 rounded-xl bg-white border border-stone-200 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white border border-stone-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* CTA Banner */}
      <motion.div
        className="rounded-2xl p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-lg font-bold">운동을 기록하고 공유해보세요</h1>
        <p className="text-orange-100 text-[13px] mt-1">매일의 운동 기록을 쌓아가며 성장하세요</p>
        <div className="flex gap-2 mt-4">
          <Link
            href="/register"
            className="text-[12px] font-medium bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
          >
            시작하기
          </Link>
          <Link
            href="/login"
            className="text-[12px] font-medium text-white/80 border border-white/30 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            로그인
          </Link>
        </div>
      </motion.div>

      {/* Community Feed */}
      <div>
        <h2 className="text-[13px] font-semibold text-stone-800 mb-3">커뮤니티 피드</h2>
        {feed.length > 0 ? (
          <div className="space-y-2">
            {feed.map((item) => {
              const category = item.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
              const catInfo = EXERCISE_CATEGORIES[category];
              return (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{
                      background: catInfo?.bgAlpha,
                      border: `1px solid ${catInfo?.borderAlpha}`,
                    }}
                  >
                    {item.exerciseType.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-medium text-stone-800">{item.userName}</span>
                      <span className="text-[10px] text-stone-400">
                        {format(new Date(item.date), "M.d (E)", { locale: ko })}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {item.exerciseType.name} · {item.durationMin}분
                      {item.distanceKm ? ` · ${item.distanceKm}km` : ""}
                      {item.calories ? ` · ${item.calories}kcal` : ""}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-stone-200 p-8 text-center">
            <p className="text-stone-400 text-[13px]">아직 운동 기록이 없어요</p>
            <p className="text-stone-300 text-[11px] mt-1">첫 번째 기록을 남겨보세요!</p>
          </div>
        )}
      </div>

      {/* Feature intro */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: "📅", title: "캘린더", desc: "날짜별 운동 기록" },
          { icon: "📊", title: "통계", desc: "운동 패턴 분석" },
          { icon: "👥", title: "그룹", desc: "친구와 함께 운동" },
          { icon: "📝", title: "일지", desc: "운동 일지 기록" },
        ].map((f) => (
          <div key={f.title} className="rounded-xl p-3.5 bg-white border border-stone-200 shadow-sm">
            <span className="text-lg">{f.icon}</span>
            <p className="text-[12px] font-medium text-stone-700 mt-1.5">{f.title}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>
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

  // Show public feed if not logged in
  if (status === "loading") {
    return (
      <div className="space-y-3">
        <div className="h-20 rounded-xl bg-white border border-stone-200 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white border border-stone-200 animate-pulse" />
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
      <div className="space-y-3">
        <div className="h-20 rounded-xl bg-white border border-stone-200 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white border border-stone-200 animate-pulse" />
          ))}
        </div>
        <div className="h-40 rounded-xl bg-white border border-stone-200 animate-pulse" />
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
      {/* Hero */}
      <motion.div
        className="rounded-xl p-4 bg-white border border-stone-200 shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-semibold text-stone-800">
              {userName}님, {getGreeting()}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-stone-400">
                {format(new Date(), "M월 d일 EEEE", { locale: ko })}
              </span>
              {streak > 0 && (
                <span className="text-[10px] font-medium text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded">
                  {streak}일 연속
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative group">
              <button className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-150 transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-1 py-1 w-28 bg-white border border-stone-200 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
                <button onClick={() => handleShare("week")} className="w-full text-left px-3 py-1.5 text-[10px] text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-all">이번 주 공유</button>
                <button onClick={() => handleShare("month")} className="w-full text-left px-3 py-1.5 text-[10px] text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-all">이번 달 공유</button>
              </div>
            </div>
            <Link
              href="/workout/new"
              className="flex items-center gap-1.5 text-[12px] font-medium text-white bg-orange-500 px-3.5 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              기록
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="rounded-xl p-3 bg-white border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-stone-400 font-medium">이번 주</span>
            {weekDiff !== 0 && (
              <span className={`text-[9px] font-medium ${weekDiff > 0 ? "text-emerald-500" : "text-red-500"}`}>
                {weekDiff > 0 ? "+" : ""}{weekDiff}
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-stone-800 mt-1">
            {weeklyStatus?.workoutsThisWeek || 0}
            <span className="text-[11px] font-normal text-stone-400">회</span>
          </p>
        </div>

        <div className="rounded-xl p-3 bg-white border border-stone-200 shadow-sm">
          <span className="text-[9px] text-stone-400 font-medium">운동 시간</span>
          <p className="text-xl font-bold text-stone-800 mt-1">
            {weeklyStatus?.thisWeekMinutes || 0}
            <span className="text-[11px] font-normal text-stone-400">분</span>
          </p>
        </div>

        <div className="rounded-xl p-3 bg-white border border-stone-200 shadow-sm">
          <span className="text-[9px] text-stone-400 font-medium">이번 달</span>
          <p className="text-xl font-bold text-stone-800 mt-1">
            {weeklyStatus?.monthTotalWorkouts || 0}
            <span className="text-[11px] font-normal text-stone-400">회</span>
          </p>
        </div>

        <div className="rounded-xl p-3 bg-white border border-stone-200 shadow-sm">
          <span className="text-[9px] text-stone-400 font-medium">연속 기록</span>
          <p className="text-xl font-bold text-stone-800 mt-1">
            {streak}
            <span className="text-[11px] font-normal text-stone-400">일</span>
          </p>
        </div>
      </motion.div>

      {/* Week stamps + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <motion.div
          className="lg:col-span-3 rounded-xl p-4 bg-white border border-stone-200 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[10px] text-stone-400 font-medium mb-3">이번 주 기록</p>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(({ day, workout }, i) => {
              const dayLabel = ["월", "화", "수", "목", "금", "토", "일"][i];
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              const category = workout?.category as keyof typeof EXERCISE_CATEGORIES | undefined;
              const catColor = category ? EXERCISE_CATEGORIES[category]?.color : null;

              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className={`text-[8px] font-medium ${isToday ? "text-orange-600" : "text-stone-400"}`}>
                    {dayLabel}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={workout ? {
                      background: `${catColor}12`,
                      border: `1px solid ${catColor}30`,
                    } : isToday ? {
                      border: "1px solid #FC5200",
                      background: "#EEF2FF",
                    } : {
                      border: "1px dashed #E7E5E4",
                    }}
                  >
                    {workout ? (
                      <span className="text-[11px]">{workout.icon || "✓"}</span>
                    ) : isToday ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Mini Calendar */}
        <motion.div
          className="lg:col-span-2 rounded-xl p-4 bg-white border border-stone-200 shadow-sm relative"
          ref={calRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setCalMonth(subMonths(calMonth, 1))}
              className="w-5 h-5 rounded flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span className="text-[10px] text-stone-500 font-medium">
              {format(calMonth, "yyyy.MM", { locale: ko })}
            </span>
            <button
              onClick={() => setCalMonth(addMonths(calMonth, 1))}
              className="w-5 h-5 rounded flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
              <div key={d} className="text-center text-[7px] text-stone-400 font-medium py-0.5">{d}</div>
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
                      background: `${catColor}15`,
                      border: `1px solid ${catColor}30`,
                      color: catColor || undefined,
                      fontWeight: 600,
                    } : isToday ? {
                      border: "1px solid #FC5200",
                      color: "#FC5200",
                      fontWeight: 600,
                    } : {
                      color: "#A8A29E",
                    }}
                    disabled={isFuture}
                  >
                    {day.getDate()}
                  </button>
                </div>
              );
            })}
          </div>

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
                <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-lg min-w-[140px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-stone-400">
                      {format(new Date(selectedDay.date), "M.d (E)", { locale: ko })}
                    </span>
                    <button
                      onClick={() => { setSelectedDay(null); setPopupPos(null); }}
                      className="text-stone-300 hover:text-stone-600 transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{selectedDay.icon || "🏋️"}</span>
                    <div>
                      <p className="text-[11px] font-medium text-stone-800">{selectedDay.exerciseType}</p>
                      <p className="text-[9px] text-stone-400">
                        {selectedDay.durationMin}분
                        {selectedDay.distanceKm && ` · ${selectedDay.distanceKm}km`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/workout/${selectedDay.workoutId}`}
                    className="mt-2 block text-center text-[9px] font-medium text-orange-600 bg-orange-50 border border-orange-100 rounded-md py-1.5 hover:bg-orange-100 transition-all"
                    onClick={() => { setSelectedDay(null); setPopupPos(null); }}
                  >
                    상세 보기
                  </Link>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-white border-b border-r border-stone-200 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Recent Workouts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {recentWorkouts.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2 px-0.5">
                <h2 className="text-[10px] text-stone-400 font-medium">최근 기록</h2>
                <Link href="/workout" className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors">전체</Link>
              </div>
              <div className="space-y-1.5">
                {recentWorkouts.map((workout) => {
                  const category = workout.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
                  const catInfo = EXERCISE_CATEGORIES[category];
                  return (
                    <Link
                      key={workout.id}
                      href={`/workout/${workout.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all"
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs"
                        style={{
                          background: catInfo?.bgAlpha,
                          border: `1px solid ${catInfo?.borderAlpha}`,
                        }}
                      >
                        {workout.exerciseType.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-stone-700">{workout.exerciseType.name}</p>
                        <p className="text-[9px] text-stone-400">
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
            <div className="rounded-xl bg-white border border-stone-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-stone-400">
                  <path d="M6.5 6.5h11M6.5 17.5h11M2 12h2m16 0h2M6 12H4.5a2.5 2.5 0 0 1 0-5H6m0 10h-.5a2.5 2.5 0 0 0 0 5H6m12-10h.5a2.5 2.5 0 0 0 0-5H18m0 10h.5a2.5 2.5 0 0 1 0 5H18"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-stone-700 text-[12px] font-medium">첫 운동을 기록해보세요</p>
                <p className="text-stone-400 text-[10px] mt-0.5">캘린더에 스탬프가 쌓입니다</p>
              </div>
              <Link href="/workout/new" className="text-[10px] font-medium text-white bg-orange-500 px-2.5 py-1.5 rounded-md hover:bg-orange-600 transition-colors shrink-0">
                기록
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div
          className="lg:col-span-2 space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Quick links */}
          <div className="rounded-xl p-3 bg-white border border-stone-200 shadow-sm">
            <p className="text-[9px] text-stone-400 font-medium mb-2">바로가기</p>
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
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-stone-50 border border-stone-200 hover:bg-stone-100 hover:border-stone-300 transition-all"
                >
                  <span className="text-stone-400">{item.icon}</span>
                  <span className="text-[10px] text-stone-500">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Group CTA */}
          <div className="rounded-xl p-3 bg-white border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-stone-400">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-stone-600 font-medium">그룹 챌린지</p>
                <p className="text-[9px] text-stone-400">친구들과 함께 도전</p>
              </div>
              <Link href="/group" className="text-[9px] text-stone-500 border border-stone-200 px-2 py-0.5 rounded hover:bg-stone-50 transition-all">참여</Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Share toast */}
      {shareToast && (
        <motion.div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[11px] font-medium px-4 py-2.5 rounded-full shadow-xl z-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          클립보드에 복사됨
        </motion.div>
      )}
    </motion.div>
  );
}
