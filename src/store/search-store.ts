import { create } from "zustand";
import { SchoolSummary } from "@/lib/types";
import { OFFICE_OPTIONS } from "@/lib/offices";

type SearchState = {
  officeCode: string;
  schoolName: string;
  schools: SchoolSummary[];
  loading: boolean;
  error: string;
  setOfficeCode: (value: string) => void;
  setSchoolName: (value: string) => void;
  setSchools: (value: SchoolSummary[]) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string) => void;
  reset: () => void;
};

const initialOffice = OFFICE_OPTIONS[0].code;

export const useSearchStore = create<SearchState>((set) => ({
  officeCode: initialOffice,
  schoolName: "",
  schools: [],
  loading: false,
  error: "",
  setOfficeCode: (value) => set({ officeCode: value }),
  setSchoolName: (value) => set({ schoolName: value }),
  setSchools: (value) => set({ schools: value }),
  setLoading: (value) => set({ loading: value }),
  setError: (value) => set({ error: value }),
  reset: () => set({ schoolName: "", schools: [], loading: false, error: "" }),
}));
