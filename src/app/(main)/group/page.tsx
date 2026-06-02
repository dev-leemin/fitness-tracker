"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Group {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  _count: { members: number };
}

export default function GroupListPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showJoinInput, setShowJoinInput] = useState(false);

  useEffect(() => {
    fetch("/api/group")
      .then((r) => r.json())
      .then((data) => setGroups(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinError("");
    setJoinLoading(true);

    const res = await fetch("/api/group/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: joinCode.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      setJoinError(data.error);
      setJoinLoading(false);
    } else {
      router.push(`/group/${data.groupId}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-xl shadow-sm animate-pulse"><div className="h-16 bg-white rounded-lg" /></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-900">그룹</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJoinInput(!showJoinInput)}
            className="h-8 px-3 rounded-lg text-[12px] font-medium bg-stone-50 border border-stone-300 text-stone-900/50 hover:text-stone-700 hover:border-stone-300 transition-all cursor-pointer"
          >
            코드로 참여
          </button>
          <Link
            href="/group/create"
            className="h-8 px-3 rounded-lg text-[12px] font-medium bg-[#FC5200]/10 border border-[#FC5200]/20 text-[#FC5200] hover:bg-[#FC5200]/15 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            만들기
          </Link>
        </div>
      </div>

      {/* Join Input */}
      {showJoinInput && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleJoin}
          className="flex gap-2"
        >
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="flex-1 h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-300 text-[13px] text-stone-900 font-mono tracking-wider placeholder:text-stone-300 focus:outline-none focus:border-[#FC5200]/30 transition-all"
            placeholder="초대 코드 입력"
            maxLength={20}
            autoFocus
          />
          <button
            type="submit"
            disabled={joinLoading || !joinCode.trim()}
            className="h-10 px-4 rounded-xl bg-[#FC5200] text-[12px] font-semibold text-white hover:bg-[#E04800] transition-colors cursor-pointer disabled:opacity-40"
          >
            {joinLoading ? "..." : "참여"}
          </button>
        </motion.form>
      )}
      {joinError && (
        <p className="text-[12px] text-[#EF4444]">{joinError}</p>
      )}

      {/* Group List */}
      {groups.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm text-center py-14">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p className="text-[13px] text-stone-500">참여 중인 그룹이 없습니다</p>
          <p className="text-[11px] text-stone-300 mt-1">그룹을 만들거나 초대 코드로 참여하세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/group/${group.id}`}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FC5200]/8 to-[#FB923C]/8 border border-[#FC5200]/15 flex items-center justify-center group-hover:border-[#FC5200]/30 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FC5200" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-stone-800 truncate">{group.name}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {group._count.members}명
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-900/15 group-hover:text-stone-500 transition-colors">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
