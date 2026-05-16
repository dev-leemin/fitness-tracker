"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { INTENSITY_LABELS } from "@/lib/constants";
import { motion } from "framer-motion";

interface WorkoutDetail {
  id: string;
  date: string;
  durationMin: number;
  distanceKm: number | null;
  calories: number | null;
  intensity: number | null;
  memo: string | null;
  isVerified: boolean;
  exerciseType: {
    name: string;
    icon: string | null;
    category: string;
  };
  photos: { id: string; filePath: string; fileName: string }[];
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workout/${params.id}`)
      .then((r) => r.json())
      .then((data) => setWorkout(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("이 운동 기록을 삭제할까요?")) return;

    const res = await fetch(`/api/workout/${params.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/workout");
    }
  };

  if (loading) {
    return <div className="glass-card animate-pulse"><div className="h-60 bg-white/[0.02] rounded-lg" /></div>;
  }

  if (!workout) {
    return <div className="glass-card text-center py-8 text-white/40">운동 기록을 찾을 수 없습니다.</div>;
  }

  const intensityInfo = INTENSITY_LABELS.find((l) => l.value === workout.intensity);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* 헤더 */}
      <motion.div
        className="glow-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-3xl">
            {workout.exerciseType.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {workout.exerciseType.name}
            </h1>
            <p className="text-white/40 text-sm">
              {format(new Date(workout.date), "yyyy년 M월 d일 (E)", { locale: ko })}
            </p>
          </div>
          {workout.isVerified && (
            <span className="badge-glow ml-auto">인증완료</span>
          )}
        </div>
      </motion.div>

      {/* 상세 정보 */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider">운동 시간</p>
            <p className="text-lg font-semibold text-white mt-1">{workout.durationMin}분</p>
          </div>
          {workout.distanceKm && (
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider">거리</p>
              <p className="text-lg font-semibold text-white mt-1">{workout.distanceKm}km</p>
            </div>
          )}
          {workout.calories && (
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider">칼로리</p>
              <p className="text-lg font-semibold text-white mt-1">{workout.calories}kcal</p>
            </div>
          )}
          {intensityInfo && (
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider">운동 강도</p>
              <p className="text-lg font-semibold text-white mt-1">
                {intensityInfo.emoji} {intensityInfo.label}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 메모 */}
      {workout.memo && (
        <div className="glass-card">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-2">메모</p>
          <p className="text-white/70 whitespace-pre-wrap text-sm leading-relaxed">{workout.memo}</p>
        </div>
      )}

      {/* 사진 */}
      {workout.photos.length > 0 && (
        <div className="glass-card">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-3">인증 사진</p>
          <div className="grid grid-cols-2 gap-2">
            {workout.photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden border border-white/[0.08]">
                <img
                  src={`/uploads/${photo.filePath}`}
                  alt={photo.fileName}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 삭제 버튼 */}
      <button onClick={handleDelete} className="btn-danger w-full">
        기록 삭제
      </button>
    </div>
  );
}
