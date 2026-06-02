"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
  finePerMiss: number;
  weeklyStatus: MemberStatus[];
  currentUserRole: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

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

  const openSettings = () => {
    if (group) {
      setEditName(group.name);
      setEditDescription(group.description || "");
      setShowSettings(true);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/group/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });
      if (res.ok) {
        setGroup((prev) =>
          prev ? { ...prev, name: editName, description: editDescription || null } : prev
        );
        setShowSettings(false);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-3"><div className="h-24 bg-white border border-stone-200 rounded-xl animate-pulse" /><div className="h-48 bg-white border border-stone-200 rounded-xl animate-pulse" /></div>;
  }

  if (!group) {
    return <div className="bg-white border border-stone-200 rounded-xl shadow-sm text-center py-10 text-stone-400 text-sm">그룹을 찾을 수 없습니다.</div>;
  }

  const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div className="space-y-4">
      {/* 그룹 헤더 */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-stone-900">{group.name}</h1>
            {group.description && (
              <p className="text-sm text-stone-500 mt-1">{group.description}</p>
            )}
            <p className="text-sm text-stone-400 mt-2">
              {group.weeklyStatus.length}명 참여 중
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={copyInviteCode}
              className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                copied
                  ? "bg-orange-50 text-orange-600 border border-orange-200"
                  : "bg-stone-50 text-stone-500 border border-stone-200 hover:border-stone-300"
              }`}
            >
              {copied ? "복사됨!" : group.inviteCode}
            </button>
            <button
              onClick={shareInviteLink}
              className="w-7 h-7 rounded-lg bg-stone-50 border border-stone-200 hover:border-stone-300 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-all cursor-pointer"
              title="초대 링크 공유"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
            {group.currentUserRole === "OWNER" && (
              <button
                onClick={openSettings}
                className="w-7 h-7 rounded-lg bg-stone-50 border border-stone-200 hover:border-stone-300 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-all cursor-pointer"
                title="그룹 설정"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-1.42 3.42 2 2 0 0 1-1.42-.58l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 그룹 설정 모달 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
            <motion.div
              className="relative w-full max-w-sm bg-white border border-stone-200 rounded-2xl shadow-xl p-6 space-y-5"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-base font-semibold text-stone-900">그룹 설정</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-stone-400 mb-1.5 block">그룹 이름</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-400 mb-1.5 block">설명</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="그룹 설명 (선택)"
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-stone-600 bg-stone-50 border border-stone-300 hover:bg-stone-100 transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={saveSettings}
                  disabled={saving || !editName.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition-all cursor-pointer"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 이번 주 현황 테이블 */}
      <motion.div
        className="bg-white border border-stone-200 rounded-xl shadow-sm p-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-[13px] font-medium text-stone-600 mb-4">이번 주 현황</h2>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-stone-400 pb-3 pr-4 uppercase tracking-wider">
                  멤버
                </th>
                {dayLabels.map((d) => (
                  <th key={d} className="text-center text-xs font-medium text-stone-400 pb-3 w-10">
                    {d}
                  </th>
                ))}
                <th className="text-center text-xs font-medium text-stone-400 pb-3 pl-4">
                  합계
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {group.weeklyStatus.map((member) => (
                <tr key={member.userId}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-stone-100 border border-stone-200 rounded-md flex items-center justify-center text-[9px] font-bold text-stone-500">
                        {member.nickname[0]}
                      </div>
                      <span className="text-sm font-medium text-stone-800 whitespace-nowrap">
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
                          <span className="text-stone-200">·</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center py-3 pl-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100">
                      {member.workoutCount}회
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 멤버 목록 */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5">
        <h2 className="text-[13px] font-medium text-stone-600 mb-4">멤버</h2>
        <div className="space-y-3">
          {group.weeklyStatus.map((member) => (
            <div key={member.userId} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-stone-500">
                {member.nickname[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-800">{member.nickname}</p>
                <p className="text-xs text-stone-400">{member.name}</p>
              </div>
              {member.role === "OWNER" && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
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
