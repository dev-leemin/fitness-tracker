"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"social" | "email">("social");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (form.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        name: form.name,
        nickname: form.nickname,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-[380px]">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00FF87] to-[#00c96b] mb-5 shadow-[0_0_30px_rgba(0,255,135,0.15)]">
          <span className="text-lg font-black text-black tracking-tight">F</span>
        </div>
        <h1 className="text-[22px] font-semibold text-white tracking-tight">계정 만들기</h1>
        <p className="text-[13px] text-white/35 mt-1.5">FitLog와 함께 운동을 기록하세요</p>
      </div>

      {step === "social" ? (
        <>
          {/* Social Signup */}
          <div className="space-y-2.5">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[13px] font-medium text-white/80 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google로 시작하기
            </button>

            <button
              onClick={() => signIn("kakao", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-[#FEE500]/[0.08] border border-[#FEE500]/[0.15] text-[13px] font-medium text-white/80 hover:bg-[#FEE500]/[0.12] hover:border-[#FEE500]/[0.25] transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FEE500">
                <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.57 1.674 4.83 4.2 6.13l-.87 3.22a.3.3 0 00.46.33l3.77-2.5c.78.12 1.58.18 2.43.18 5.523 0 10-3.477 10-7.83S17.523 3 12 3z"/>
              </svg>
              카카오로 시작하기
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white/20 uppercase tracking-wider font-medium">또는</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <button
            onClick={() => setStep("email")}
            className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[13px] font-medium text-white/50 hover:bg-white/[0.04] hover:border-white/[0.1] hover:text-white/70 transition-all cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M22 7l-10 6L2 7"/>
            </svg>
            이메일로 가입하기
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 bg-[#FF006E]/8 border border-[#FF006E]/15 text-[#FF006E] text-[12px] px-3 py-2.5 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF87]/30 focus:bg-white/[0.04] transition-all"
              placeholder="이름"
              required
            />
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF87]/30 focus:bg-white/[0.04] transition-all"
              placeholder="닉네임"
              required
              maxLength={30}
            />
          </div>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF87]/30 focus:bg-white/[0.04] transition-all"
            placeholder="이메일 주소"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF87]/30 focus:bg-white/[0.04] transition-all"
            placeholder="비밀번호 (6자 이상)"
            required
            minLength={6}
          />

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF87]/30 focus:bg-white/[0.04] transition-all"
            placeholder="비밀번호 확인"
            required
          />

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00FF87] to-[#00e07a] text-[13px] font-semibold text-black hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                가입 중...
              </span>
            ) : (
              "가입하기"
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep("social")}
            className="w-full text-center text-[12px] text-white/25 hover:text-white/40 transition-colors cursor-pointer pt-1"
          >
            다른 방법으�� 가입
          </button>
        </form>
      )}

      {/* Footer */}
      <p className="text-center text-[12px] text-white/25 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-[#00FF87]/70 hover:text-[#00FF87] transition-colors font-medium">
          로그인
        </Link>
      </p>
    </div>
  );
}
