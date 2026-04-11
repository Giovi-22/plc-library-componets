# Tareas: Refinamientos UX Motor

- [ ] 1. Extender `props` de `ScadaElement` en `types.ts` con `hideLabel` y `flipX`.
- [ ] 2. Modificar el tipo unificado de componentes `ElementProps` para recibir `plcState?: any`.
- [ ] 3. Actualizar `ScadaStage.tsx` para pasar `plcState={device?.state}` a los componentes (sobre todo `MotorElement`).
- [ ] 4. Actualizar `MotorElement.tsx`:
  - Envolver render de etiqueta con `!element.props.hideLabel`.
  - Aplicar `scaleX={element.props.flipX ? -1 : 1}` al grupo gráfico del motor.
  - Renderizar insignia circular de Modo Operación leyendo `CONF_MODE_SELECTED` desde `plcState`.
- [ ] 5. Actualizar `GenericElement.tsx` envolviendo la etiqueta genérica con la opción `hideLabel`.
- [ ] 6. Actualizar `designer/page.tsx` añadiendo casillas para `Ocultar Etiqueta` y `Reflejar Motor` en el panel de propiedades.
