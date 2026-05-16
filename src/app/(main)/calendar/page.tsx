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
    <div className="space-y-6">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-10 h-10 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/50 hover:bg-white/[0.04] hover:text-white transition-all"
        >
          &#8592;
        </button>
        <h1 className="text-xl font-bold text-white">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </h1>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-10 h-10 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/50 hover:bg-white/[0.04] hover:text-white transition-all"
        >
          &#8594;
        </button>
      </div>

      {/* 월간 요약 */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="glass-card text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-2xl font-bold text-[#6366F1]">{workoutCount}</p>
          <p className="text-xs text-white/40 mt-1">이번 달 운동</p>
        </motion.div>
        <motion.div
          className="glass-card text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-2xl font-bold text-[#818CF8]">
            {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
          </p>
          <p className="text-xs text-white/40 mt-1">총 운동 시간</p>
        </motion.div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="glow-card">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-3">
          {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-white/30 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
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
                    className={`w-full h-full rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 bg-[#6366F1]/[0.08] border ${
                      isToday ? "border-[#6366F1]/50 shadow-[0_0_10px_rgba(0,255,135,0.15)]" : "border-[#6366F1]/20"
                    }`}
                  >
                    <span className="text-base">{workout.icon}</span>
                    <span className="text-[9px] text-[#6366F1]/70">
                      {format(day, "d")}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href={`/workout/new?date=${format(day, "yyyy-MM-dd")}`}
                    className={`w-full h-full rounded-lg flex items-center justify-center text-sm transition-all hover:bg-white/[0.04] ${
                      isToday
                        ? "ring-1 ring-[#6366F1]/50 text-[#6366F1] font-bold"
                        : "text-white/25"
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
        <div className="text-center text-white/30 text-sm">불러오는 중...</div>
      )}
    </div>
  );
}
