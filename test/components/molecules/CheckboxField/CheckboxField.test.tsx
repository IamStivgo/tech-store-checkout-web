import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CheckboxField } from '../../../../src/components/molecules/CheckboxField/CheckboxField';

const TERMS = {
  href: 'https://example.com/terminos.pdf',
  text: 'Leer documento',
  newTabHint: '(se abre en una pestaña nueva)',
};

describe('CheckboxField', () => {
  it('toggles from its label', async () => {
    render(<CheckboxField label="Acepto los términos y condiciones" />);

    await userEvent.click(screen.getByText('Acepto los términos y condiciones'));

    expect(
      screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
    ).toBeChecked();
  });

  it('links to the document in a new tab and says so to screen readers', () => {
    render(<CheckboxField label="Acepto los términos" link={TERMS} />);

    const link = screen.getByRole('link', {
      name: 'Leer documento (se abre en una pestaña nueva)',
    });
    expect(link).toHaveAttribute('href', TERMS.href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not toggle the checkbox when the document link is opened', async () => {
    render(<CheckboxField label="Acepto los términos" link={{ ...TERMS, href: '#terminos' }} />);

    await userEvent.click(screen.getByRole('link'));

    expect(screen.getByRole('checkbox', { name: 'Acepto los términos' })).not.toBeChecked();
  });

  it('shows the error and marks the checkbox invalid', () => {
    render(<CheckboxField label="Acepto los términos" error="Debes aceptar para continuar" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Acepto los términos' });
    expect(checkbox).toBeInvalid();
    expect(checkbox).toHaveAccessibleDescription('Debes aceptar para continuar');
  });
});
