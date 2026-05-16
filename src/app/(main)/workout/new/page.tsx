"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { INTENSITY_LABELS } from "@/lib/constants";

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
      // 1. 운동 기록 생성
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

      // 2. 사진 업로드 (있는 경우)
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">운동 기록</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 운동 종류 선택 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-3">
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
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  form.exerciseTypeId === String(type.id)
                    ? "border-primary bg-primary-light"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="text-xs mt-1 text-gray-700">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 & 시간 */}
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input"
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              운동 시간 (분)
            </label>
            <input
              type="number"
              value={form.durationMin}
              onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
              className="input"
              min="1"
              max="480"
              required
            />
          </div>

          {isCardio && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                거리 (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.distanceKm}
                onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                className="input"
                placeholder="3.0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                유산소 운동은 3km 이상 권장
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              칼로리 (선택)
            </label>
            <input
              type="number"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              className="input"
              placeholder="예: 300"
              min="0"
            />
          </div>
        </div>

        {/* 운동 강도 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            운동 강도
          </label>
          <div className="flex justify-between">
            {INTENSITY_LABELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() =>
                  setForm({ ...form, intensity: String(level.value) })
                }
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  form.intensity === String(level.value)
                    ? "bg-primary-light ring-2 ring-primary"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl">{level.emoji}</span>
                <span className="text-[10px] text-gray-600 mt-1">
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            메모
          </label>
          <textarea
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            className="input min-h-[80px] resize-none"
            placeholder="오늘 운동 어땠나요?"
            rows={3}
          />
        </div>

        {/* 사진 업로드 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            인증 사진
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length < 5 && (
            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-colors">
              <span className="text-2xl text-gray-400">📷</span>
              <span className="text-sm text-gray-500 mt-1">
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
          className="btn-primary w-full text-lg py-3"
          disabled={loading || !form.exerciseTypeId}
        >
          {loading ? "저장 중..." : "운동 기록 저장"}
        </button>
      </form>
    </div>
  );
}
