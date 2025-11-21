/**
 * Слой объектов-геометрий (`THREE.Mesh`).
 *
 * @remarks
 * Используется для режима Mesh/Face. Камера и Raycaster должны «видеть» этот слой,
 * когда активен соответствующий режим.
 *
 * @example
 * camera.layers.enable(MESH_LAYER);
 * raycaster.layers.set(MESH_LAYER);
 */
export const MESH_LAYER = 0;

/**
 * Слой контуров (`THREE.LineSegments`) — внешние рёбра мешей.
 *
 * @remarks
 * По этому слою идёт попадание в режиме выбора рёбер (Edge). Камера должна
 * видеть слой, а для Raycaster можно также настроить `params.Line.threshold`.
 *
 * @example
 * camera.layers.enable(LINE_LAYER);
 * raycaster.layers.set(LINE_LAYER);
 * raycaster.params.Line.threshold = 0.03;
 */
export const LINE_LAYER = 1;

/**
 * Слой контуров (`THREE.Points`) — внешние вершины мешей.
 *
 * @remarks
 * По этому слою идёт попадание в режиме выбора вершин (Vertex). Камера должна
 * видеть слой, а для Raycaster можно также настроить `params.Points.threshold`.
 *
 * @example
 * camera.layers.enable(POINT_LAYER);
 * raycaster.layers.set(POINT_LAYER);
 * raycaster.params.Points.threshold = 0.03;
 */
export const POINT_LAYER = 2;

/**
 * Слой оверлеев-подсветок (`THREE.Line`, `THREE.Points`) — hover/select маркеры.
 *
 * @remarks
 * Эти линии/вершины рендерятся поверх сцены (обычно с `depthTest=false`). Их лучше
 * исключить из Raycaster (не включать этот слой для него), но включить для камеры.
 *
 * @example
 * camera.layers.enable(OVERLAY_LAYER); // камера видит подсветку
 * // Raycaster НЕ видит подсветку:
 * // raycaster.layers.set(...) — без OVERLAY_LAYER
 */
export const OVERLAY_LAYER = 31;
