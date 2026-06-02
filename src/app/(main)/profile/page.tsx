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
      <h1 className="text-lg font-semibold text-stone-900">프로필 설정</h1>

      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 space-y-5">
        {message && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-600 text-[12px] px-4 py-2.5 rounded-xl">
            {message}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-lg font-bold text-indigo-500">
            {session?.user?.nickname?.[0] || "?"}
          </div>
          <div>
            <p className="text-[14px] font-medium text-stone-800">{session?.user?.nickname}</p>
            <p className="text-[12px] text-stone-400">{session?.user?.email}</p>
          </div>
        </div>

        <hr className="border-stone-200" />

        {editing ? (
          <>
            <div>
              <label className="block text-[10px] font-medium text-stone-400 mb-1.5 uppercase tracking-wider">이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-indigo-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-stone-400 mb-1.5 uppercase tracking-wider">닉네임</label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-stone-50 border border-stone-300 text-[13px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-indigo-400 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary flex-1">저장</button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 h-10 rounded-xl text-[13px] font-medium bg-stone-50 border border-stone-300 text-stone-600 hover:bg-stone-100 transition-all cursor-pointer"
              >
                취소
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">이름</p>
                <p className="text-[13px] text-stone-700 mt-1">{session?.user?.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">닉네임</p>
                <p className="text-[13px] text-stone-700 mt-1">{session?.user?.nickname}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">이메일</p>
                <p className="text-[13px] text-stone-700 mt-1">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setForm({ name: session?.user?.name || "", nickname: session?.user?.nickname || "" });
                setEditing(true);
              }}
              className="w-full h-10 rounded-xl text-[13px] font-medium bg-stone-50 border border-stone-300 text-stone-600 hover:bg-stone-100 transition-all cursor-pointer"
            >
              프로필 수정
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full h-10 rounded-xl text-[13px] font-medium bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all cursor-pointer"
      >
        로그아웃
      </button>
    </div>
  );
}
