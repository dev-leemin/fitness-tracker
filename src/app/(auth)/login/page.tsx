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
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#00FF87] to-[#00D4FF] flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(0,255,135,0.2)]">
          <span className="text-2xl font-black text-black">F</span>
        </div>
        <h1 className="text-2xl font-bold text-white">FitLog</h1>
        <p className="text-white/40 mt-1 text-sm">운동 기록을 시작하세요</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glow-card space-y-5">
        {error && (
          <div className="bg-[#FF006E]/10 border border-[#FF006E]/20 text-[#FF006E] text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-glass"
            placeholder="email@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-glass"
            placeholder="비밀번호 입력"
            required
          />
        </div>

        <button type="submit" className="btn-glow w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              로그인 중...
            </span>
          ) : (
            "로그인"
          )}
        </button>

        <p className="text-center text-sm text-white/40">
          계정이 없으신가요?{" "}
          <Link href="/register" className="text-[#00FF87] font-medium hover:text-[#00FF87]/80 transition-colors">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}
