// Types
import { ResponseType } from '../../types/response/response-type';

/**
 * Тип ответа от менеджеров или политик редактора.
 *
 * @remarks
 * Используется для единого API на уровне Hub.
 * Все менеджеры возвращают `Response`, чтобы клиент знал статус вызова.
 *
 * @public
 * @interface
 */
export interface IResponse {
  /** Тип ответа (enum ResponseType) */
  type: ResponseType;

  /** Читаемое сообщение для отображения или логирования */
  message: string;

  /** Строковый код для логов или интеграций (опционально) */
  code?: string;

  /** Флаг блокировки действия (true, если вызов запрещён) */
  blocked?: boolean;
}
