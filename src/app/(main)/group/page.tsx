"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Group {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  weeklyGoal: number;
  _count: { members: number };
}

export default function GroupListPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/group")
      .then((r) => r.json())
      .then((data) => setGroups(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");

    const res = await fetch("/api/group/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: joinCode }),
    });

    const data = await res.json();
    if (!res.ok) {
      setJoinError(data.error);
    } else {
      window.location.reload();
    }
  };

  if (loading) {
    return <div className="glass-card animate-pulse"><div className="h-40 bg-white/[0.02] rounded-lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">내 그룹</h1>
        <Link href="/group/create" className="btn-glow !py-2 !px-4 text-sm">
          + 그룹 만들기
        </Link>
      </div>

      {/* 초대 코드로 참여 */}
      <form onSubmit={handleJoin} className="glass-card">
        <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
          초대 코드로 참여
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="input-glass flex-1"
            placeholder="초대 코드 입력"
            maxLength={20}
          />
          <button type="submit" className="btn-glow whitespace-nowrap !py-2">
            참여
          </button>
        </div>
        {joinError && (
          <p className="text-sm text-[#FF006E] mt-2">{joinError}</p>
        )}
      </form>

      {/* 그룹 목록 */}
      {groups.length === 0 ? (
        <div className="glass-card text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
            <span className="text-2xl text-white/20">⬡</span>
          </div>
          <p className="text-white/50">참여 중인 그룹이 없습니다</p>
          <p className="text-sm text-white/25 mt-1">
            그룹을 만들거나 초대 코드로 참여하세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/group/${group.id}`}
                className="glass-card flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FF87]/10 to-[#00D4FF]/10 border border-[#00FF87]/20 flex items-center justify-center text-lg group-hover:border-[#00FF87]/40 transition-colors">
                  ⬡
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{group.name}</p>
                  <p className="text-sm text-white/40">
                    {group._count.members}명 · 주 {group.weeklyGoal}회 목표
                  </p>
                </div>
                <span className="text-white/20 group-hover:text-white/50 transition-colors">→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
