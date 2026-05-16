"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { INTENSITY_LABELS } from "@/lib/constants";

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
    return <div className="card animate-pulse"><div className="h-60 bg-gray-100 rounded-lg" /></div>;
  }

  if (!workout) {
    return <div className="card text-center py-8 text-gray-500">운동 기록을 찾을 수 없습니다.</div>;
  }

  const intensityInfo = INTENSITY_LABELS.find((l) => l.value === workout.intensity);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* 헤더 */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
            {workout.exerciseType.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {workout.exerciseType.name}
            </h1>
            <p className="text-gray-500">
              {format(new Date(workout.date), "yyyy년 M월 d일 (E)", { locale: ko })}
            </p>
          </div>
          {workout.isVerified && (
            <span className="badge bg-green-100 text-green-700 ml-auto">인증완료</span>
          )}
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="card">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">운동 시간</p>
            <p className="text-lg font-semibold">{workout.durationMin}분</p>
          </div>
          {workout.distanceKm && (
            <div>
              <p className="text-sm text-gray-500">거리</p>
              <p className="text-lg font-semibold">{workout.distanceKm}km</p>
            </div>
          )}
          {workout.calories && (
            <div>
              <p className="text-sm text-gray-500">칼로리</p>
              <p className="text-lg font-semibold">{workout.calories}kcal</p>
            </div>
          )}
          {intensityInfo && (
            <div>
              <p className="text-sm text-gray-500">운동 강도</p>
              <p className="text-lg font-semibold">
                {intensityInfo.emoji} {intensityInfo.label}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 메모 */}
      {workout.memo && (
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">메모</p>
          <p className="text-gray-900 whitespace-pre-wrap">{workout.memo}</p>
        </div>
      )}

      {/* 사진 */}
      {workout.photos.length > 0 && (
        <div className="card">
          <p className="text-sm text-gray-500 mb-3">인증 사진</p>
          <div className="grid grid-cols-2 gap-2">
            {workout.photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
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
