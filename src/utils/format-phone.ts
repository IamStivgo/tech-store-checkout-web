const GROUPS = /^(\d{3})(\d{3})(\d{4})$/;

/** `3001234567` → `300 123 4567`; anything that is not ten digits is returned as is. */
export const formatPhone = (digits: string): string => digits.replace(GROUPS, '$1 $2 $3');
