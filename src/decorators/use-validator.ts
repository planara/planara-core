// Interfaces
import type { IValidator } from '@/interfaces/validator';

type ValidatorAccessor<TThis> = (self: TThis) => IValidator;

export const useValidator =
  <TThis extends object>(accessor: ValidatorAccessor<TThis>) =>
  <T extends (...args: any[]) => any>(
    _target: TThis,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    const original = descriptor.value;

    if (!original) {
      throw new Error('useValidator can only be applied to method');
    }

    descriptor.value = function (this: TThis, ...args: unknown[]) {
      const validator = accessor(this);

      validator.validate(...args);

      return original.apply(this, args);
    } as T;

    return descriptor;
  };
