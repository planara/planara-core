/**
 * Enum типов ответа от менеджеров и политик.
 *
 * @remarks
 * Используется в `Response.type`.
 *
 * @public
 * @enum {string}
 */
export enum ResponseType {
  /** Действие заблокировано, инструмент недоступен */
  ToolNotAllowed = 'TOOL_NOT_ALLOWED',

  /** Действие выполнено успешно */
  Success = 'SUCCESS',

  /** Действие не выполнено, потому что нет изменений */
  NoChange = 'NO_CHANGE',
}
