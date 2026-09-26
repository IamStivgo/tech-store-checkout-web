import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const TEST_FILES = ['**/*.test.{ts,tsx}', 'test/**/*.{ts,tsx}'];

const allowTo = (from, to) => ({
  from: { element: { type: from } },
  allow: { to: { element: { types: { anyOf: to } } } },
});

const SHARED = ['utils', 'config', 'styles', 'assets'];

export default tseslint.config(
  {
    ignores: ['dist/', 'coverage/'],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  reactHooks.configs.flat['recommended-latest'],
  jsxA11y.flatConfigs.strict,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'import/no-default-export': 'error',
      'import/no-cycle': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'no-console': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: TEST_FILES,
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'atoms', pattern: 'src/components/atoms' },
        { type: 'molecules', pattern: 'src/components/molecules' },
        { type: 'organisms', pattern: 'src/components/organisms' },
        { type: 'templates', pattern: 'src/components/templates' },
        { type: 'module', pattern: 'src/modules/*', capture: ['module'] },
        { type: 'store', pattern: 'src/store' },
        { type: 'services', pattern: 'src/services' },
        { type: 'hooks', pattern: 'src/hooks' },
        { type: 'context', pattern: 'src/context' },
        { type: 'config', pattern: 'src/config' },
        { type: 'data', pattern: 'src/data' },
        { type: 'utils', pattern: 'src/utils' },
        { type: 'styles', pattern: 'src/styles' },
        { type: 'assets', pattern: 'src/assets' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { allow: { dependency: { relationship: { to: 'internal' } } } },
            allowTo('atoms', SHARED),
            allowTo('molecules', ['atoms', 'hooks', ...SHARED]),
            allowTo('organisms', ['molecules', 'atoms', 'hooks', ...SHARED]),
            allowTo('templates', ['organisms', 'molecules', 'atoms', 'hooks', ...SHARED]),
            allowTo('module', [
              'atoms',
              'molecules',
              'organisms',
              'templates',
              'store',
              'services',
              'hooks',
              'context',
              'data',
              ...SHARED,
            ]),
            {
              from: { element: { type: 'module' } },
              allow: { to: { element: { type: 'module', fileInternalPath: 'index.ts' } } },
            },
            allowTo('store', ['services', 'module']),
            allowTo('services', ['config', 'utils']),
            allowTo('hooks', ['config', 'utils']),
            allowTo('context', ['config', 'utils']),
          ],
        },
      ],
    },
  },
  {
    files: TEST_FILES,
    ...jest.configs['flat/recommended'],
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      ...jest.configs['flat/recommended'].rules,
      ...jest.configs['flat/style'].rules,
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'error',
    },
  },
  {
    files: ['vite.config.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      'import/no-default-export': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
  prettier,
);
