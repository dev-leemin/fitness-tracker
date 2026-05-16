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

const COLORS = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"];

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
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-44" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const customTooltipStyle = {
    backgroundColor: "rgba(9, 9, 11, 0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "12px",
  };

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-white">통계</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { value: stats.totalWorkouts, label: "총 운동", color: "#6366F1", suffix: "회" },
          { value: Math.floor(stats.totalDuration / 60), label: "총 시간", color: "#06B6D4", suffix: "h" },
          { value: stats.totalDistance.toFixed(1), label: "총 거리", color: "#10B981", suffix: "km" },
          { value: stats.currentStreak, label: "연속 달성", color: "#F59E0B", suffix: "주" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="bento-card !p-4 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <p className="text-xl font-bold" style={{ color: item.color }}>
              {item.value}<span className="text-[11px] font-normal ml-0.5 opacity-60">{item.suffix}</span>
            </p>
            <p className="text-[10px] text-white/30 mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="bento-card">
        <h2 className="text-[13px] font-medium text-white/70 mb-4">주간 운동 횟수</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={customTooltipStyle} />
            <ReferenceLine y={3} stroke="rgba(245,158,11,0.3)" strokeDasharray="4 4" />
            <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly line chart */}
      <div className="bento-card">
        <h2 className="text-[13px] font-medium text-white/70 mb-4">월간 운동 시간 (분)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Line
              type="monotone"
              dataKey="totalDuration"
              stroke="#06B6D4"
              strokeWidth={2}
              dot={{ fill: "#06B6D4", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#06B6D4", stroke: "rgba(6,182,212,0.3)", strokeWidth: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart */}
      <div className="bento-card">
        <h2 className="text-[13px] font-medium text-white/70 mb-4">운동 종류 분포</h2>
        {stats.typeStats.length > 0 ? (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="45%" height={160}>
              <PieChart>
                <Pie
                  data={stats.typeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  dataKey="count"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {stats.typeStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {stats.typeStats.map((type, i) => (
                <div key={type.name} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-[12px] text-white/60">{type.icon} {type.name}</span>
                  <span className="text-[11px] text-white/25 ml-auto">{type.count}회</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-white/25 py-8 text-[13px]">데이터가 없습니다</p>
        )}
      </div>

      {/* Streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bento-card !p-5 text-center">
          <p className="text-2xl font-bold text-[#F59E0B]">{stats.currentStreak}</p>
          <p className="text-[10px] text-white/30 mt-1">현재 연속 (주)</p>
        </div>
        <div className="bento-card !p-5 text-center">
          <p className="text-2xl font-bold text-[#8B5CF6]">{stats.longestStreak}</p>
          <p className="text-[10px] text-white/30 mt-1">최장 연속 (주)</p>
        </div>
      </div>
    </div>
  );
}
