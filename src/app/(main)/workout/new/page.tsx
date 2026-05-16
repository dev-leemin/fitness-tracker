"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { INTENSITY_LABELS } from "@/lib/constants";
import { motion } from "framer-motion";

interface ExerciseType {
  id: number;
  name: string;
  category: string;
  icon: string | null;
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    exerciseTypeId: "",
    date: new Date().toISOString().split("T")[0],
    durationMin: "30",
    distanceKm: "",
    calories: "",
    intensity: "3",
    memo: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/exercise-types")
      .then((res) => res.json())
      .then((data) => setExerciseTypes(data))
      .catch(() => {});
  }, []);

  const selectedType = exerciseTypes.find(
    (t) => t.id === parseInt(form.exerciseTypeId)
  );
  const isCardio = selectedType?.category === "CARDIO";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const allFiles = [...files, ...newFiles].slice(0, 5);
    setFiles(allFiles);

    const newPreviews = allFiles.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        setLoading(false);
        return;
      }

      const workout = await res.json();

      if (files.length > 0) {
        const formData = new FormData();
        formData.append("workoutId", workout.id);
        files.forEach((file) => formData.append("files", file));

        await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      }

      router.push("/dashboard");
    } catch {
      setError("저장에 실패했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">운동 기록</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-[#FF006E]/10 border border-[#FF006E]/20 text-[#FF006E] text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* 운동 종류 선택 */}
        <div className="glow-card">
          <label className="block text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">
            운동 종류
          </label>
          <div className="grid grid-cols-4 gap-2">
            {exerciseTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  setForm({ ...form, exerciseTypeId: String(type.id) })
                }
                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                  form.exerciseTypeId === String(type.id)
                    ? "border-[#00FF87]/50 bg-[#00FF87]/[0.06] shadow-[0_0_15px_rgba(0,255,135,0.1)]"
                    : "border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.02]"
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className={`text-[10px] mt-1 ${
                  form.exerciseTypeId === String(type.id) ? "text-[#00FF87]" : "text-white/50"
                }`}>{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 & 시간 */}
        <div className="glass-card space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              날짜
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-glass"
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              운동 시간 (분)
            </label>
            <input
              type="number"
              value={form.durationMin}
              onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
              className="input-glass"
              min="1"
              max="480"
              required
            />
          </div>

          {isCardio && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                거리 (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.distanceKm}
                onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                className="input-glass"
                placeholder="3.0"
                min="0"
              />
              <p className="text-xs text-white/30 mt-1">
                유산소 운동은 3km 이상 권장
              </p>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              칼로리 (선택)
            </label>
            <input
              type="number"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              className="input-glass"
              placeholder="예: 300"
              min="0"
            />
          </div>
        </div>

        {/* 운동 강도 */}
        <div className="glass-card">
          <label className="block text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">
            운동 강도
          </label>
          <div className="flex justify-between gap-1">
            {INTENSITY_LABELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() =>
                  setForm({ ...form, intensity: String(level.value) })
                }
                className={`flex flex-col items-center p-2.5 rounded-xl flex-1 transition-all ${
                  form.intensity === String(level.value)
                    ? "bg-[#00FF87]/[0.08] border border-[#00FF87]/30"
                    : "border border-transparent hover:bg-white/[0.03]"
                }`}
              >
                <span className="text-xl">{level.emoji}</span>
                <span className={`text-[10px] mt-1 ${
                  form.intensity === String(level.value) ? "text-[#00FF87]" : "text-white/40"
                }`}>
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div className="glass-card">
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            메모
          </label>
          <textarea
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            className="input-glass min-h-[80px] resize-none"
            placeholder="오늘 운동 어땠나요?"
            rows={3}
          />
        </div>

        {/* 사진 업로드 */}
        <div className="glass-card">
          <label className="block text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">
            인증 사진
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.08]">
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 backdrop-blur-sm text-white rounded-full text-xs flex items-center justify-center border border-white/10"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length < 5 && (
            <label className="flex flex-col items-center justify-center h-24 border border-dashed border-white/[0.12] rounded-xl cursor-pointer hover:border-[#00FF87]/40 hover:bg-[#00FF87]/[0.02] transition-all">
              <span className="text-2xl text-white/20">📷</span>
              <span className="text-xs text-white/30 mt-1">
                사진 추가 ({files.length}/5)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* 제출 */}
        <button
          type="submit"
          className="btn-glow w-full text-base py-3.5"
          disabled={loading || !form.exerciseTypeId}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              저장 중...
            </span>
          ) : (
            "운동 기록 저장"
          )}
        </button>
      </form>
    </div>
  );
}
