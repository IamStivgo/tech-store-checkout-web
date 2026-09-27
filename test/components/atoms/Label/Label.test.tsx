import { render, screen } from '@testing-library/react';

import { Label } from '../../../../src/components/atoms/Label/Label';

describe('Label', () => {
  it('names the control it points to', () => {
    render(
      <>
        <Label htmlFor="email">Correo electrónico</Label>
        <input id="email" />
      </>,
    );

    expect(screen.getByRole('textbox', { name: 'Correo electrónico' })).toBeInTheDocument();
  });
});
