import { ACTIVITY_LEVEL, GENDER } from "@/typings/types/UserType";

export const activityOptions = [
  { value: ACTIVITY_LEVEL.SEDENTARY, label: "Ít vận động" },
  { value: ACTIVITY_LEVEL.LIGHTLY_ACTIVE, label: "Vận động nhẹ" },
  { value: ACTIVITY_LEVEL.MODERATELY_ACTIVE, label: "Vận động vừa" },
  { value: ACTIVITY_LEVEL.VERY_ACTIVE, label: "Vận động nhiều" },
  { value: ACTIVITY_LEVEL.EXTREMELY_ACTIVE, label: "Cực kỳ năng động" },
];

export const getActivityLabel = (value?: number) => {
  return (
    activityOptions.find((item) => item.value === value)?.label ||
    "Không xác định"
  );
};

export const genderType = [
  {
    text: "Nam",
    value: GENDER.MALE,
  },
  {
    text: "Nữ",
    value: GENDER.FEMALE,
  },
  {
    text: "Khác",
    value: GENDER.FEMALE,
  },
];
