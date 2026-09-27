import type { FieldErrors } from 'react-hook-form';

/** Number of invalid fields in a (nested) React Hook Form errors object. */
export const countErrors = (errors: FieldErrors): number =>
  Object.values(errors).reduce<number>((count, error) => {
    if (!error || typeof error !== 'object') {
      return count;
    }
    return 'message' in error && typeof error.message === 'string'
      ? count + 1
      : count + countErrors(error as FieldErrors);
  }, 0);
