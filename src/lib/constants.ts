export const EXERCISE_CATEGORIES = {
  CARDIO: { label: "유산소", color: "#22c55e" },
  STRENGTH: { label: "근력", color: "#3b82f6" },
  FLEXIBILITY: { label: "유연성", color: "#a855f7" },
  SPORTS: { label: "스포츠", color: "#f97316" },
  OTHER: { label: "기타", color: "#6b7280" },
} as const;

export const DEFAULT_EXERCISES = [
  { name: "러닝", category: "CARDIO", icon: "🏃" },
  { name: "걷기", category: "CARDIO", icon: "🚶" },
  { name: "자전거", category: "CARDIO", icon: "🚴" },
  { name: "수영", category: "CARDIO", icon: "🏊" },
  { name: "웨이트", category: "STRENGTH", icon: "🏋️" },
  { name: "맨몸운동", category: "STRENGTH", icon: "💪" },
  { name: "크로스핏", category: "STRENGTH", icon: "🔥" },
  { name: "요가", category: "FLEXIBILITY", icon: "🧘" },
  { name: "스트레칭", category: "FLEXIBILITY", icon: "🤸" },
  { name: "필라테스", category: "FLEXIBILITY", icon: "🩰" },
  { name: "축구", category: "SPORTS", icon: "⚽" },
  { name: "농구", category: "SPORTS", icon: "🏀" },
  { name: "배드민턴", category: "SPORTS", icon: "🏸" },
  { name: "테니스", category: "SPORTS", icon: "🎾" },
  { name: "등산", category: "CARDIO", icon: "⛰️" },
  { name: "기타", category: "OTHER", icon: "🏅" },
] as const;

export const INTENSITY_LABELS = [
  { value: 1, label: "매우 가벼움", emoji: "😊" },
  { value: 2, label: "가벼움", emoji: "🙂" },
  { value: 3, label: "보통", emoji: "😐" },
  { value: 4, label: "힘듦", emoji: "😤" },
  { value: 5, label: "매우 힘듦", emoji: "🥵" },
] as const;

export const FINE_PER_MISS = 5000; // KRW
export const WEEKLY_GOAL = 3;
export const MIN_CARDIO_DISTANCE_KM = 3.0;