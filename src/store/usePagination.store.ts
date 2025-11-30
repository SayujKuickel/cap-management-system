import { StoreApi, UseBoundStore, create } from "zustand";

interface PaginationState {
  query: string;
  page: number;
  perPage: number;
  maxPage: number;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
  setPerPage: (page: number) => void;
  setMaxPage: (page: number) => void;
  setQuery: (query: string) => void;
}

type PaginationStoreHook = UseBoundStore<StoreApi<PaginationState>>;

const createPaginationStore = (): PaginationStoreHook =>
  create<PaginationState>((set) => ({
    query: "",
    page: 1,
    perPage: 15,
    maxPage: 0,
    nextPage: () => set((state) => ({ page: state.page + 1 })),
    prevPage: () => set((state) => ({ page: Math.max(state.page - 1, 1) })),
    setPage: (page) => set({ page }),
    resetPage: () => set({ page: 0 }),
    setMaxPage: (val) => set({ maxPage: val }),
    setPerPage: (perPage) => set({ perPage }),
    setQuery: (query) => set({ query }),
  }));

const paginationStores = new Map<string, PaginationStoreHook>();

const getPaginationStore = (key: string): PaginationStoreHook => {
  const existing = paginationStores.get(key);
  if (existing) return existing;
  const newStore = createPaginationStore();
  paginationStores.set(key, newStore);
  return newStore;
};

export const usePaginationStore = getPaginationStore("default");
export const usePaginationStoreByKey = (key: string) => getPaginationStore(key);
