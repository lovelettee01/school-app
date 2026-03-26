export type ThemeMode = "light" | "dark" | "system";

export type SchoolLevel = "elementary" | "middle" | "high";

export type SchoolSummary = {
  schoolKey: string;
  officeCode: string;
  officeName: string;
  schoolCode: string;
  schoolName: string;
  schoolType: string;
  orgType: string;
  regionName: string;
  addressRoad: string;
  addressJibun: string;
  tel: string;
  homepage: string;
  coeduType: string;
};

export type MealItem = {
  mealDate: string;
  mealType: string;
  menuLines: string[];
  calorie: string;
  nutrition: string;
  origin: string;
};

export type TimetableItem = {
  date: string;
  grade: number;
  classNo: number;
  period: number;
  subject: string;
};

export type FavoriteSchool = {
  schoolKey: string;
  schoolName: string;
  officeName: string;
  schoolType: string;
  updatedAt: string;
};

export type RecentSchool = {
  schoolKey: string;
  schoolName: string;
  officeName: string;
  viewedAt: string;
};
