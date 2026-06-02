"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
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
      <h1 className="text-lg font-semibold text-stone-900 mb-5">그룹 만들기</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-medium text-stone-400 mb-1.5 uppercase tracking-wider">
            그룹 이름
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-orange-400 transition-all"
            placeholder="예: 운동 인증방"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-stone-400 mb-1.5 uppercase tracking-wider">
            설명 (선택)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-orange-400 transition-all resize-none"
            placeholder="그룹 설명을 입력하세요"
            rows={3}
            maxLength={500}
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
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
