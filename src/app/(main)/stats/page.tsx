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

const COLORS = ["#7C5CFC", "#34D399", "#60A5FA", "#FB923C", "#F87171", "#C084FC"];

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
        <div className="skeleton h-12 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (<div key={i} className="skeleton h-24 rounded-3xl" />))}
        </div>
        <div className="skeleton h-56 rounded-3xl" />
      </div>
    );
  }

  if (!stats) return null;

  const customTooltipStyle = {
    backgroundColor: "rgba(15, 17, 25, 0.95)",
    border: "1px solid rgba(124,92,252,0.15)",
    borderRadius: "14px",
    color: "#fff",
    fontSize: "12px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  };

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-white">통계</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { value: stats.totalWorkouts, label: "총 운동", color: "#7C5CFC", suffix: "회" },
          { value: Math.floor(stats.totalDuration / 60), label: "총 시간", color: "#34D399", suffix: "h" },
          { value: stats.totalDistance.toFixed(1), label: "총 거리", color: "#60A5FA", suffix: "km" },
          { value: stats.currentStreak, label: "연속 달성", color: "#FB923C", suffix: "주" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="card-glass !p-4 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <p className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value}<span className="text-[11px] font-normal ml-0.5 opacity-50">{item.suffix}</span>
            </p>
            <p className="text-[10px] text-white/30 mt-1.5">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <motion.div
        className="card-glass"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-[13px] font-medium text-white/60 mb-4">주간 운동 횟수</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.weeklyData}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C5CFC" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={customTooltipStyle} />
            <ReferenceLine y={3} stroke="rgba(251,146,60,0.3)" strokeDasharray="4 4" />
            <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Monthly line chart */}
      <motion.div
        className="card-glass"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-[13px] font-medium text-white/60 mb-4">월간 운동 시간 (분)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.monthlyData}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Line
              type="monotone"
              dataKey="totalDuration"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              dot={{ fill: "#34D399", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#34D399", stroke: "rgba(52,211,153,0.3)", strokeWidth: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie chart */}
      <motion.div
        className="card-glass"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-[13px] font-medium text-white/60 mb-4">운동 종류 분포</h2>
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
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: COLORS[i % COLORS.length], boxShadow: `0 0 6px ${COLORS[i % COLORS.length]}40` }}
                  />
                  <span className="text-[12px] text-white/60">{type.icon} {type.name}</span>
                  <span className="text-[11px] text-white/25 ml-auto font-medium">{type.count}회</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-white/25 py-8 text-[13px]">데이터가 없습니다</p>
        )}
      </motion.div>

      {/* Streak */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="card-glass !p-5 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <span className="streak-fire text-2xl">🔥</span>
          <p className="text-2xl font-bold text-[#FB923C] mt-1">{stats.currentStreak}</p>
          <p className="text-[10px] text-white/30 mt-1">현재 연속 (주)</p>
        </motion.div>
        <motion.div
          className="card-glass !p-5 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-2xl">🏆</span>
          <p className="text-2xl font-bold text-[#FBBF24] mt-1">{stats.longestStreak}</p>
          <p className="text-[10px] text-white/30 mt-1">최장 연속 (주)</p>
        </motion.div>
      </div>
    </div>
  );
}
