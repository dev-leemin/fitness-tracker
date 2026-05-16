"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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
    return <div className="card animate-pulse"><div className="h-60 bg-gray-100 rounded-lg" /></div>;
  }

  if (!group) {
    return <div className="card text-center py-8 text-gray-500">그룹을 찾을 수 없습니다.</div>;
  }

  const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div className="space-y-6">
      {/* 그룹 헤더 */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
            {group.description && (
              <p className="text-sm text-gray-500 mt-1">{group.description}</p>
            )}
            <p className="text-sm text-gray-400 mt-2">
              주 {group.weeklyGoal}회 목표 · {group.weeklyStatus.length}명
            </p>
          </div>
          <button
            onClick={copyInviteCode}
            className="btn-secondary text-sm"
          >
            {copied ? "복사됨!" : `���대코드: ${group.inviteCode}`}
          </button>
        </div>
      </div>

      {/* 이번 주 현황 테이블 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">이번 주 현황</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 pb-3 pr-4">
                  멤버
                </th>
                {dayLabels.map((d) => (
                  <th key={d} className="text-center text-sm font-medium text-gray-500 pb-3 w-10">
                    {d}
                  </th>
                ))}
                <th className="text-center text-sm font-medium text-gray-500 pb-3 pl-4">
                  합계
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {group.weeklyStatus.map((member) => (
                <tr key={member.userId}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center text-xs font-medium text-primary">
                        {member.nickname[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
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
                          <span className="text-lg" title={workout?.name}>
                            {workout?.icon || "✓"}
                          </span>
                        ) : (
                          <span className="text-gray-300">·</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center py-3 pl-4">
                    <span
                      className={`badge ${
                        member.workoutCount >= group.weeklyGoal
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
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
      </div>

      {/* 멤버 목록 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">멤버</h2>
        <div className="space-y-3">
          {group.weeklyStatus.map((member) => (
            <div key={member.userId} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-light rounded-full flex items-center justify-center text-sm font-medium text-primary">
                {member.nickname[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{member.nickname}</p>
                <p className="text-xs text-gray-500">{member.name}</p>
              </div>
              {member.role === "OWNER" && (
                <span className="badge bg-amber-100 text-amber-700">방장</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
