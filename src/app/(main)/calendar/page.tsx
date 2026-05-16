"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";

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

  // 월요일 시작 기준 빈 칸 수
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
          className="btn-secondary !px-3 !py-2"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </h1>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="btn-secondary !px-3 !py-2"
        >
          →
        </button>
      </div>

      {/* 월간 요약 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-primary">{workoutCount}</p>
          <p className="text-sm text-gray-500">이번 달 운동</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-green-600">
            {Math.floor(totalDuration / 60)}시간 {totalDuration % 60}분
          </p>
          <p className="text-sm text-gray-500">총 운동 시간</p>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="card">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-2">
          {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {/* 빈 칸 */}
          {Array.from({ length: emptyDays }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* 날짜들 */}
          {days.map((day) => {
            const workout = getWorkoutForDay(day);
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

            return (
              <div key={day.toISOString()} className="aspect-square p-0.5">
                {workout ? (
                  <Link
                    href={`/workout/${workout.workoutId}`}
                    className={`w-full h-full rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 ${
                      isToday ? "ring-2 ring-primary" : ""
                    } bg-green-100`}
                  >
                    <span className="text-lg">{workout.icon}</span>
                    <span className="text-[10px] text-gray-600">
                      {format(day, "d")}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href={`/workout/new?date=${format(day, "yyyy-MM-dd")}`}
                    className={`w-full h-full rounded-lg flex items-center justify-center text-sm hover:bg-gray-50 transition-colors ${
                      isToday
                        ? "ring-2 ring-primary font-bold text-primary"
                        : "text-gray-400"
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
        <div className="text-center text-gray-400 text-sm">불러오는 중...</div>
      )}
    </div>
  );
}
