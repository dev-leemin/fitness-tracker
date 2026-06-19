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

// ===== Public Landing (unauthenticated) =====
function PublicLanding() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feed?limit=10")
      .then((r) => r.json())
      .then((data) => setFeed(data.workouts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Hero */}
      <motion.div
        className="pt-4 pb-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-[28px] font-extrabold text-stone-900 leading-tight tracking-tight">
          운동을 기록하고<br />성장을 확인하세요
        </h1>
        <p className="text-[14px] text-stone-400 mt-3 leading-relaxed">
          매일의 운동 기록이 쌓여 나만의 루틴이 됩니다
        </p>
        <div className="flex gap-3 mt-6">
          <Link
            href="/register"
            className="text-[14px] font-semibold bg-[#FC5200] text-white px-6 py-3 rounded-full hover:bg-[#E04800] transition-colors"
          >
            시작하기
          </Link>
          <Link
            href="/login"
            className="text-[14px] font-medium text-stone-500 px-6 py-3 rounded-full border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            로그인
          </Link>
        </div>
      </motion.div>

      {/* Preview features */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { icon: "📅", title: "캘린더 스탬프", desc: "운동한 날마다 스탬프가 쌓여요" },
          { icon: "📊", title: "통계 분석", desc: "운동 패턴과 변화를 한눈에" },
          { icon: "👥", title: "그룹 챌린지", desc: "친구들과 함께 동기부여" },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            className="flex items-center gap-4 py-3"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
          >
            <span className="text-[24px] w-10 text-center">{f.icon}</span>
            <div>
              <p className="text-[14px] font-semibold text-stone-800">{f.title}</p>
              <p className="text-[12px] text-stone-400 mt-0.5">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Community feed */}
      {!loading && feed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[13px] font-medium text-stone-500">실시간 커뮤니티</span>
          </div>
          <div className="space-y-1">
            {feed.map((item, idx) => {
              const category = item.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
              const catInfo = EXERCISE_CATEGORIES[category];
              return (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.03 }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] shrink-0"
                    style={{ background: `${catInfo?.color}12` }}
                  >
                    {item.exerciseType.icon || "🏅"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-stone-700">{item.userName}</span>
                    <span className="text-[12px] text-stone-400 ml-2">
                      {item.exerciseType.name} · {item.durationMin}분
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-300 shrink-0">
                    {format(new Date(item.date), "M.d")}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ===== Welcome Screen (authenticated, no data) =====
function WelcomeScreen({ userName }: { userName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center pt-12 pb-8"
    >
      <motion.div
        className="text-[56px] mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, delay: 0.1 }}
      >
        🏋️‍♀️
      </motion.div>

      <motion.h1
        className="text-[22px] font-bold text-stone-900 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {userName}님, 환영해요
      </motion.h1>

      <motion.p
        className="text-[14px] text-stone-400 text-center mt-2 leading-relaxed"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        첫 운동을 기록하고<br />캘린더에 스탬프를 모아보세요
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Link
          href="/workout/new"
          className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold bg-[#FC5200] text-white px-7 py-3.5 rounded-full hover:bg-[#E04800] transition-colors shadow-lg shadow-[#FC5200]/20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          첫 운동 기록하기
        </Link>
      </motion.div>

      {/* How it works */}
      <motion.div
        className="w-full mt-14 space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <p className="text-[12px] font-semibold text-stone-400 tracking-wider uppercase">이렇게 사용해요</p>
        <div className="space-y-5">
          {[
            { step: "01", title: "운동을 기록하면", desc: "캘린더에 스탬프가 하나씩 쌓여요" },
            { step: "02", title: "연속으로 기록하면", desc: "연속 기록이 올라가요 🔥" },
            { step: "03", title: "통계에서 확인하면", desc: "나의 운동 패턴을 분석해드려요" },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <span className="text-[12px] font-bold text-[#FC5200] tabular-nums mt-0.5">{item.step}</span>
              <div>
                <p className="text-[14px] font-semibold text-stone-800">{item.title}</p>
                <p className="text-[12px] text-stone-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== Personal Dashboard (authenticated, has data) =====
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
      fetch("/api/workout?limit=5").then((r) => r.json()),
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

  // Loading
  if (status === "loading" || loading) {
    return (
      <div className="space-y-6 pt-2">
        <div className="h-12 w-48 rounded-lg bg-stone-100 animate-pulse" />
        <div className="h-6 w-64 rounded-lg bg-stone-50 animate-pulse" />
        <div className="flex gap-6 pt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-16 rounded-lg bg-stone-50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Not logged in → Public landing
  if (!isLoggedIn) {
    return <PublicLanding />;
  }

  // Logged in but no data → Welcome
  const hasData = recentWorkouts.length > 0 || (weeklyStatus?.monthTotalWorkouts ?? 0) > 0;
  if (!hasData) {
    return <WelcomeScreen userName={userName} />;
  }

  // ===== Dashboard with data =====
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
  const calOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Greeting */}
      <motion.div
        className="pt-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[13px] text-stone-400">
          {format(new Date(), "M월 d일 EEEE", { locale: ko })}
        </p>
        <h1 className="text-[20px] font-bold text-stone-900 mt-0.5 tracking-tight">
          {userName}님, {getGreeting()}
        </h1>
      </motion.div>

      {/* Stats Row - single row, no colored cards */}
      <motion.div
        className="flex items-end gap-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div>
          <span className="text-[32px] font-extrabold text-stone-900 leading-none tabular-nums">
            {weeklyStatus?.workoutsThisWeek || 0}
          </span>
          <span className="text-[13px] text-stone-400 ml-1">회</span>
          <p className="text-[11px] text-stone-400 mt-1">이번 주</p>
        </div>
        <div className="w-px h-8 bg-stone-200" />
        <div>
          <span className="text-[32px] font-extrabold text-stone-900 leading-none tabular-nums">
            {weeklyStatus?.thisWeekMinutes || 0}
          </span>
          <span className="text-[13px] text-stone-400 ml-1">분</span>
          <p className="text-[11px] text-stone-400 mt-1">운동 시간</p>
        </div>
        {streak > 0 && (
          <>
            <div className="w-px h-8 bg-stone-200" />
            <div>
              <span className="text-[32px] font-extrabold text-[#FC5200] leading-none tabular-nums">
                {streak}
              </span>
              <span className="text-[13px] text-[#FC5200] ml-1">일</span>
              <p className="text-[11px] text-[#FC5200]/60 mt-1">연속 🔥</p>
            </div>
          </>
        )}
      </motion.div>

      {/* This Week */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex justify-between">
          {weekDays.map(({ day, workout }, i) => {
            const dayLabel = ["월", "화", "수", "목", "금", "토", "일"][i];
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const category = workout?.category as keyof typeof EXERCISE_CATEGORIES | undefined;
            const catColor = category ? EXERCISE_CATEGORIES[category]?.color : null;

            return (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <span className={`text-[11px] font-medium ${isToday ? "text-[#FC5200]" : "text-stone-400"}`}>
                  {dayLabel}
                </span>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={workout ? {
                    background: `${catColor}15`,
                    boxShadow: `inset 0 0 0 2px ${catColor}40`,
                  } : isToday ? {
                    boxShadow: "inset 0 0 0 2px #FC5200",
                  } : {
                    background: "#F5F5F4",
                  }}
                >
                  {workout ? (
                    <span className="text-[15px]">{workout.icon || "✓"}</span>
                  ) : isToday ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FC5200]" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        ref={calRef}
        className="relative"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCalMonth(subMonths(calMonth, 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="text-[15px] font-bold text-stone-800 tracking-tight">
            {format(calMonth, "yyyy년 M월")}
          </span>
          <button
            onClick={() => setCalMonth(addMonths(calMonth, 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
            <div key={d} className="text-center text-[11px] text-stone-400 font-medium py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: calOffset }).map((_, i) => (
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
              <div key={dateStr} className="aspect-square flex items-center justify-center p-0.5">
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
                  className={`w-full h-full max-w-[36px] max-h-[36px] rounded-full flex items-center justify-center text-[12px] transition-all ${
                    isFuture ? "cursor-default" : "cursor-pointer hover:scale-105"
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

        {/* Popup */}
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
              <div className="bg-white rounded-2xl p-4 shadow-xl border border-stone-100 min-w-[160px]">
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
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">{selectedDay.icon || "🏋️"}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-stone-800">{selectedDay.exerciseType}</p>
                    <p className="text-[11px] text-stone-400">
                      {selectedDay.durationMin}분{selectedDay.distanceKm && ` · ${selectedDay.distanceKm}km`}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/workout/${selectedDay.workoutId}`}
                  className="mt-3 block text-center text-[12px] font-semibold text-[#FC5200] py-2 rounded-lg hover:bg-orange-50 transition-all"
                  onClick={() => { setSelectedDay(null); setPopupPos(null); }}
                >
                  상세 보기 →
                </Link>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2.5 h-2.5 bg-white border-b border-r border-stone-100 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-stone-800 tracking-tight">최근 기록</h2>
          <Link href="/workout" className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors">
            전체 →
          </Link>
        </div>
        <div className="space-y-1">
          {recentWorkouts.map((workout) => {
            const category = workout.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
            const catInfo = EXERCISE_CATEGORIES[category];
            return (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0 hover:bg-stone-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[16px] shrink-0"
                  style={{ background: `${catInfo?.color}12` }}
                >
                  {workout.exerciseType.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-stone-800">{workout.exerciseType.name}</p>
                  <p className="text-[12px] text-stone-400 mt-0.5">
                    {format(new Date(workout.date), "M월 d일 (E)", { locale: ko })}
                    {workout.distanceKm && ` · ${workout.distanceKm}km`}
                  </p>
                </div>
                <span className="text-[15px] font-bold text-stone-700 tabular-nums shrink-0">
                  {workout.durationMin}<span className="text-[11px] font-normal text-stone-400">분</span>
                </span>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Monthly Summary */}
      {(weeklyStatus?.monthTotalWorkouts ?? 0) > 0 && (
        <motion.div
          className="bg-stone-50 -mx-5 px-5 py-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-stone-400 font-medium">이번 달</p>
              <p className="text-[13px] font-semibold text-stone-700 mt-0.5">
                {weeklyStatus?.monthTotalWorkouts}회 · {weeklyStatus?.monthTotalMinutes}분
              </p>
            </div>
            <div className="relative group">
              <button className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                공유
              </button>
              <div className="absolute right-0 bottom-full mb-1 py-1 w-24 bg-white rounded-lg shadow-lg border border-stone-100 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20">
                <button onClick={() => handleShare("week")} className="w-full text-left px-3 py-2 text-[12px] text-stone-600 hover:bg-stone-50">주간</button>
                <button onClick={() => handleShare("month")} className="w-full text-left px-3 py-2 text-[12px] text-stone-600 hover:bg-stone-50">월간</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
