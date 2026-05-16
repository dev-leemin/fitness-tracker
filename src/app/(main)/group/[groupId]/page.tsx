"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

interface MemberStatus {
  userId: string;
  nickname: string;
  name: string;
  role: string;
  workoutCount: number;
  days: number[];
  workouts: { date: string; icon: string; name: string }[];
}

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  weeklyGoal: number;
  weeklyStatus: MemberStatus[];
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/group/${groupId}`)
      .then((r) => r.json())
      .then((data) => setGroup(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [groupId]);

  const copyInviteCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="glass-card animate-pulse"><div className="h-60 bg-white/[0.02] rounded-lg" /></div>;
  }

  if (!group) {
    return <div className="glass-card text-center py-8 text-white/40">그룹을 찾을 수 없습니다.</div>;
  }

  const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div className="space-y-6">
      {/* 그룹 헤더 */}
      <div className="glow-card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{group.name}</h1>
            {group.description && (
              <p className="text-sm text-white/40 mt-1">{group.description}</p>
            )}
            <p className="text-sm text-white/25 mt-2">
              주 {group.weeklyGoal}회 목표 · {group.weeklyStatus.length}명
            </p>
          </div>
          <button
            onClick={copyInviteCode}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              copied
                ? "bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30"
                : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:border-white/[0.15]"
            }`}
          >
            {copied ? "복사됨!" : `초대코드: ${group.inviteCode}`}
          </button>
        </div>
      </div>

      {/* 이번 주 현황 테이블 */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-base font-semibold text-white mb-4">이번 주 현황</h2>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4 uppercase tracking-wider">
                  멤버
                </th>
                {dayLabels.map((d) => (
                  <th key={d} className="text-center text-xs font-medium text-white/30 pb-3 w-10">
                    {d}
                  </th>
                ))}
                <th className="text-center text-xs font-medium text-white/30 pb-3 pl-4">
                  합계
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {group.weeklyStatus.map((member) => (
                <tr key={member.userId}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-[#00FF87]/20 to-[#00D4FF]/20 rounded-full flex items-center justify-center text-[10px] font-bold text-[#00FF87]">
                        {member.nickname[0]}
                      </div>
                      <span className="text-sm font-medium text-white/80 whitespace-nowrap">
                        {member.nickname}
                      </span>
                    </div>
                  </td>
                  {dayLabels.map((_, dayIndex) => {
                    const worked = member.days.includes(dayIndex);
                    const workout = member.workouts.find((w) => {
                      const d = new Date(w.date).getDay();
                      return (d === 0 ? 6 : d - 1) === dayIndex;
                    });
                    return (
                      <td key={dayIndex} className="text-center py-3">
                        {worked ? (
                          <span className="text-base" title={workout?.name}>
                            {workout?.icon || "✓"}
                          </span>
                        ) : (
                          <span className="text-white/10">·</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center py-3 pl-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        member.workoutCount >= group.weeklyGoal
                          ? "bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20"
                          : "bg-white/[0.04] text-white/40 border border-white/[0.06]"
                      }`}
                    >
                      {member.workoutCount}/{group.weeklyGoal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 멤버 목록 */}
      <div className="glass-card">
        <h2 className="text-base font-semibold text-white mb-4">멤버</h2>
        <div className="space-y-3">
          {group.weeklyStatus.map((member) => (
            <div key={member.userId} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#00FF87]/15 to-[#00D4FF]/15 rounded-full flex items-center justify-center text-xs font-bold text-[#00FF87] border border-[#00FF87]/20">
                {member.nickname[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80">{member.nickname}</p>
                <p className="text-xs text-white/30">{member.name}</p>
              </div>
              {member.role === "OWNER" && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FF8C00]/10 text-[#FF8C00] border border-[#FF8C00]/20">
                  방장
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
