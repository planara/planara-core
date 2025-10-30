/**
 * Цвет подсветки при наведении (hover).
 *
 * @remarks
 * Используется для временной подсветки элемента под курсором.
 * Обычно применяется к оверлею (`THREE.Line`) или к граням/рёбрам,
 * и не должен конфликтовать с цветом выбранного элемента.
 *
 * @example
 * (line.material as THREE.LineBasicMaterial).color.setHex(HOVER_COLOR);
 */
export const HOVER_COLOR = 0xffff00;

/**
 * Цвет подсветки для выбранного элемента (select).
 *
 * @remarks
 * Применяется к постоянной подсветке выбранного ребра/грани до снятия выбора.
 * Должен визуально отличаться от {@link HOVER_COLOR}, чтобы не путать состояния.
 *
 * @example
 * (line.material as THREE.LineBasicMaterial).color.setHex(SELECT_COLOR);
 */
export const SELECT_COLOR = 0xffaa00;
