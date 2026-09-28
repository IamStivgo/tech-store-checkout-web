import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PayWithCardButton } from '../../../../src/components/organisms/PayWithCardButton/PayWithCardButton';

const labels = { label: 'Pagar con tarjeta de crédito', unavailableLabel: 'Agotado' };

describe('PayWithCardButton', () => {
  it('starts the payment when the product is available', async () => {
    const onClick = jest.fn();
    render(<PayWithCardButton {...labels} available onClick={onClick} />);

    await userEvent.click(screen.getByRole('button', { name: 'Pagar con tarjeta de crédito' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and says why when the product is sold out', () => {
    render(<PayWithCardButton {...labels} available={false} onClick={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled();
  });
});
