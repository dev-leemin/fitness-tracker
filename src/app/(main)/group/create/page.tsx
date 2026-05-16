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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">그룹 만들기</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            그룹 이름
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            placeholder="예: 운��� 인증방"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명 (선택)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none"
            placeholder="그룹 설명을 입력하세요"
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            주간 운동 목표 (회)
          </label>
          <select
            value={form.weeklyGoal}
            onChange={(e) => setForm({ ...form, weeklyGoal: e.target.value })}
            className="input"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                주 {n}회
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "생성 중..." : "그룹 생성"}
        </button>
      </form>
    </div>
  );
}
