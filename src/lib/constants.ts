export const EXERCISE_CATEGORIES = {
  CARDIO: {
    label: "유산소",
    color: "#34D399",
    gradient: "from-emerald-400 to-emerald-600",
    bgAlpha: "rgba(52, 211, 153, 0.1)",
    borderAlpha: "rgba(52, 211, 153, 0.2)",
    shadowAlpha: "rgba(52, 211, 153, 0.15)",
  },
  STRENGTH: {
    label: "근력",
    color: "#60A5FA",
    gradient: "from-blue-400 to-blue-600",
    bgAlpha: "rgba(96, 165, 250, 0.1)",
    borderAlpha: "rgba(96, 165, 250, 0.2)",
    shadowAlpha: "rgba(96, 165, 250, 0.15)",
  },
  FLEXIBILITY: {
    label: "유연성",
    color: "#C084FC",
    gradient: "from-purple-400 to-purple-600",
    bgAlpha: "rgba(192, 132, 252, 0.1)",
    borderAlpha: "rgba(192, 132, 252, 0.2)",
    shadowAlpha: "rgba(192, 132, 252, 0.15)",
  },
  SPORTS: {
    label: "스포츠",
    color: "#FB923C",
    gradient: "from-orange-400 to-orange-600",
    bgAlpha: "rgba(251, 146, 60, 0.1)",
    borderAlpha: "rgba(251, 146, 60, 0.2)",
    shadowAlpha: "rgba(251, 146, 60, 0.15)",
  },
  OTHER: {
    label: "기타",
    color: "#94A3B8",
    gradient: "from-slate-400 to-slate-600",
    bgAlpha: "rgba(148, 163, 184, 0.1)",
    borderAlpha: "rgba(148, 163, 184, 0.2)",
    shadowAlpha: "rgba(148, 163, 184, 0.15)",
  },
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