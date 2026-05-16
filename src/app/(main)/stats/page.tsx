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
import { EXERCISE_CATEGORIES } from "@/lib/constants";

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

const COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f97316", "#6b7280", "#ef4444", "#14b8a6"];

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
          <div key={i} className="card animate-pulse">
            <div className="h-48 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">운동 통계</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalWorkouts}</p>
          <p className="text-xs text-gray-500">총 운동 횟수</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-green-600">
            {Math.floor(stats.totalDuration / 60)}h
          </p>
          <p className="text-xs text-gray-500">총 운동 시간</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-purple-600">
            {stats.totalDistance.toFixed(1)}km
          </p>
          <p className="text-xs text-gray-500">총 거리</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-orange-600">
            {stats.currentStreak}주
          </p>
          <p className="text-xs text-gray-500">연속 달성</p>
        </div>
      </div>

      {/* 주간 운동 빈도 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">주간 운동 횟수</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <ReferenceLine y={3} stroke="#f59e0b" strokeDasharray="5 5" label="목표" />
            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 월간 추이 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">월간 운동 시간 (분)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="totalDuration"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: "#22c55e", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 운동 종류 분포 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">운동 종류 분포</h2>
        {stats.typeStats.length > 0 ? (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={stats.typeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="name"
                >
                  {stats.typeStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {stats.typeStats.map((type, i) => (
                <div key={type.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm">{type.icon} {type.name}</span>
                  <span className="text-sm text-gray-500 ml-auto">{type.count}회</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">데이터가 없습니다</p>
        )}
      </div>

      {/* 스트릭 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">연속 기록</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-3xl font-bold text-orange-600">{stats.currentStreak}</p>
            <p className="text-sm text-gray-600 mt-1">현재 연속 (주)</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-3xl font-bold text-purple-600">{stats.longestStreak}</p>
            <p className="text-sm text-gray-600 mt-1">최장 연속 (주)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
