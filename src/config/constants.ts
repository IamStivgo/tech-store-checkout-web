export const API_BASE_URL = '/api/v1';

// Same values as the API pricing defaults (business rules §7), only to inform the buyer before
// checkout: the API always computes the charged total.
export const SERVICE_FEE_IN_CENTS = 300_000;
export const FREE_SHIPPING_THRESHOLD_IN_CENTS = 15_000_000;
// Kilograms every delivery zone includes in its base rate (API coverage data), only to explain
// the extra weight in the summary.
export const INCLUDED_WEIGHT_KG = 3;
