// IOC
import { injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IInteractiveModule } from '@/interfaces/module';
import type { IInteractionApi } from '@/interfaces/api';

/**
 * API управления пользовательским взаимодействием.
 *
 * @remarks
 * Позволяет включать или отключать интерактивную логику всех модулей,
 * поддерживающих {@link IInteractiveModule}. API не освобождает ресурсы
 * модулей и не удаляет обработчики событий, а только управляет доступностью
 * пользовательского ввода.
 *
 * @internal
 * @class
 */
@injectable()
export class InteractionApi implements IInteractionApi {
  public constructor(
    @injectAll('IInteractiveModule')
    private readonly _interactive: IInteractiveModule[],
  ) {}

  public isInteractionEnabled(): boolean {
    return this._interactive.every((module) => module.isInteractionEnabled());
  }

  public setInteractionEnabled(enabled: boolean): void {
    this._interactive.forEach((module) => module.setInteractionEnabled(enabled));
  }
}
