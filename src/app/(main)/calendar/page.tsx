"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EXERCISE_CATEGORIES } from "@/lib/constants";

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

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setLoading(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    fetch(`/api/calendar?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => setCalendarData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);
  const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const getWorkoutForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return calendarData.find((d) => d.date === dateStr);
  };

  const workoutCount = calendarData.length;
  const totalDuration = calendarData.reduce((sum, d) => sum + d.durationMin, 0);

  // Count categories
  const categoryCount: Record<string, number> = {};
  calendarData.forEach((d) => {
    categoryCount[d.category] = (categoryCount[d.category] || 0) + 1;
  });

  const goToPrevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-5">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-700 hover:border-stone-300 transition-all active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-bold text-stone-900">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </h1>
        <button
          onClick={goToNextMonth}
          className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-700 hover:border-stone-300 transition-all active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          className="bg-white border border-stone-200 rounded-xl shadow-sm !p-4 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-2xl font-bold text-stone-800">{workoutCount}</p>
          <p className="text-[10px] text-stone-400 mt-1">운동일</p>
        </motion.div>
        <motion.div
          className="bg-white border border-stone-200 rounded-xl shadow-sm !p-4 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
        >
          <p className="text-2xl font-bold text-emerald-500">
            {Math.floor(totalDuration / 60)}<span className="text-sm text-stone-400">h </span>{totalDuration % 60}<span className="text-sm text-stone-400">m</span>
          </p>
          <p className="text-[10px] text-stone-400 mt-1">총 시간</p>
        </motion.div>
        <motion.div
          className="bg-white border border-stone-200 rounded-xl shadow-sm !p-4 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <p className="text-2xl font-bold text-orange-500">{days.length > 0 ? Math.round((workoutCount / days.length) * 100) : 0}%</p>
          <p className="text-[10px] text-stone-400 mt-1">달성률</p>
        </motion.div>
      </div>

      {/* Calendar Grid — Stamp Style */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.toISOString()}
          className="bg-white border border-stone-200 rounded-xl shadow-sm !p-5"
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.25 }}
        >
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-3">
            {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => (
              <div key={d} className={`text-center text-[11px] font-medium py-1.5 ${
                i >= 5 ? "text-orange-500/40" : "text-stone-400"
              }`}>
                {d}
              </div>
            ))}
          </div>

          {/* Day grid — stamps */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: emptyDays }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map((day, idx) => {
              const workout = getWorkoutForDay(day);
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              const category = workout?.category as keyof typeof EXERCISE_CATEGORIES | undefined;
              const catInfo = category ? EXERCISE_CATEGORIES[category] : null;

              return (
                <motion.div
                  key={day.toISOString()}
                  className="aspect-square p-0.5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.01, duration: 0.2 }}
                >
                  {workout ? (
                    <Link
                      href={`/workout/${workout.workoutId}`}
                      className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all hover:scale-110 relative group`}
                      style={{
                        background: `linear-gradient(135deg, ${catInfo?.color}15, ${catInfo?.color}08)`,
                        border: `1.5px solid ${catInfo?.color}30`,
                        boxShadow: `0 4px 12px ${catInfo?.color}15`,
                      }}
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">{workout.icon}</span>
                      <span className="text-[8px] font-medium mt-0.5" style={{ color: `${catInfo?.color}90` }}>
                        {format(day, "d")}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href={`/workout/new?date=${format(day, "yyyy-MM-dd")}`}
                      className={`w-full h-full rounded-xl flex items-center justify-center text-[12px] transition-all hover:bg-stone-100 ${
                        isToday
                          ? "today-ring bg-orange-500/5 text-orange-500 font-bold"
                          : "text-stone-300 border border-dashed border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      {format(day, "d")}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Category Legend */}
      {Object.keys(categoryCount).length > 0 && (
        <motion.div
          className="bg-white border border-stone-200 rounded-xl shadow-sm !p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-3">카테고리 분포</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryCount).map(([cat, count]) => {
              const catInfo = EXERCISE_CATEGORIES[cat as keyof typeof EXERCISE_CATEGORIES];
              return (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: catInfo?.bgAlpha,
                    border: `1px solid ${catInfo?.borderAlpha}`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: catInfo?.color }} />
                  <span className="text-[11px] font-medium" style={{ color: catInfo?.color }}>{catInfo?.label}</span>
                  <span className="text-[10px] text-stone-400">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="w-6 h-6 mx-auto border-2 border-orange-400/30 border-t-[#7C5CFC] rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}