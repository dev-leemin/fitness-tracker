"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EXERCISE_CATEGORIES, INTENSITY_LABELS } from "@/lib/constants";
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

  // Group exercises by category
  const groupedExercises = exerciseTypes.reduce((acc, type) => {
    if (!acc[type.category]) acc[type.category] = [];
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, ExerciseType[]>);

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
        await fetch("/api/upload", { method: "POST", body: formData });
      }

      router.push("/dashboard");
    } catch {
      setError("저장에 실패했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-white mb-5">운동 기록</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#F87171]/[0.06] border border-[#F87171]/15 text-[#F87171] text-[13px] px-4 py-3 rounded-2xl backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Exercise Type — grouped by category */}
        <div className="card-glass">
          <label className="block text-[11px] font-medium text-white/35 mb-3 uppercase tracking-wider">
            운동 종류
          </label>
          <div className="space-y-3">
            {Object.entries(groupedExercises).map(([category, types]) => {
              const catInfo = EXERCISE_CATEGORIES[category as keyof typeof EXERCISE_CATEGORIES];
              return (
                <div key={category}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: catInfo?.color }} />
                    <span className="text-[10px] font-medium" style={{ color: catInfo?.color }}>{catInfo?.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {types.map((type) => {
                      const isSelected = form.exerciseTypeId === String(type.id);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setForm({ ...form, exerciseTypeId: String(type.id) })}
                          className={`flex flex-col items-center p-2.5 rounded-xl border transition-all ${
                            isSelected
                              ? "shadow-lg"
                              : "border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.02]"
                          }`}
                          style={isSelected ? {
                            background: `${catInfo?.color}12`,
                            border: `1.5px solid ${catInfo?.color}40`,
                            boxShadow: `0 4px 12px ${catInfo?.color}15`,
                          } : undefined}
                        >
                          <span className="text-xl">{type.icon}</span>
                          <span className={`text-[10px] mt-1 ${
                            isSelected ? "font-medium" : "text-white/40"
                          }`} style={isSelected ? { color: catInfo?.color } : undefined}>{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date & Time */}
        <div className="card-glass space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/35 mb-2 uppercase tracking-wider">날짜</label>
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
            <label className="block text-[11px] font-medium text-white/35 mb-2 uppercase tracking-wider">운동 시간 (분)</label>
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
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <label className="block text-[11px] font-medium text-white/35 mb-2 uppercase tracking-wider">거리 (km)</label>
              <input
                type="number"
                step="0.1"
                value={form.distanceKm}
                onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                className="input-glass"
                placeholder="3.0"
                min="0"
              />
            </motion.div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-white/35 mb-2 uppercase tracking-wider">칼로리 (선택)</label>
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

        {/* Intensity — gradient bar style */}
        <div className="card-glass">
          <label className="block text-[11px] font-medium text-white/35 mb-3 uppercase tracking-wider">운동 강도</label>
          <div className="flex justify-between gap-1.5">
            {INTENSITY_LABELS.map((level) => {
              const isSelected = form.intensity === String(level.value);
              const intensityColors = ["#34D399", "#60A5FA", "#FBBF24", "#FB923C", "#F87171"];
              const color = intensityColors[level.value - 1];
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setForm({ ...form, intensity: String(level.value) })}
                  className={`flex flex-col items-center p-2.5 rounded-xl flex-1 transition-all ${
                    isSelected ? "shadow-md" : "border border-transparent hover:bg-white/[0.02]"
                  }`}
                  style={isSelected ? {
                    background: `${color}12`,
                    border: `1.5px solid ${color}35`,
                    boxShadow: `0 4px 12px ${color}15`,
                  } : undefined}
                >
                  <span className="text-lg">{level.emoji}</span>
                  <span className={`text-[9px] mt-0.5 ${isSelected ? "font-medium" : "text-white/30"}`}
                    style={isSelected ? { color } : undefined}
                  >
                    {level.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Memo */}
        <div className="card-glass">
          <label className="block text-[11px] font-medium text-white/35 mb-2 uppercase tracking-wider">메모</label>
          <textarea
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            className="input-glass min-h-[72px] resize-none"
            placeholder="오늘 운동 어땠나요?"
            rows={3}
          />
        </div>

        {/* Photos */}
        <div className="card-glass">
          <label className="block text-[11px] font-medium text-white/35 mb-3 uppercase tracking-wider">인증 사진</label>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.08]">
                  <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 backdrop-blur-sm text-white rounded-full text-[10px] flex items-center justify-center border border-white/10 hover:bg-red-500/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length < 5 && (
            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-white/[0.06] rounded-2xl cursor-pointer hover:border-[#7C5CFC]/30 hover:bg-[#7C5CFC]/[0.02] transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-1.5 group-hover:border-[#7C5CFC]/20 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 group-hover:text-[#A78BFA] transition-colors"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <span className="text-[10px] text-white/25 group-hover:text-white/40 transition-colors">
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

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary w-full !py-3.5 !text-[14px] !rounded-2xl"
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
