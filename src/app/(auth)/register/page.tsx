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
    <div className="w-full">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-600 transition-colors mb-5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        돌아가기
      </Link>

      <h1 className="text-xl font-bold text-stone-900 tracking-tight">계정 만들기</h1>
      <p className="text-[12px] text-stone-400 mt-1">FitLog와 함께 운동을 기록하세요</p>

      {step === "social" ? (
        <>
          <div className="space-y-2 mt-6">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center gap-3 h-11 px-4 rounded-lg bg-stone-50 border border-stone-200 text-[12px] font-medium text-stone-700 hover:bg-stone-100 hover:border-stone-300 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="flex-1 text-left">Google로 시작하기</span>
            </button>

            <button
              onClick={() => signIn("kakao", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center gap-3 h-11 px-4 rounded-lg bg-[#FEE500]/10 border border-[#FEE500]/30 text-[12px] font-medium text-stone-700 hover:bg-[#FEE500]/20 hover:border-[#FEE500]/40 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#3C1E1E">
                <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.57 1.674 4.83 4.2 6.13l-.87 3.22a.3.3 0 00.46.33l3.77-2.5c.78.12 1.58.18 2.43.18 5.523 0 10-3.477 10-7.83S17.523 3 12 3z"/>
              </svg>
              <span className="flex-1 text-left">카카오로 시작하기</span>
            </button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-[10px] text-stone-400 font-medium">또는</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <button
            onClick={() => setStep("email")}
            className="w-full flex items-center gap-3 h-11 px-4 rounded-lg bg-stone-50 border border-stone-200 text-[12px] text-stone-500 hover:bg-stone-100 hover:border-stone-300 hover:text-stone-600 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M22 7l-10 6L2 7"/>
            </svg>
            <span>이메일로 가입하기</span>
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5 mt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full h-11 px-3.5 rounded-lg bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
              placeholder="이름"
              required
            />
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              className="w-full h-11 px-3.5 rounded-lg bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
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
            className="w-full h-11 px-3.5 rounded-lg bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
            placeholder="이메일 주소"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full h-11 px-3.5 rounded-lg bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
            placeholder="비밀번호 (6자 이상)"
            required
            minLength={6}
          />

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full h-11 px-3.5 rounded-lg bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
            placeholder="비밀번호 확인"
            required
          />

          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-orange-500 text-white text-[13px] font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
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
            className="w-full text-center text-[11px] text-stone-400 hover:text-stone-600 transition-colors pt-1"
          >
            다른 방법으로 가입
          </button>
        </form>
      )}

      <p className="text-center text-[11px] text-stone-400 mt-7">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-orange-500 hover:text-orange-600 transition-colors font-medium">
          로그인
        </Link>
      </p>
    </div>
  );
}
