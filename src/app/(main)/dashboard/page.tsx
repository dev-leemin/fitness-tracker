"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const month = currentMonth;
    Promise.all([
      fetch("/api/workout?limit=5").then((r) => r.json()),
      fetch("/api/stats/weekly").then((r) => r.json()),
      fetch(`/api/calendar?year=${month.getFullYear()}&month=${month.getMonth() + 1}`).then((r) => r.json()),
      fetch("/api/group").then((r) => r.json()),
    ])
      .then(([workoutData, weeklyData, calData, groupData]) => {
        setRecentWorkouts(workoutData.workouts || []);
        setWeeklyStatus(weeklyData);
        setCalendarData(calData || []);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetchCalendar = (month: Date) => {
    setCurrentMonth(month);
    fetch(`/api/calendar?year=${month.getFullYear()}&month=${month.getMonth() + 1}`)
      .then((r) => r.json())
      .then((data) => setCalendarData(data || []))
      .catch(() => {});
  };

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const getWorkoutForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return calendarData.find((d) => d.date === dateStr);
  };

  const weeklyPercentage = weeklyStatus
    ? Math.min((weeklyStatus.workoutsThisWeek / weeklyStatus.goal) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`skeleton ${i === 1 ? "h-36 sm:col-span-2" : "h-28"}`} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {/* Weekly Progress - Hero tile */}
        <motion.div
          className="col-span-2 bento-card !p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] text-white/35 font-medium uppercase tracking-wider">이번 주 목표</p>
              <p className="text-2xl font-bold text-white mt-1">
                {weeklyStatus?.workoutsThisWeek || 0}
                <span className="text-sm font-normal text-white/25 ml-1">/ {weeklyStatus?.goal || 3}회</span>
              </p>
            </div>
            <div className="relative w-16 h-16">
              <svg width="64" height="64" className="transform -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                <motion.circle
                  cx="32" cy="32" r="26" fill="none"
                  stroke="#6366F1" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 26 - (weeklyPercentage / 100) * 2 * Math.PI * 26 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white/70">{Math.round(weeklyPercentage)}%</span>
              </div>
            </div>
          </div>
          {/* Week day indicators */}
          <div className="flex gap-1.5">
            {["월", "화", "수", "목", "금", "토", "일"].map((day, i) => {
              const worked = weeklyStatus?.daysWorkedOut?.includes(String(i));
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[9px] text-white/25 font-medium">{day}</span>
                  <div className={`w-full h-1.5 rounded-full ${
                    worked ? "bg-[#6366F1]" : "bg-white/[0.04]"
                  }`} />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Action */}
        <motion.div
          className="col-span-1 bento-card bento-card-interactive !p-4 flex flex-col justify-between"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/workout/new" className="flex flex-col h-full justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/15 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div className="mt-3">
              <p className="text-[13px] font-semibold text-white">기록하기</p>
              <p className="text-[10px] text-white/30 mt-0.5">운동 추가</p>
            </div>
          </Link>
        </motion.div>

        {/* Streak / Monthly Count */}
        <motion.div
          className="col-span-1 bento-card !p-4 flex flex-col justify-between"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 border border-[#10B981]/15 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white">{calendarData.length}</p>
            <p className="text-[10px] text-white/30 mt-0.5">이번 달 운동</p>
          </div>
        </motion.div>

        {/* Mini Calendar */}
        <motion.div
          className="col-span-2 sm:col-span-2 bento-card !p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <button
              onClick={() => refetchCalendar(subMonths(currentMonth, 1))}
              className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <h3 className="text-[12px] font-medium text-white/50">
              {format(currentMonth, "yyyy. M", { locale: ko })}
            </h3>
            <button
              onClick={() => refetchCalendar(addMonths(currentMonth, 1))}
              className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          {/* Compact day headers */}
          <div className="grid grid-cols-7 mb-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-[8px] font-medium text-white/15 py-0.5">
                {d}
              </div>
            ))}
          </div>

          {/* Compact dot calendar */}
          <div className="grid grid-cols-7 gap-[2px]">
            {Array.from({ length: emptyDays }).map((_, i) => (
              <div key={`e-${i}`} className="h-5" />
            ))}
            {days.map((day) => {
              const workout = getWorkoutForDay(day);
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              return (
                <div key={day.toISOString()} className="flex items-center justify-center h-5">
                  {workout ? (
                    <Link
                      href={`/workout/${workout.workoutId}`}
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        isToday
                          ? "bg-[#6366F1] ring-2 ring-[#6366F1]/30"
                          : "bg-[#6366F1]/60 hover:bg-[#6366F1]/80"
                      }`}
                      title={workout.exerciseType}
                    >
                      <span className="text-[7px] text-white font-bold">{format(day, "d")}</span>
                    </Link>
                  ) : (
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isToday
                        ? "ring-1 ring-white/20 bg-white/[0.04]"
                        : ""
                    }`}>
                      <span className={`text-[8px] ${isToday ? "text-white/60 font-medium" : "text-white/10"}`}>
                        {format(day, "d")}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Group Status */}
        {groupMembers.length > 0 && (
          <motion.div
            className="col-span-2 bento-card !p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-white/30 font-medium uppercase tracking-wider">그룹 현황</p>
              <Link href="/group" className="text-[10px] text-[#6366F1]/70 hover:text-[#6366F1] transition-colors">
                전체보기
              </Link>
            </div>
            <div className="space-y-2">
              {groupMembers.slice(0, 4).map((member, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white/40">{member.nickname[0]}</span>
                  </div>
                  <span className="text-[11px] text-white/50 flex-1 truncate">{member.nickname}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: weeklyStatus?.goal || 3 }).map((_, j) => (
                      <div
                        key={j}
                        className={`w-1.5 h-1.5 rounded-full ${
                          j < member.workoutCount ? "bg-[#6366F1]" : "bg-white/[0.06]"
                        }`}
                      />
                    ))}
                    <span className="text-[9px] text-white/25 ml-1">{member.workoutCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-[11px] text-white/30 font-medium uppercase tracking-wider">최근 기록</h2>
            <Link href="/workout" className="text-[10px] text-[#6366F1]/70 hover:text-[#6366F1] transition-colors">
              전체보기
            </Link>
          </div>
          <div className="space-y-1">
            {recentWorkouts.map((workout, i) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
              >
                <Link
                  href={`/workout/${workout.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.025] transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-sm group-hover:border-white/[0.1] transition-colors">
                    {workout.exerciseType.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-white/70">{workout.exerciseType.name}</p>
                    <p className="text-[10px] text-white/25">
                      {format(new Date(workout.date), "M.d (E)", { locale: ko })} · {workout.durationMin}분
                      {workout.distanceKm && ` · ${workout.distanceKm}km`}
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10 group-hover:text-white/25 transition-colors" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="bento-card text-center py-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-12 h-12 mx-auto rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <span className="text-xl">💪</span>
          </div>
          <p className="text-white/30 text-sm">아직 운동 기록이 없습니다</p>
          <Link href="/workout/new" className="inline-block mt-3 text-[12px] text-[#6366F1] hover:text-[#818CF8] transition-colors">
            첫 운동을 기록해보세요 →
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
