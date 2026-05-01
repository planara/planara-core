// Interfaces
import type { IValidator } from '@/interfaces/validator';
// Types
import { ResponseType } from '@planara/types';
// Errors
import { ValidationError } from '@/errors/validation-error';

/**
 * Валидатор контента .obj-файла
 *
 * @internal
 * @class
 */
export class ObjValidator implements IValidator {
  public constructor() {}

  public validate(content: string): void {
    const normalizedContent = content.trim();

    if (!normalizedContent) {
      throw new ValidationError(
        ResponseType.ValidationError,
        `File content is empty.`,
        'FILE_CONTENT_EMPTY',
      );
    }

    if (!/^v\s+[-+.\deE]+\s+[-+.\deE]+\s+[-+.\deE]+/m.test(normalizedContent)) {
      throw new ValidationError(
        ResponseType.ValidationError,
        `OBJ content does not contain vertices.`,
        'WRONG_FILE_CONTENT',
      );
    }

    if (!/^f\s+/m.test(normalizedContent)) {
      throw new ValidationError(
        ResponseType.ValidationError,
        `OBJ content does not contain faces.`,
        'WRONG_FILE_CONTENT',
      );
    }
  }
}
