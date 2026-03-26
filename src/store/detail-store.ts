import { create } from "zustand";

type DetailState = {
  schoolKey: string;
  mealFrom: string;
  mealTo: string;
  grade: string;
  classNo: string;
  mode: "day" | "week";
  baseDate: string;
  resetForSchool: (schoolKey: string) => void;
  setMealFrom: (value: string) => void;
  setMealTo: (value: string) => void;
  setGrade: (value: string) => void;
  setClassNo: (value: string) => void;
  setMode: (value: "day" | "week") => void;
  setBaseDate: (value: string) => void;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export const useDetailStore = create<DetailState>((set, get) => ({
  schoolKey: "",
  mealFrom: today(),
  mealTo: today(),
  grade: "1",
  classNo: "1",
  mode: "week",
  baseDate: today(),
  resetForSchool: (schoolKey) => {
    if (get().schoolKey === schoolKey) {
      return;
    }
    const now = today();
    set({
      schoolKey,
      mealFrom: now,
      mealTo: now,
      grade: "1",
      classNo: "1",
      mode: "week",
      baseDate: now,
    });
  },
  setMealFrom: (value) => set({ mealFrom: value }),
  setMealTo: (value) => set({ mealTo: value }),
  setGrade: (value) => set({ grade: value }),
  setClassNo: (value) => set({ classNo: value }),
  setMode: (value) => set({ mode: value }),
  setBaseDate: (value) => set({ baseDate: value }),
}));
