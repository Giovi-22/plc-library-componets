import { create } from 'zustand';
import { ScadaElement, ScadaLayout } from '../types';

interface LayoutState {
  elements: ScadaElement[];
  selectedId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  activeFaceplateId: string | null;
  
  // Actions
  setElements: (elements: ScadaElement[]) => void;
  addElement: (element: ScadaElement) => void;
  updateElement: (id: string, updates: Partial<ScadaElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  
  // Layout Management (Async)
  fetchLayout: () => Promise<void>;
  saveLayout: () => Promise<void>;
  
  // Faceplate
  openFaceplate: (id: string) => void;
  closeFaceplate: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  elements: [],
  selectedId: null,
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
    selectedId: state.selectedId === id ? null : state.selectedId
  })),

  selectElement: (id) => set({ selectedId: id }),

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
