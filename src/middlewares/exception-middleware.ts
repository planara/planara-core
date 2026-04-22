// IOC
import { injectable } from 'tsyringe';
// Interfaces
import type { IMiddleware } from '../interfaces/middleware';
// Errors
import { PolicyError } from '../errors/policy-error';
// Types
import { ResponseType } from '../types/response/response-type';
import type { IResponse } from '../interfaces/response';

/** */
@injectable()
export class ExceptionMiddleware implements IMiddleware {
  public handle(next: () => IResponse | null): IResponse | null {
    try {
      return next();
    } catch (error) {
      if (error instanceof PolicyError) {
        return {
          type: error.type,
          message: error.message,
          code: error.code as string,
          blocked: true,
        };
      }

      if (error instanceof Error) {
        return {
          type: ResponseType.Error,
          message: error.message,
          code: 'UNHANDLED_EXCEPTION',
          blocked: true,
        };
      }

      return {
        type: ResponseType.Error,
        message: 'Unknown exception',
        code: 'UNKNOWN_EXCEPTION',
        blocked: true,
      };
    }
  }
}
