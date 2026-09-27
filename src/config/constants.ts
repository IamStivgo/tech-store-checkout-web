export const API_BASE_URL = '/api/v1';

// Same values as the API pricing defaults (business rules §7), only to inform the buyer before
// checkout: the API always computes the charged total.
export const SERVICE_FEE_IN_CENTS = 300_000;
export const FREE_SHIPPING_THRESHOLD_IN_CENTS = 15_000_000;
