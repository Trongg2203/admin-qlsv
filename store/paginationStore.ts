// store/paginationStore.ts
import { create } from "zustand";

interface PaginationState {
  // State
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  searchTerm: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  
  // Actions
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalPages: (pages: number) => void;
  setTotalItems: (total: number) => void;
  setSearchTerm: (term: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setPagination: (data: { 
    currentPage: number; 
    lastPage: number; 
    perPage: number; 
    total: number 
  }) => void;
  resetPagination: () => void;
}

export const usePaginationStore = create<PaginationState>((set) => ({
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalItems: 0,
  searchTerm: "",
  sortBy: "",
  sortOrder: "asc",
  
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  setTotalItems: (total) => set({ totalItems: total }),
  setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder }),
  setPagination: (data) => set({ 
    currentPage: data.currentPage,
    totalPages: data.lastPage,
    pageSize: data.perPage,
    totalItems: data.total,
  }),
  resetPagination: () => set({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
    searchTerm: "",
    sortBy: "",
    sortOrder: "asc",
  }),
}));