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

  const shareInviteLink = () => {
    if (group) {
      const link = `${window.location.origin}/group/join?code=${group.inviteCode}`;
      if (navigator.share) {
        navigator.share({ title: `${group.name} 그룹 초대`, text: `FitLog에서 "${group.name}" 그룹에 참여하세요!`, url: link });
      } else {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (loading) {
    return <div className="space-y-3"><div className="skeleton h-24" /><div className="skeleton h-48" /></div>;
  }

  if (!group) {
    return <div className="bento-card text-center py-10 text-white/30 text-sm">그룹을 찾을 수 없습니다.</div>;
  }

  const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div className="space-y-4">
      {/* 그룹 헤더 */}
      <div className="bento-card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">{group.name}</h1>
            {group.description && (
              <p className="text-sm text-white/40 mt-1">{group.description}</p>
            )}
            <p className="text-sm text-white/25 mt-2">
              주 {group.weeklyGoal}회 목표 · {group.weeklyStatus.length}명
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={copyInviteCode}
              className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                copied
                  ? "bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/30"
                  : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              {copied ? "복사됨!" : group.inviteCode}
            </button>
            <button
              onClick={shareInviteLink}
              className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] flex items-center justify-center text-white/40 hover:text-white/60 transition-all cursor-pointer"
              title="초대 링크 공유"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 이번 주 현황 테이블 */}
      <motion.div
        className="bento-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-[13px] font-medium text-white/70 mb-4">이번 주 현황</h2>
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
                      <div className="w-6 h-6 bg-white/[0.04] border border-white/[0.06] rounded-md flex items-center justify-center text-[9px] font-bold text-white/40">
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
                          ? "bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20"
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
      <div className="bento-card">
        <h2 className="text-[13px] font-medium text-white/70 mb-4">멤버</h2>
        <div className="space-y-3">
          {group.weeklyStatus.map((member) => (
            <div key={member.userId} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/[0.04] border border-white/[0.06] rounded-lg flex items-center justify-center text-[10px] font-bold text-white/40">
                {member.nickname[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80">{member.nickname}</p>
                <p className="text-xs text-white/30">{member.name}</p>
              </div>
              {member.role === "OWNER" && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
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
