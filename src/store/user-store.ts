import { create } from "zustand";
import { FavoriteSchool, RecentSchool, SchoolSummary } from "@/lib/types";
import { getFavorites, getRecents, pushRecent, toggleFavorite } from "@/lib/storage";

type UserState = {
  favorites: FavoriteSchool[];
  recents: RecentSchool[];
  hydrated: boolean;
  hydrate: () => void;
  isFavorite: (schoolKey: string) => boolean;
  toggleFavoriteSchool: (school: SchoolSummary) => void;
  pushRecentSchool: (school: SchoolSummary) => void;
};

export const useUserStore = create<UserState>((set, get) => ({
  favorites: [],
  recents: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    set({ favorites: getFavorites(), recents: getRecents(), hydrated: true });
  },
  isFavorite: (schoolKey) => get().favorites.some((item) => item.schoolKey === schoolKey),
  toggleFavoriteSchool: (school) => {
    const next = toggleFavorite({
      schoolKey: school.schoolKey,
      schoolName: school.schoolName,
      officeName: school.officeName,
      schoolType: school.schoolType,
    });
    set({ favorites: next });
  },
  pushRecentSchool: (school) => {
    const next = pushRecent({
      schoolKey: school.schoolKey,
      schoolName: school.schoolName,
      officeName: school.officeName,
    });
    set({ recents: next });
  },
}));
