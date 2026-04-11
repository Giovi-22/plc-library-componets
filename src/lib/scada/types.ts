export type ElementType = 'motor' | 'valve' | 'pipe' | 'sensor' | 'elevator' | 'conveyor' | 'redler' | 'silo' | 'tank' | 'text' | 'rect' | 'circle';

export interface ScadaElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  width?: number;
  height?: number;
  points?: number[]; // Solo para cañerías
  groupId?: string; // Para agrupaciones lógicas de elementos
  props: {
    tag?: string;
    name?: string;
    thickness?: number; // Para cañerías / trazos
    color?: string;     // Para cañerías / trazos extra (stroke)
    fill?: string;      // Color de fondo para formas
    stroke?: string;    // Color de borde para formas
    fontSize?: number;  // Tamaño de texto base (para 'text')
    labelOffsetX?: number; // Offset X para la etiqueta debajo de los equipos
    labelOffsetY?: number; // Offset Y para la etiqueta debajo de los equipos
    labelFontSize?: number; // Tamaño específico para etiquetas de equipos
    hideLabel?: boolean; // Ocultar etiqueta autogenerada
    flipX?: boolean; // Reflejar horizontalmente (solo gráficos)
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
