/** `4242` → `•••• 4242`, the only part of a card number the app ever shows after entry. */
export const maskLastFour = (lastFour: string): string => `•••• ${lastFour}`;
