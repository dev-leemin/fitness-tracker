"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: "",
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      setLoading(false);
    } else {
      router.push("/posts");
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-lg font-semibold text-stone-900 mb-5">운동 일지 작성</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-medium text-stone-400 mb-1.5 uppercase tracking-wider">
            제목
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-indigo-400 transition-all"
            placeholder="오늘 운동 후기"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-stone-400 mb-1.5 uppercase tracking-wider">
            내용
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-indigo-400 transition-all min-h-[200px] resize-none"
            placeholder="오늘의 운동을 기록해보세요..."
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              form.isPublic ? "bg-indigo-500" : "bg-stone-200"
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
              form.isPublic ? "left-5.5" : "left-0.5"
            }`} />
          </button>
          <span className="text-sm text-stone-500">
            {form.isPublic ? "공개" : "비공개"}
          </span>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              저장 중...
            </span>
          ) : (
            "일지 저장"
          )}
        </button>
      </form>
    </div>
  );
}
