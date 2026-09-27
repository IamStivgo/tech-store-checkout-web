import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('toggles when clicked', async () => {
    render(<Checkbox aria-label="Acepto" />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Acepto' }));

    expect(screen.getByRole('checkbox', { name: 'Acepto' })).toBeChecked();
  });

  it('is marked invalid for assistive technology', () => {
    render(<Checkbox aria-label="Acepto" invalid />);

    expect(screen.getByRole('checkbox', { name: 'Acepto' })).toBeInvalid();
  });
});
