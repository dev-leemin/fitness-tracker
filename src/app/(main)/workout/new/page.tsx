"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EXERCISE_CATEGORIES, INTENSITY_LABELS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface ExerciseType {
  id: number;
  name: string;
  category: string;
  icon: string | null;
}

export default function NewWorkoutPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto"><div className="h-40 rounded-xl bg-white border border-stone-200 animate-pulse" /></div>}>
      <NewWorkoutContent />
    </Suspense>
  );
}

function NewWorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: exercise type, 2: details

  const [form, setForm] = useState({
    exerciseTypeId: "",
    date: dateParam || new Date().toISOString().split("T")[0],
    durationMin: "30",
    distanceKm: "",
    calories: "",
    intensity: "3",
    memo: "",
    location: "",
    link: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
  const selectedCatInfo = selectedType
    ? EXERCISE_CATEGORIES[selectedType.category as keyof typeof EXERCISE_CATEGORIES]
    : null;

  // Group exercises by category
  const groupedExercises = exerciseTypes.reduce((acc, type) => {
    if (!acc[type.category]) acc[type.category] = [];
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, ExerciseType[]>);

  // Filter by search
  const filteredGroups = searchQuery
    ? Object.entries(groupedExercises).reduce((acc, [cat, types]) => {
        const filtered = types.filter((t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) acc[cat] = filtered;
        return acc;
      }, {} as Record<string, ExerciseType[]>)
    : groupedExercises;

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

  const selectExercise = (typeId: string) => {
    setForm({ ...form, exerciseTypeId: typeId });
    setStep(2);
  };

  // Duration presets
  const durationPresets = [15, 30, 45, 60, 90, 120];

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step === 1 ? router.back() : setStep(1)}
            className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-[15px] font-semibold text-stone-800">
              {step === 1 ? "운동 선택" : "운동 기록"}
            </h1>
            {dateParam && (
              <p className="text-[10px] text-stone-400">
                {format(new Date(dateParam), "M월 d일 (E)", { locale: ko })}
              </p>
            )}
          </div>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-1 rounded-full transition-all ${step >= 1 ? "bg-indigo-200" : "bg-stone-100"}`} />
          <div className={`w-5 h-1 rounded-full transition-all ${step >= 2 ? "bg-indigo-200" : "bg-stone-100"}`} />
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-500 text-[12px] px-3.5 py-2.5 rounded-xl mb-4"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 ? (
          /* Step 1: Exercise Type Selection */
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search */}
            <div className="relative mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="운동 검색..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Exercise grid by category */}
            <div className="space-y-4">
              {Object.entries(filteredGroups).map(([category, types]) => {
                const catInfo = EXERCISE_CATEGORIES[category as keyof typeof EXERCISE_CATEGORIES];
                return (
                  <div key={category}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: catInfo?.color }} />
                      <span className="text-[10px] font-medium" style={{ color: catInfo?.color }}>{catInfo?.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {types.map((type) => {
                        const isSelected = form.exerciseTypeId === String(type.id);
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => selectExercise(String(type.id))}
                            className={`flex flex-col items-center py-3 px-1 rounded-xl border transition-all active:scale-95 ${
                              isSelected
                                ? "shadow-lg"
                                : "border-stone-200 hover:border-stone-300 hover:bg-white"
                            }`}
                            style={isSelected ? {
                              background: `${catInfo?.color}12`,
                              border: `1.5px solid ${catInfo?.color}40`,
                              boxShadow: `0 4px 12px ${catInfo?.color}15`,
                            } : undefined}
                          >
                            <span className="text-xl mb-0.5">{type.icon}</span>
                            <span className={`text-[9px] leading-tight text-center ${
                              isSelected ? "font-medium" : "text-stone-400"
                            }`} style={isSelected ? { color: catInfo?.color } : undefined}>{type.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Step 2: Details */
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Selected exercise indicator */}
              {selectedType && (
                <div
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border"
                  style={{
                    background: `${selectedCatInfo?.color}08`,
                    borderColor: `${selectedCatInfo?.color}20`,
                  }}
                >
                  <span className="text-lg">{selectedType.icon}</span>
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-stone-800">{selectedType.name}</p>
                    <p className="text-[9px]" style={{ color: selectedCatInfo?.color }}>{selectedCatInfo?.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[10px] text-stone-400 hover:text-stone-600 px-2 py-1 rounded-md hover:bg-stone-100 transition-all"
                  >
                    변경
                  </button>
                </div>
              )}

              {/* Date */}
              <div className="rounded-xl p-3.5 bg-white border border-stone-200">
                <label className="block text-[10px] font-medium text-stone-400 mb-2">날짜</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-orange-400"
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              {/* Duration — preset buttons + custom input */}
              <div className="rounded-xl p-3.5 bg-white border border-stone-200">
                <label className="block text-[10px] font-medium text-stone-400 mb-2">운동 시간</label>
                <div className="grid grid-cols-6 gap-1.5 mb-2">
                  {durationPresets.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setForm({ ...form, durationMin: String(mins) })}
                      className={`py-2 rounded-lg text-[11px] font-medium transition-all ${
                        form.durationMin === String(mins)
                          ? "bg-stone-200 text-stone-800 border border-stone-300"
                          : "bg-stone-50 text-stone-400 border border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      {mins}분
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.durationMin}
                    onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-orange-400"
                    min="1"
                    max="480"
                    required
                  />
                  <span className="text-[11px] text-stone-400">분</span>
                </div>
              </div>

              {/* Distance (only for cardio) */}
              <AnimatePresence>
                {isCardio && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl p-3.5 bg-white border border-stone-200"
                  >
                    <label className="block text-[10px] font-medium text-stone-400 mb-2">거리 (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.distanceKm}
                      onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-orange-400"
                      placeholder="3.0"
                      min="0"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Intensity — compact emoji bar */}
              <div className="rounded-xl p-3.5 bg-white border border-stone-200">
                <label className="block text-[10px] font-medium text-stone-400 mb-2">운동 강도</label>
                <div className="flex justify-between gap-1">
                  {INTENSITY_LABELS.map((level) => {
                    const isSelected = form.intensity === String(level.value);
                    const intensityColors = ["#34D399", "#60A5FA", "#FBBF24", "#FB923C", "#F87171"];
                    const color = intensityColors[level.value - 1];
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setForm({ ...form, intensity: String(level.value) })}
                        className={`flex flex-col items-center py-2 px-1 rounded-lg flex-1 transition-all active:scale-95 ${
                          isSelected ? "" : "opacity-40 hover:opacity-70"
                        }`}
                        style={isSelected ? {
                          background: `${color}12`,
                          border: `1px solid ${color}30`,
                        } : undefined}
                      >
                        <span className="text-base">{level.emoji}</span>
                        <span className="text-[8px] mt-0.5 text-stone-500">{level.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calories (optional) */}
              <div className="rounded-xl p-3.5 bg-white border border-stone-200">
                <label className="block text-[10px] font-medium text-stone-400 mb-2">칼로리 (선택)</label>
                <input
                  type="number"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-800 focus:outline-none focus:border-orange-400"
                  placeholder="예: 300"
                  min="0"
                />
              </div>

              {/* Location & Link */}
              <div className="rounded-xl p-3.5 bg-white border border-stone-200 space-y-3">
                <div>
                  <label className="block text-[10px] font-medium text-stone-400 mb-2">장소 (선택)</label>
                  <div className="relative">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400"
                      placeholder="예: 강남 헬스장"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-stone-400 mb-2">링크 (선택)</label>
                  <div className="relative">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <input
                      type="url"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400"
                      placeholder="관련 링크 (네이버지도, 유튜브 등)"
                    />
                  </div>
                </div>
              </div>

              {/* Memo */}
              <div className="rounded-xl p-3.5 bg-white border border-stone-200">
                <label className="block text-[10px] font-medium text-stone-400 mb-2">메모</label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 min-h-[60px] resize-none"
                  placeholder="오늘 운동 어땠나요?"
                  rows={2}
                />
              </div>

              {/* Photos */}
              <div className="rounded-xl p-3.5 bg-white border border-stone-200">
                <label className="block text-[10px] font-medium text-stone-400 mb-2">인증 사진</label>

                {previews.length > 0 && (
                  <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                    {previews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200">
                        <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full text-[9px] flex items-center justify-center hover:bg-red-500/80 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {files.length < 5 && (
                  <label className="flex items-center justify-center gap-2 h-14 border border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-white transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span className="text-[10px] text-stone-400">사진 추가 ({files.length}/5)</span>
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
                className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-[#FC5200] to-[#8B5CF6] hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-[#FC5200]/20 active:scale-[0.98]"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
