"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { motion } from "framer-motion";

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

  return (
    <div className="space-y-5">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-9 h-9 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-semibold text-white">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </h1>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-9 h-9 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="bento-card !p-4 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-2xl font-bold text-[#6366F1]">{workoutCount}</p>
          <p className="text-[10px] text-white/30 mt-1">이�� 달 운동</p>
        </motion.div>
        <motion.div
          className="bento-card !p-4 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
        >
          <p className="text-2xl font-bold text-[#06B6D4]">
            {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
          </p>
          <p className="text-[10px] text-white/30 mt-1">총 운동 시간</p>
        </motion.div>
      </div>

      {/* Calendar Grid */}
      <div className="bento-card !p-5">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-white/25 py-1.5">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: emptyDays }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {days.map((day) => {
            const workout = getWorkoutForDay(day);
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

            return (
              <div key={day.toISOString()} className="aspect-square p-0.5">
                {workout ? (
                  <Link
                    href={`/workout/${workout.workoutId}`}
                    className={`w-full h-full rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 bg-[#6366F1]/[0.06] border ${
                      isToday ? "border-[#6366F1]/40 shadow-[0_0_8px_rgba(99,102,241,0.15)]" : "border-[#6366F1]/15"
                    }`}
                  >
                    <span className="text-sm">{workout.icon}</span>
                    <span className="text-[8px] text-[#6366F1]/70 mt-0.5">
                      {format(day, "d")}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href={`/workout/new?date=${format(day, "yyyy-MM-dd")}`}
                    className={`w-full h-full rounded-lg flex items-center justify-center text-[12px] transition-all hover:bg-white/[0.03] ${
                      isToday
                        ? "ring-1 ring-[#6366F1]/40 text-white/70 font-semibold"
                        : "text-white/20"
                    }`}
                  >
                    {format(day, "d")}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="text-center text-white/20 text-[12px]">불러오는 중...</div>
      )}
    </div>
  );
}
