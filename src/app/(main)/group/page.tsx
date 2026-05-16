"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    return <div className="card animate-pulse"><div className="h-40 bg-gray-100 rounded-lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">내 그룹</h1>
        <Link href="/group/create" className="btn-primary">
          그룹 만들기
        </Link>
      </div>

      {/* 초대 코드로 참여 */}
      <form onSubmit={handleJoin} className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          초대 코드�� 참여
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="input flex-1"
            placeholder="초대 코드 입력"
            maxLength={20}
          />
          <button type="submit" className="btn-primary whitespace-nowrap">
            참여
          </button>
        </div>
        {joinError && (
          <p className="text-sm text-red-500 mt-2">{joinError}</p>
        )}
      </form>

      {/* 그룹 목록 */}
      {groups.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-400 text-lg mb-2">👥</p>
          <p className="text-gray-500">참여 중인 그룹이 없습니다</p>
          <p className="text-sm text-gray-400 mt-1">
            그��을 만들거�� 초대 코드로 참여하세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/group/${group.id}`}
              className="card flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-xl">
                👥
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{group.name}</p>
                <p className="text-sm text-gray-500">
                  {group._count.members}명 · 주 {group.weeklyGoal}회 목표
                </p>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
