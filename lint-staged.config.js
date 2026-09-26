export default {
  '*.{ts,tsx,js}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.scss': ['stylelint --fix', 'prettier --write'],
  '*.{json,md,html,yml,yaml}': 'prettier --write',
};
