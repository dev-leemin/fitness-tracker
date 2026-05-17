"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { EXERCISE_CATEGORIES, INTENSITY_LABELS } from "@/lib/constants";
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
    if (res.ok) router.push("/workout");
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="skeleton h-28 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-24 rounded-3xl" />
          <div className="skeleton h-24 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!workout) {
    return <div className="card-glass text-center py-10 text-white/35 text-sm">운동 기록을 찾을 수 없습니다.</div>;
  }

  const category = workout.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
  const catInfo = EXERCISE_CATEGORIES[category];
  const intensityInfo = INTENSITY_LABELS.find((l) => l.value === workout.intensity);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header with category color */}
      <motion.div
        className="card-glass !p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Category color glow */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] pointer-events-none opacity-20"
          style={{ background: catInfo?.color }}
        />

        <div className="relative flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{
              background: catInfo?.bgAlpha,
              border: `1.5px solid ${catInfo?.borderAlpha}`,
              boxShadow: `0 8px 24px ${catInfo?.shadowAlpha}`,
            }}
          >
            {workout.exerciseType.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">
                {workout.exerciseType.name}
              </h1>
              {workout.isVerified && <span className="badge-glow">인증</span>}
            </div>
            <p className="text-white/35 text-[13px] mt-1">
              {format(new Date(workout.date), "yyyy년 M월 d일 (E)", { locale: ko })}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: catInfo?.bgAlpha,
                  color: catInfo?.color,
                  border: `1px solid ${catInfo?.borderAlpha}`,
                }}
              >
                {catInfo?.label}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="card-glass !p-4">
          <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">운동 시간</p>
          <p className="text-2xl font-bold text-white mt-2">{workout.durationMin}<span className="text-[12px] font-normal text-white/30 ml-0.5">분</span></p>
        </div>
        {workout.distanceKm && (
          <div className="card-glass !p-4">
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">거리</p>
            <p className="text-2xl font-bold text-[#34D399] mt-2">{workout.distanceKm}<span className="text-[12px] font-normal text-white/30 ml-0.5">km</span></p>
          </div>
        )}
        {workout.calories && (
          <div className="card-glass !p-4">
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">칼로리</p>
            <p className="text-2xl font-bold text-[#FB923C] mt-2">{workout.calories}<span className="text-[12px] font-normal text-white/30 ml-0.5">kcal</span></p>
          </div>
        )}
        {intensityInfo && (
          <div className="card-glass !p-4">
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">강도</p>
            <p className="text-xl mt-2">
              {intensityInfo.emoji} <span className="text-sm font-medium text-white/70">{intensityInfo.label}</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* Memo */}
      {workout.memo && (
        <motion.div
          className="card-glass"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-2">메모</p>
          <p className="text-white/60 whitespace-pre-wrap text-[13px] leading-relaxed">{workout.memo}</p>
        </motion.div>
      )}

      {/* Photos */}
      {workout.photos.length > 0 && (
        <motion.div
          className="card-glass"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium mb-3">인증 사진</p>
          <div className="grid grid-cols-2 gap-2">
            {workout.photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg">
                <img
                  src={`/uploads/${photo.filePath}`}
                  alt={photo.fileName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Delete */}
      <button onClick={handleDelete} className="btn-danger w-full !rounded-2xl">
        기록 삭제
      </button>
    </div>
  );
}
