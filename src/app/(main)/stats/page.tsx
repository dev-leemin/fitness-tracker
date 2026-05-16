"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";

interface StatsData {
  weeklyData: { week: string; count: number; goal: number }[];
  monthlyData: { month: string; count: number; totalDuration: number; totalDistance: number }[];
  typeStats: { name: string; icon: string; category: string; count: number }[];
  totalWorkouts: number;
  totalDuration: number;
  totalDistance: number;
  totalCalories: number;
  currentStreak: number;
  longestStreak: number;
}

const COLORS = ["#00FF87", "#00D4FF", "#A855F7", "#FF8C00", "#FF006E", "#14b8a6", "#6366f1"];

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card animate-pulse">
            <div className="h-48 bg-white/[0.02] rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const customTooltipStyle = {
    backgroundColor: "rgba(15, 15, 25, 0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#fff",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">운동 통계</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { value: stats.totalWorkouts, label: "총 운동 횟수", color: "#00FF87", suffix: "회" },
          { value: Math.floor(stats.totalDuration / 60), label: "총 운동 시간", color: "#00D4FF", suffix: "h" },
          { value: stats.totalDistance.toFixed(1), label: "총 거리", color: "#A855F7", suffix: "km" },
          { value: stats.currentStreak, label: "연속 달성", color: "#FF8C00", suffix: "주" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="glass-card text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <p className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value}<span className="text-sm ml-0.5">{item.suffix}</span>
            </p>
            <p className="text-[11px] text-white/40 mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 주간 운동 빈도 */}
      <div className="glow-card">
        <h2 className="text-base font-semibold text-white mb-4">주간 운동 횟수</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={customTooltipStyle} />
            <ReferenceLine y={3} stroke="#FF8C00" strokeDasharray="5 5" strokeOpacity={0.5} />
            <Bar dataKey="count" fill="#00FF87" radius={[6, 6, 0, 0]} fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 월간 추이 */}
      <div className="glass-card">
        <h2 className="text-base font-semibold text-white mb-4">월간 운동 시간 (분)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Line
              type="monotone"
              dataKey="totalDuration"
              stroke="#00D4FF"
              strokeWidth={2.5}
              dot={{ fill: "#00D4FF", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#00D4FF", stroke: "rgba(0,212,255,0.3)", strokeWidth: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 운동 종류 분포 */}
      <div className="glass-card">
        <h2 className="text-base font-semibold text-white mb-4">운동 종류 분포</h2>
        {stats.typeStats.length > 0 ? (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="45%" height={180}>
              <PieChart>
                <Pie
                  data={stats.typeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="count"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {stats.typeStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {stats.typeStats.map((type, i) => (
                <div key={type.name} className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm text-white/70">{type.icon} {type.name}</span>
                  <span className="text-sm text-white/30 ml-auto">{type.count}회</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-white/30 py-8">데이터가 없습니다</p>
        )}
      </div>

      {/* 스트릭 */}
      <div className="glass-card">
        <h2 className="text-base font-semibold text-white mb-4">연속 기록</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-5 rounded-xl bg-[#FF8C00]/[0.06] border border-[#FF8C00]/20">
            <p className="text-3xl font-bold text-[#FF8C00]">{stats.currentStreak}</p>
            <p className="text-xs text-white/40 mt-1">현재 연속 (주)</p>
          </div>
          <div className="text-center p-5 rounded-xl bg-[#A855F7]/[0.06] border border-[#A855F7]/20">
            <p className="text-3xl font-bold text-[#A855F7]">{stats.longestStreak}</p>
            <p className="text-xs text-white/40 mt-1">최장 연속 (주)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
