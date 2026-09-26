import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

// jsdom does not provide these Web APIs; React Router needs them.
Object.assign(globalThis, { TextEncoder, TextDecoder });
