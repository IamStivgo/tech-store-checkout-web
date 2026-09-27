export const LEGAL_ID_TYPES = ['CC', 'CE', 'NIT', 'PP'] as const;

export type LegalIdType = (typeof LEGAL_ID_TYPES)[number];

/** Preselected in the form: most buyers pay with their citizenship card. */
export const DEFAULT_LEGAL_ID_TYPE: LegalIdType = 'CC';

export const LEGAL_ID_TYPE_LABELS: Readonly<Record<LegalIdType, string>> = {
  CC: 'Cédula de ciudadanía (CC)',
  CE: 'Cédula de extranjería (CE)',
  NIT: 'NIT',
  PP: 'Pasaporte (PP)',
};
