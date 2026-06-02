"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

function GroupJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";

  const [code, setCode] = useState(codeFromUrl);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (codeFromUrl) {
      setCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError("");
    setLoading(true);

    const res = await fetch("/api/group/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: code.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/group/${data.groupId}`);
      }, 1000);
    }
  };

  return (
    <div className="max-w-sm mx-auto pt-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FC5200" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-stone-900">그룹 참여</h1>
        <p className="text-[13px] text-stone-400 mt-1.5">초대 코드를 입력하여 그룹에 참여하세요</p>
      </motion.div>

      {success ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 text-center py-8"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FC5200" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-stone-900 font-medium">참여 완료!</p>
          <p className="text-[12px] text-stone-400 mt-1">그룹 페이지로 이동합니다...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleJoin} className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[12px] px-3 py-2.5 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-2 uppercase tracking-wider">
              초대 코드
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-300 text-center text-lg font-mono font-bold text-stone-900 tracking-[0.3em] placeholder:text-stone-300 placeholder:tracking-[0.3em] focus:outline-none focus:border-orange-400 transition-all"
              placeholder="ABCD1234"
              maxLength={20}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                참여 중...
              </span>
            ) : (
              "그룹 참여하기"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function GroupJoinPage() {
  return (
    <Suspense fallback={<div className="bg-white border border-stone-200 rounded-xl shadow-sm animate-pulse max-w-sm mx-auto mt-12"><div className="h-40 bg-stone-50 rounded-lg" /></div>}>
      <GroupJoinContent />
    </Suspense>
  );
}
