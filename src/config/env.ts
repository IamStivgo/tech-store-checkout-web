import { readTokenizationConfig } from './tokenization-config';

/** Build-time settings; the only module that reads import.meta.env. */
export const tokenizationConfig = readTokenizationConfig(import.meta.env);
