/**
 * Ожидает истечения таймера или отмены замера.
 *
 * @remarks
 * В обоих случаях Promise успешно завершается. Вызывающий код может проверить
 * `signal.aborted`, чтобы решить, нужно ли сохранять результаты.
 * Таймер и обработчик отмены удаляются при завершении ожидания.
 *
 * @param ms - длительность ожидания в миллисекундах
 * @param signal - сигнал досрочного завершения ожидания
 * @returns Promise, который завершается сразу, если сигнал уже отменён
 *
 * @internal
 */
export function waitForBenchmark(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const timer = window.setTimeout(finish, ms);
    signal.addEventListener('abort', finish, { once: true });

    function finish(): void {
      window.clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      resolve();
    }
  });
}
