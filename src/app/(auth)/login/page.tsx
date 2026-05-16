"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <span className="text-5xl">🏋️</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">FitLog</h1>
        <p className="text-gray-500 mt-1">운동 기록을 시작하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="email@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="비밀번호 입력"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <p className="text-center text-sm text-gray-500">
          계정이 없으신가요?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}
