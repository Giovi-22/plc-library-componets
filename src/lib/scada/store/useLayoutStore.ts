import { create } from 'zustand';
import { ScadaElement, ScadaLayout } from '../types';

interface LayoutState {
  elements: ScadaElement[];
  selectedIds: string[];
  isLoading: boolean;
  isSaving: boolean;
  activeFaceplateId: string | null;
  
  // Actions
  setElements: (elements: ScadaElement[]) => void;
  addElement: (element: ScadaElement) => void;
  updateElement: (id: string, updates: Partial<ScadaElement>) => void;
  removeElement: (id: string) => void;
  setSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  groupElements: () => void;
  ungroupElements: () => void;
  
  // Layout Management (Async)
  fetchLayout: () => Promise<void>;
  saveLayout: () => Promise<void>;
  
  // Faceplate
  openFaceplate: (id: string) => void;
  closeFaceplate: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  elements: [],
  selectedIds: [],
  activeFaceplateId: null,
  isLoading: false,
  isSaving: false,

  setElements: (elements) => set({ elements }),
  
  addElement: (element) => set((state) => ({ 
    elements: [...state.elements, element] 
  })),

  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) => 
      el.id === id ? { ...el, ...updates } : el
    )
  })),

  removeElement: (id) => set((state) => ({
    elements: state.elements.filter((el) => el.id !== id),
    selectedIds: state.selectedIds.filter((sid) => sid !== id)
  })),

  setSelection: (ids) => set((state) => {
    // Si seleccionamos 1 elemento y pertenece a un grupo, seleccionamos a todo el grupo.
    if (ids.length === 1) {
      const el = state.elements.find(e => e.id === ids[0]);
      if (el && el.groupId) {
        const groupIds = state.elements.filter(e => e.groupId === el.groupId).map(e => e.id);
        return { selectedIds: groupIds };
      }
    }
    return { selectedIds: ids };
  }),

  toggleSelection: (id) => set((state) => {
    const isSelected = state.selectedIds.includes(id);
    const el = state.elements.find(e => e.id === id);
    let idsToToggle = [id];

    if (el && el.groupId) {
      idsToToggle = state.elements.filter(e => e.groupId === el.groupId).map(e => e.id);
    }

    if (isSelected) {
      return { selectedIds: state.selectedIds.filter(sid => !idsToToggle.includes(sid)) };
    } else {
      return { selectedIds: [...state.selectedIds, ...idsToToggle] };
    }
  }),

  clearSelection: () => set({ selectedIds: [] }),

  groupElements: () => set((state) => {
    if (state.selectedIds.length < 2) return state;
    const groupId = `GROUP-${Math.random().toString(36).substr(2, 9)}`;
    return {
      elements: state.elements.map(el => 
        state.selectedIds.includes(el.id) ? { ...el, groupId } : el
      )
    };
  }),

  ungroupElements: () => set((state) => {
    if (state.selectedIds.length === 0) return state;
    return {
      elements: state.elements.map(el => 
        state.selectedIds.includes(el.id) ? { ...el, groupId: undefined } : el
      )
    };
  }),

  openFaceplate: (id) => set({ activeFaceplateId: id }),
  closeFaceplate: () => set({ activeFaceplateId: null }),

  fetchLayout: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/scada/layout');
      const data = await res.json();
      set({ elements: data.elements || [] });
    } catch (error) {
      console.error('Error loading layout:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveLayout: async () => {
    const { elements } = useLayoutStore.getState();
    set({ isSaving: true });
    try {
      await fetch('/api/scada/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements })
      });
    } catch (error) {
      console.error('Error saving layout:', error);
    } finally {
      set({ isSaving: false });
    }
  }
}));
