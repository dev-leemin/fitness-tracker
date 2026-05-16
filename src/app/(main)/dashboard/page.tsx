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
      fetch("/api/workout?limit=3").then((r) => r.json()),
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card animate-pulse">
            <div className="h-20 bg-white/[0.02] rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top: Weekly Progress + Quick Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Weekly Ring */}
        <div className="glow-card flex items-center gap-5">
          <div className="relative shrink-0">
            <svg width="72" height="72" className="transform -rotate-90">
              <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
              <motion.circle
                cx="36" cy="36" r="30" fill="none"
                stroke="#00FF87" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 30}
                initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 30 - (weeklyPercentage / 100) * 2 * Math.PI * 30 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ filter: "drop-shadow(0 0 4px rgba(0,255,135,0.3))" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{weeklyStatus?.workoutsThisWeek || 0}<span className="text-[10px] text-white/30">/{weeklyStatus?.goal || 3}</span></span>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-white/30 uppercase tracking-widest font-medium">이번 주</p>
            <p className="text-sm font-semibold text-white mt-0.5">
              {weeklyStatus && weeklyStatus.workoutsThisWeek >= weeklyStatus.goal
                ? "목표 달성!"
                : `${(weeklyStatus?.goal || 3) - (weeklyStatus?.workoutsThisWeek || 0)}회 남음`
              }
            </p>
            <div className="flex gap-1 mt-2">
              {["월", "화", "수", "목", "금", "토", "일"].map((_, i) => {
                const worked = weeklyStatus?.daysWorkedOut?.includes(String(i));
                return (
                  <div key={i} className={`w-[18px] h-[18px] rounded flex items-center justify-center text-[8px] font-bold ${
                    worked
                      ? "bg-[#00FF87]/12 text-[#00FF87] border border-[#00FF87]/20"
                      : "bg-white/[0.02] text-white/10 border border-white/[0.03]"
                  }`}>
                    {worked ? "✓" : "·"}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <Link href="/workout/new" className="block">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="h-full rounded-2xl p-5 bg-gradient-to-br from-[#00FF87]/[0.04] to-[#00D4FF]/[0.03] border border-[#00FF87]/8 flex flex-col justify-center hover:border-[#00FF87]/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF87] to-[#00c96b] flex items-center justify-center shadow-[0_0_12px_rgba(0,255,135,0.15)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div>
                <p className="font-semibold text-white text-[13px]">운동 기록하기</p>
                <p className="text-[11px] text-white/30 mt-0.5">오늘의 운동을 기록해보세요</p>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Calendar */}
      <div className="glass-card !p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => refetchCalendar(subMonths(currentMonth, 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 className="text-[13px] font-semibold text-white/60">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </h2>
          <button
            onClick={() => refetchCalendar(addMonths(currentMonth, 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="text-center text-[9px] font-medium text-white/20 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-[3px]">
          {Array.from({ length: emptyDays }).map((_, i) => (
            <div key={`e-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const workout = getWorkoutForDay(day);
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            return (
              <div key={day.toISOString()} className="aspect-square">
                {workout ? (
                  <Link
                    href={`/workout/${workout.workoutId}`}
                    className={`w-full h-full rounded-md flex items-center justify-center text-[10px] font-medium transition-all cursor-pointer ${
                      isToday
                        ? "bg-[#00FF87]/20 text-[#00FF87] ring-1 ring-[#00FF87]/40"
                        : "bg-[#00FF87]/8 text-[#00FF87]/70 hover:bg-[#00FF87]/15"
                    }`}
                    title={workout.exerciseType}
                  >
                    {workout.icon || "✓"}
                  </Link>
                ) : (
                  <div className={`w-full h-full rounded-md flex items-center justify-center text-[10px] ${
                    isToday
                      ? "text-white/60 font-semibold ring-1 ring-white/15 bg-white/[0.02]"
                      : "text-white/12"
                  }`}>
                    {format(day, "d")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar footer */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.03]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-[#00FF87]/15 border border-[#00FF87]/25" />
            <span className="text-[10px] text-white/25">운동한 날</span>
          </div>
          <span className="text-[11px] text-white/35 ml-auto">
            이번 달 <span className="text-[#00FF87] font-semibold">{calendarData.length}</span>회
          </span>
        </div>
      </div>

      {/* Group Members Status */}
      {groupMembers.length > 0 && (
        <div className="glass-card !p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] text-white/30 uppercase tracking-widest font-medium">그룹 이번 주</h2>
            <Link href="/group" className="text-[10px] text-[#00D4FF]/60 hover:text-[#00D4FF] transition-colors cursor-pointer">
              전체보기
            </Link>
          </div>
          <div className="space-y-2">
            {groupMembers.map((member, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#00FF87]/8 to-[#00D4FF]/8 border border-white/[0.04] flex items-center justify-center text-[9px] font-bold text-[#00FF87]/70">
                  {member.nickname[0]}
                </div>
                <span className="text-[12px] text-white/50 flex-1">{member.nickname}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: weeklyStatus?.goal || 3 }).map((_, j) => (
                    <div
                      key={j}
                      className={`w-[6px] h-[6px] rounded-full ${
                        j < member.workoutCount
                          ? "bg-[#00FF87]/50"
                          : "bg-white/[0.05]"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-white/25 ml-1.5">{member.workoutCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] text-white/30 uppercase tracking-widest font-medium">최근 기록</h2>
            <Link href="/workout" className="text-[10px] text-[#00D4FF]/60 hover:text-[#00D4FF] transition-colors cursor-pointer">
              전체보기
            </Link>
          </div>
          <div className="space-y-1">
            {recentWorkouts.map((workout, i) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/workout/${workout.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.025] transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.025] border border-white/[0.05] flex items-center justify-center text-sm group-hover:border-white/[0.1] transition-colors">
                    {workout.exerciseType.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-white/70">{workout.exerciseType.name}</p>
                    <p className="text-[10px] text-white/25">
                      {format(new Date(workout.date), "M.d (E)", { locale: ko })} · {workout.durationMin}분
                      {workout.distanceKm && ` · ${workout.distanceKm}km`}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentWorkouts.length === 0 && (
        <div className="glass-card text-center py-12">
          <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-3">
            <span className="text-2xl">💪</span>
          </div>
          <p className="text-white/35 text-sm">아직 운동 기록이 없습니다</p>
          <Link href="/workout/new" className="inline-block mt-3 text-[12px] text-[#00FF87] hover:underline cursor-pointer">
            첫 운동을 기록해보세요 →
          </Link>
        </div>
      )}
    </motion.div>
  );
}
