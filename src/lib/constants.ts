export const EXERCISE_CATEGORIES = {
  CARDIO: {
    label: "유산소",
    color: "#10B981",
    bgAlpha: "rgba(16, 185, 129, 0.08)",
    borderAlpha: "rgba(16, 185, 129, 0.2)",
    shadowAlpha: "rgba(16, 185, 129, 0.1)",
  },
  STRENGTH: {
    label: "근력",
    color: "#3B82F6",
    bgAlpha: "rgba(59, 130, 246, 0.08)",
    borderAlpha: "rgba(59, 130, 246, 0.2)",
    shadowAlpha: "rgba(59, 130, 246, 0.1)",
  },
  FLEXIBILITY: {
    label: "유연성",
    color: "#8B5CF6",
    bgAlpha: "rgba(139, 92, 246, 0.08)",
    borderAlpha: "rgba(139, 92, 246, 0.2)",
    shadowAlpha: "rgba(139, 92, 246, 0.1)",
  },
  SPORTS: {
    label: "스포츠",
    color: "#FBBF24",
    bgAlpha: "rgba(251, 191, 36, 0.08)",
    borderAlpha: "rgba(251, 191, 36, 0.2)",
    shadowAlpha: "rgba(251, 191, 36, 0.1)",
  },
  OTHER: {
    label: "기타",
    color: "#6B7280",
    bgAlpha: "rgba(107, 114, 128, 0.08)",
    borderAlpha: "rgba(107, 114, 128, 0.2)",
    shadowAlpha: "rgba(107, 114, 128, 0.1)",
  },
} as const;

export const DEFAULT_EXERCISES = [
  // 유산소
  { name: "러닝", category: "CARDIO", icon: "🏃" },
  { name: "걷기", category: "CARDIO", icon: "🚶" },
  { name: "자전거", category: "CARDIO", icon: "🚴" },
  { name: "수영", category: "CARDIO", icon: "🏊" },
  { name: "등산", category: "CARDIO", icon: "⛰️" },
  { name: "줄넘기", category: "CARDIO", icon: "🪢" },
  { name: "로잉", category: "CARDIO", icon: "🚣" },
  { name: "계단오르기", category: "CARDIO", icon: "🪜" },
  // 근력
  { name: "웨이트", category: "STRENGTH", icon: "🏋️" },
  { name: "맨몸운동", category: "STRENGTH", icon: "💪" },
  { name: "크로스핏", category: "STRENGTH", icon: "🔥" },
  { name: "클라이밍", category: "STRENGTH", icon: "🧗" },
  { name: "케틀벨", category: "STRENGTH", icon: "🔔" },
  { name: "TRX", category: "STRENGTH", icon: "🪝" },
  // 유연성
  { name: "요가", category: "FLEXIBILITY", icon: "🧘" },
  { name: "스트레칭", category: "FLEXIBILITY", icon: "🤸" },
  { name: "필라테스", category: "FLEXIBILITY", icon: "🩰" },
  { name: "폼롤러", category: "FLEXIBILITY", icon: "🧴" },
  // 스포츠
  { name: "축구", category: "SPORTS", icon: "⚽" },
  { name: "농구", category: "SPORTS", icon: "🏀" },
  { name: "배드민턴", category: "SPORTS", icon: "🏸" },
  { name: "테니스", category: "SPORTS", icon: "🎾" },
  { name: "탁구", category: "SPORTS", icon: "🏓" },
  { name: "골프", category: "SPORTS", icon: "⛳" },
  { name: "볼링", category: "SPORTS", icon: "🎳" },
  { name: "스키/보드", category: "SPORTS", icon: "🏂" },
  { name: "서핑", category: "SPORTS", icon: "🏄" },
  { name: "복싱", category: "SPORTS", icon: "🥊" },
  // 기타
  { name: "댄스", category: "OTHER", icon: "💃" },
  { name: "기타", category: "OTHER", icon: "🏅" },
] as const;

export const INTENSITY_LABELS = [
  { value: 1, label: "매우 가벼움", emoji: "😊" },
  { value: 2, label: "가벼움", emoji: "🙂" },
  { value: 3, label: "보통", emoji: "😐" },
  { value: 4, label: "힘듦", emoji: "😤" },
  { value: 5, label: "매우 힘듦", emoji: "🥵" },
] as const;

export const MIN_CARDIO_DISTANCE_KM = 3.0;