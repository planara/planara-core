// IOC
import { injectAll, injectable } from 'tsyringe';
// Interfaces
import type { IMediator } from '@/interfaces/mediator';
import type { IManager } from '@/interfaces/manager';
import type { IMiddleware } from '@/interfaces/middleware';
import type { ICommand } from '@/interfaces/command';
// Types
import type { FeatureType } from '@/types/feature';
import { type IResponse, ResponseType } from '@planara/types';
// Utils
import { disposeAll } from '@/shared/utils';

/** */
@injectable()
export class Mediator implements IMediator {
  private readonly _managers: Map<FeatureType, IManager>;

  public constructor(
    @injectAll('IManager') managers: IManager[],
    @injectAll('IMiddleware') private readonly _middlewares: IMiddleware[],
  ) {
    this._managers = new Map(managers.map((manager) => [manager.type, manager]));
  }

  public send(command: ICommand): IResponse | null {
    const manager = this._managers.get(command.type);

    if (!manager) {
      return {
        type: ResponseType.Error,
        message: `Manager for feature "${String(command.type)}" not found`,
        code: 'MANAGER_NOT_FOUND',
        blocked: true,
      };
    }

    const execute = (): IResponse | null => {
      manager.manage(...command.payload);
      return null;
    };

    const pipeline = this._middlewares.reduceRight<() => IResponse | null>((next, middleware) => {
      return () => middleware.handle(next);
    }, execute);

    return pipeline();
  }

  /**
   * Удаляет маршруты команд и освобождает зарегистрированные менеджеры.
   *
   * @remarks
   * Таблица маршрутов очищается до начала асинхронного освобождения.
   * Последующие команды больше не попадут в завершающие работу менеджеры.
   *
   * @returns Promise завершения очистки менеджеров
   */
  public dispose(): Promise<void> {
    const managers = [...this._managers.values()];
    this._managers.clear();

    return disposeAll(managers);
  }
}
