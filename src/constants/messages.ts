/**
 * Константы сообщений для политик инструментов.
 *
 * @remarks
 * Используются в `ToolPolicy` и `ToolManager` для унификации сообщений.
 *
 * @public
 * @constant
 */
export const TOOL_MESSAGES = {
  /** Сообщение, когда инструмент недоступен в текущем режиме выбора */
  ToolNotAllowed: 'This tool cannot be used with current select mode',

  /** Сообщение об успешном выполнении действия */
  Success: 'Action executed successfully',

  /** Сообщение, когда инструмент уже выбран */
  NoChange: 'Tool already selected',
} as const;
