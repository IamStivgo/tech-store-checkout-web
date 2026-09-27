import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Select } from './Select';

describe('Select', () => {
  const renderSelect = (invalid = false) =>
    render(
      <Select aria-label="Tipo de documento" defaultValue="CC" invalid={invalid}>
        <option value="CC">Cédula de ciudadanía</option>
        <option value="CE">Cédula de extranjería</option>
      </Select>,
    );

  it('lets the user choose an option', async () => {
    renderSelect();

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de documento' }),
      'CE',
    );

    expect(screen.getByRole('combobox', { name: 'Tipo de documento' })).toHaveValue('CE');
  });

  it('is marked invalid for assistive technology', () => {
    renderSelect(true);

    expect(screen.getByRole('combobox', { name: 'Tipo de documento' })).toBeInvalid();
  });
});
