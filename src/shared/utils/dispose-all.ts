import type { Disposable } from 'tsyringe';

/**
 * Последовательно освобождает ресурсы в порядке их передачи.
 *
 * @remarks
 * Если один экземпляр передан несколько раз, его `dispose()` вызывается один раз.
 * Перед переходом к следующему ресурсу функция дожидается завершения текущего
 * вызова. Ошибка одного ресурса не прерывает очистку остальных.
 *
 * @param resources - ресурсы в порядке освобождения
 * @returns Promise, который завершается после обработки всех ресурсов
 * @throws {@link AggregateError}, если один или несколько вызовов `dispose()` завершились ошибкой
 *
 * @internal
 */
export async function disposeAll(resources: Iterable<Disposable>): Promise<void> {
  const errors: unknown[] = [];

  for (const resource of new Set(resources)) {
    try {
      await resource.dispose();
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, 'Failed to dispose one or more resources');
  }
}
