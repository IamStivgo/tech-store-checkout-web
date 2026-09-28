import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SelectField } from '../../../../src/components/molecules/SelectField/SelectField';

const DEPARTMENTS = [
  { value: '05', label: 'Antioquia' },
  { value: '11', label: 'Bogotá, D.C.' },
];

describe('SelectField', () => {
  it('starts on the placeholder and lets the user choose', async () => {
    render(
      <SelectField
        label="Departamento"
        options={DEPARTMENTS}
        placeholder="Selecciona el departamento"
        defaultValue=""
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Departamento' });

    expect(select).toHaveDisplayValue('Selecciona el departamento');
    await userEvent.selectOptions(select, '05');
    expect(select).toHaveValue('05');
  });

  it('does not let the user pick the placeholder', () => {
    render(<SelectField label="Departamento" options={DEPARTMENTS} placeholder="Selecciona" />);

    expect(screen.getByRole('option', { name: 'Selecciona' })).toBeDisabled();
  });

  it('shows the error and marks the field invalid', () => {
    render(<SelectField label="Municipio" options={[]} error="Selecciona el municipio" />);

    const select = screen.getByRole('combobox', { name: 'Municipio' });
    expect(select).toBeInvalid();
    expect(select).toHaveAccessibleDescription('Selecciona el municipio');
  });
});
