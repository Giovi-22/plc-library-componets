export type ElementType = 'motor' | 'valve' | 'pipe' | 'sensor' | 'elevator' | 'conveyor' | 'redler' | 'silo' | 'tank';

export interface ScadaElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  width?: number;
  height?: number;
  points?: number[]; // Solo para cañerías
  props: {
    tag?: string;
    name?: string;
    thickness?: number; // Para cañerías
    color?: string;     // Para cañerías
    [key: string]: any;
  };
}

export interface ScadaLayout {
  elements: ScadaElement[];
}

export interface Vector2d {
  x: number;
  y: number;
}
