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
  location: string | null;
  link: string | null;
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
  const [shareToast, setShareToast] = useState(false);

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

  const handleShare = () => {
    if (!workout) return;
    const intensityInfo = INTENSITY_LABELS.find((l) => l.value === workout.intensity);
    const dateStr = format(new Date(workout.date), "yyyy.M.d (E)", { locale: ko });

    let text = `${workout.exerciseType.icon} ${workout.exerciseType.name} - ${dateStr}\n`;
    text += `⏱ ${workout.durationMin}분`;
    if (workout.distanceKm) text += ` | 📏 ${workout.distanceKm}km`;
    if (workout.calories) text += ` | 🔥 ${workout.calories}kcal`;
    if (intensityInfo) text += ` | ${intensityInfo.emoji} ${intensityInfo.label}`;
    text += "\n";
    if (workout.location) text += `📍 ${workout.location}\n`;
    if (workout.memo) text += `💬 ${workout.memo}\n`;
    text += `\n— FitLog`;

    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        <div className="h-24 rounded-xl bg-white border border-stone-200 animate-pulse" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-20 rounded-xl bg-white border border-stone-200 animate-pulse" />
          <div className="h-20 rounded-xl bg-white border border-stone-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!workout) {
    return <div className="rounded-xl border border-stone-200 bg-white text-center py-10 text-stone-400 text-sm shadow-sm">운동 기록을 찾을 수 없습니다.</div>;
  }

  const category = workout.exerciseType.category as keyof typeof EXERCISE_CATEGORIES;
  const catInfo = EXERCISE_CATEGORIES[category];
  const intensityInfo = INTENSITY_LABELS.find((l) => l.value === workout.intensity);

  return (
    <div className="max-w-lg mx-auto space-y-3">
      <div className="flex items-center justify-between mb-1">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-600 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          뒤로
        </button>
        <div className="flex items-center gap-1.5">
          <button onClick={handleShare} className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-all" title="공유">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
          <button onClick={handleDelete} className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all" title="삭제">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <motion.div className="rounded-2xl p-5 bg-white border border-stone-200 shadow-sm relative overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] pointer-events-none opacity-10" style={{ background: catInfo?.color }} />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: catInfo?.bgAlpha, border: `1px solid ${catInfo?.borderAlpha}` }}>{workout.exerciseType.icon}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-stone-900">{workout.exerciseType.name}</h1>
            <p className="text-[11px] text-stone-400 mt-0.5">{format(new Date(workout.date), "yyyy년 M월 d일 (E)", { locale: ko })}</p>
            <span className="inline-block text-[9px] font-medium px-2 py-0.5 rounded-full mt-1.5" style={{ background: catInfo?.bgAlpha, color: catInfo?.color, border: `1px solid ${catInfo?.borderAlpha}` }}>{catInfo?.label}</span>
          </div>
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-2 gap-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="rounded-xl p-3.5 bg-white border border-stone-200 shadow-sm">
          <p className="text-[9px] text-stone-400 font-medium">운동 시간</p>
          <p className="text-xl font-bold text-stone-800 mt-1">{workout.durationMin}<span className="text-[10px] font-normal text-stone-400 ml-0.5">분</span></p>
        </div>
        {workout.distanceKm && (
          <div className="rounded-xl p-3.5 bg-white border border-stone-200 shadow-sm">
            <p className="text-[9px] text-stone-400 font-medium">거리</p>
            <p className="text-xl font-bold text-emerald-500 mt-1">{workout.distanceKm}<span className="text-[10px] font-normal text-stone-400 ml-0.5">km</span></p>
          </div>
        )}
        {workout.calories && (
          <div className="rounded-xl p-3.5 bg-white border border-stone-200 shadow-sm">
            <p className="text-[9px] text-stone-400 font-medium">칼로리</p>
            <p className="text-xl font-bold text-orange-500 mt-1">{workout.calories}<span className="text-[10px] font-normal text-stone-400 ml-0.5">kcal</span></p>
          </div>
        )}
        {intensityInfo && (
          <div className="rounded-xl p-3.5 bg-white border border-stone-200 shadow-sm">
            <p className="text-[9px] text-stone-400 font-medium">강도</p>
            <p className="text-lg mt-1">{intensityInfo.emoji} <span className="text-[11px] font-medium text-stone-600">{intensityInfo.label}</span></p>
          </div>
        )}
      </motion.div>

      {(workout.location || workout.link) && (
        <motion.div className="rounded-xl p-3.5 bg-white border border-stone-200 shadow-sm space-y-2.5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          {workout.location && (<div className="flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-400 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span className="text-[12px] text-stone-600">{workout.location}</span></div>)}
          {workout.link && (<div className="flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-400 shrink-0"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg><a href={workout.link} target="_blank" rel="noopener noreferrer" className="text-[12px] text-orange-500 hover:underline truncate">{workout.link.replace(/^https?:\/\//, "").split("/")[0]}</a></div>)}
        </motion.div>
      )}

      {workout.memo && (
        <motion.div className="rounded-xl p-3.5 bg-white border border-stone-200 shadow-sm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-[9px] text-stone-400 font-medium mb-1.5">메모</p>
          <p className="text-stone-600 whitespace-pre-wrap text-[12px] leading-relaxed">{workout.memo}</p>
        </motion.div>
      )}

      {workout.photos.length > 0 && (
        <motion.div className="rounded-xl p-3.5 bg-white border border-stone-200 shadow-sm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
          <p className="text-[9px] text-stone-400 font-medium mb-2.5">인증 사진</p>
          <div className={`grid gap-1.5 ${workout.photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {workout.photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden border border-stone-200">
                <img src={`/uploads/${photo.filePath}`} alt={photo.fileName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {shareToast && (
        <motion.div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[11px] font-medium px-4 py-2.5 rounded-full shadow-xl z-50" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          클립보드에 복사됨
        </motion.div>
      )}
    </div>
  );
}
