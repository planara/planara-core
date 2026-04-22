// IOC
import { injectAll, injectable } from 'tsyringe';
// Interfaces
import type { IMediator } from '../interfaces/mediator';
import type { IManager } from '../interfaces/manager/manager';
import type { IMiddleware } from '../interfaces/middleware';
// Types
import type { ICommand } from '../interfaces/command';
import type { IResponse } from '../interfaces/response';
import type { FeatureType } from '../types/feature/feature-type';
import { ResponseType } from '../types/response/response-type';

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

  public dispose(): Promise<void> | void {
    // Очистка хендлеров
    if (this._managers) {
      this._managers.clear();
    }
  }
}
