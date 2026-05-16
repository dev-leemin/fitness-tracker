"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    weeklyGoal: "3",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        weeklyGoal: parseInt(form.weeklyGoal),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
    } else {
      router.push(`/group/${data.id}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">그룹 만들기</h1>

      <form onSubmit={handleSubmit} className="glow-card space-y-5">
        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            그룹 이름
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-glass"
            placeholder="예: 운동 인증방"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            설명 (선택)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-glass resize-none"
            placeholder="그룹 설명을 입력하세요"
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            주간 운동 목표
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm({ ...form, weeklyGoal: String(n) })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  form.weeklyGoal === String(n)
                    ? "bg-[#6366F1]/[0.08] border border-[#6366F1]/40 text-[#6366F1]"
                    : "border border-white/[0.06] text-white/40 hover:bg-white/[0.03]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/25 mt-2">주 {form.weeklyGoal}회 목표</p>
        </div>

        <button type="submit" className="btn-glow w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              생성 중...
            </span>
          ) : (
            "그룹 생성"
          )}
        </button>
      </form>
    </div>
  );
}
