// Interfaces
import type { IPolicy } from '@/interfaces/policy';

type PolicyAccessor<TThis> = (self: TThis) => IPolicy;

export const usePolicy =
  <TThis extends object>(accessor: PolicyAccessor<TThis>) =>
  <T extends (...args: any[]) => any>(
    _target: TThis,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    const original = descriptor.value;

    if (!original) {
      throw new Error('usePolicy can only be applied to method');
    }

    descriptor.value = function (this: TThis, ...args: unknown[]) {
      const policy = accessor(this);

      policy.check(...args);

      return original.apply(this, args);
    } as T;

    return descriptor;
  };
