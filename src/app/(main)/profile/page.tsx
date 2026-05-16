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
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>

      <div className="card space-y-4">
        {message && (
          <div className="bg-blue-50 text-blue-600 text-sm px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-2xl font-bold text-primary">
            {session?.user?.nickname?.[0] || "?"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{session?.user?.nickname}</p>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {editing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary flex-1">저장</button>
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">취소</button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">이름</p>
                <p className="font-medium">{session?.user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">닉네임</p>
                <p className="font-medium">{session?.user?.nickname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">이메일</p>
                <p className="font-medium">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setForm({ name: session?.user?.name || "", nickname: session?.user?.nickname || "" });
                setEditing(true);
              }}
              className="btn-secondary w-full"
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
