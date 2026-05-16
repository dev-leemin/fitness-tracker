"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    nickname: session?.user?.nickname || "",
  });
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage("저장되었습니다.");
      setEditing(false);
      await update();
      setTimeout(() => setMessage(""), 3000);
    } else {
      const data = await res.json();
      setMessage(data.error || "저장에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-lg font-semibold text-white">프로필 설정</h1>

      <div className="bento-card space-y-5">
        {message && (
          <div className="bg-[#6366F1]/[0.06] border border-[#6366F1]/15 text-[#6366F1] text-[12px] px-4 py-2.5 rounded-xl">
            {message}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/[0.04] border border-white/[0.06] rounded-full flex items-center justify-center text-lg font-bold text-white/40">
            {session?.user?.nickname?.[0] || "?"}
          </div>
          <div>
            <p className="text-[14px] font-medium text-white/80">{session?.user?.nickname}</p>
            <p className="text-[12px] text-white/30">{session?.user?.email}</p>
          </div>
        </div>

        <hr className="border-white/[0.04]" />

        {editing ? (
          <>
            <div>
              <label className="block text-[10px] font-medium text-white/30 mb-1.5 uppercase tracking-wider">이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-glass"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-white/30 mb-1.5 uppercase tracking-wider">닉네임</label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                className="input-glass"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary flex-1">저장</button>
              <button onClick={() => setEditing(false)} className="btn-ghost flex-1">취소</button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">이름</p>
                <p className="text-[13px] text-white/70 mt-1">{session?.user?.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">닉네임</p>
                <p className="text-[13px] text-white/70 mt-1">{session?.user?.nickname}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">이메일</p>
                <p className="text-[13px] text-white/70 mt-1">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setForm({ name: session?.user?.name || "", nickname: session?.user?.nickname || "" });
                setEditing(true);
              }}
              className="btn-ghost w-full"
            >
              프로필 수정
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="btn-danger w-full"
      >
        로그아웃
      </button>
    </div>
  );
}
