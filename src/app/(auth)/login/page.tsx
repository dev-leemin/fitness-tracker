"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-[#FC5200] animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

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
      router.push(callbackUrl);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-20 pb-8">
      {/* Branding */}
      <div className="text-center">
        <h1 className="text-[32px] font-extrabold text-stone-900 tracking-tight">FitLog</h1>
        <p className="text-[14px] text-stone-400 mt-2">매일의 기록이 나를 바꿉니다</p>
      </div>

      {/* Login area */}
      <div className="flex-1 flex flex-col items-center justify-center py-10">
        {!showEmailForm ? (
          <>
            {/* Social login - round icons */}
            <div className="flex gap-6">
              <button
                onClick={() => signIn("kakao", { callbackUrl })}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-full bg-[#FEE500] flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#3C1E1E">
                    <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.57 1.674 4.83 4.2 6.13l-.87 3.22a.3.3 0 00.46.33l3.77-2.5c.78.12 1.58.18 2.43.18 5.523 0 10-3.477 10-7.83S17.523 3 12 3z"/>
                  </svg>
                </div>
                <span className="text-[11px] text-stone-400">카카오</span>
              </button>

              <button
                onClick={() => signIn("google", { callbackUrl })}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <span className="text-[11px] text-stone-400">구글</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8 w-full">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-[11px] text-stone-300">또는</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            {/* Email button */}
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full h-[50px] rounded-full border border-stone-200 text-[14px] text-stone-600 font-medium hover:bg-stone-50 active:scale-[0.98] transition-all"
            >
              이메일로 시작하기
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            {error && (
              <div className="bg-red-50 text-red-500 text-[13px] px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] px-4 rounded-xl bg-stone-50 border border-stone-200 text-[14px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-[#FC5200] focus:bg-white transition-all"
              placeholder="이메일"
              required
              autoFocus
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[50px] px-4 rounded-xl bg-stone-50 border border-stone-200 text-[14px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-[#FC5200] focus:bg-white transition-all"
              placeholder="비밀번호"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] rounded-full bg-[#FC5200] text-white text-[14px] font-semibold hover:bg-[#E04800] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>

            <div className="flex justify-between items-center pt-2 px-1">
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-[13px] text-stone-400 hover:text-stone-600 transition-colors"
              >
                ← 돌아가기
              </button>
              <Link
                href="/forgot-password"
                className="text-[13px] text-stone-400 hover:text-stone-600 transition-colors"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </form>
        )}

        {/* Sign up */}
        <p className="text-[13px] text-stone-400 mt-10">
          회원이 아니신가요?{" "}
          <Link href="/register" className="text-[#FC5200] font-semibold">
            가입하기
          </Link>
        </p>
      </div>

      {/* Terms */}
      <div className="text-center">
        <p className="text-[11px] text-stone-300 leading-relaxed">
          계속하면{" "}
          <Link href="/terms" className="underline hover:text-stone-400 transition-colors">이용약관</Link>
          {" "}및{" "}
          <Link href="/privacy" className="underline hover:text-stone-400 transition-colors">개인정보처리방침</Link>
          에 동의합니다
        </p>
      </div>
    </div>
  );
}
