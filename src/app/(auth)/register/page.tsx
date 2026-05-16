"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
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

    // 자동 로그인
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
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#00FF87] to-[#00D4FF] flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(0,255,135,0.2)]">
          <span className="text-2xl font-black text-black">F</span>
        </div>
        <h1 className="text-2xl font-bold text-white">회원가입</h1>
        <p className="text-white/40 mt-1 text-sm">FitLog와 함께 운동을 기록하세요</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glow-card space-y-4">
        {error && (
          <div className="bg-[#FF006E]/10 border border-[#FF006E]/20 text-[#FF006E] text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              이름
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-glass"
              placeholder="홍길동"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              닉네임
            </label>
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              className="input-glass"
              placeholder="fitguy123"
              required
              maxLength={30}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            이메일
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
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
            name="password"
            value={form.password}
            onChange={handleChange}
            className="input-glass"
            placeholder="6자 이상"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            비밀번호 확인
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="input-glass"
            placeholder="비밀번호 재입력"
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
              가입 중...
            </span>
          ) : (
            "회원가입"
          )}
        </button>

        <p className="text-center text-sm text-white/40">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[#00FF87] font-medium hover:text-[#00FF87]/80 transition-colors">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
