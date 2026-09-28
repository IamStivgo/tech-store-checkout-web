import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Banner } from '../../../../src/components/molecules/Banner/Banner';

describe('Banner', () => {
  it.each(['info', 'success', 'warning'] as const)(
    'announces the %s variant politely as a status',
    (variant) => {
      render(<Banner variant={variant}>Se suman tarifa de servicio y envío.</Banner>);

      expect(screen.getByRole('status')).toHaveTextContent('Se suman tarifa de servicio y envío.');
    },
  );

  it('interrupts with an alert for errors', () => {
    render(
      <Banner variant="danger" title="Pago rechazado">
        Revisa los datos de la tarjeta.
      </Banner>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Pago rechazadoRevisa los datos de la tarjeta.',
    );
  });

  it('offers an optional action', async () => {
    const onClick = jest.fn();
    render(
      <Banner variant="warning" action={{ label: 'Reintentar', onClick }}>
        Sin conexión.
      </Banner>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
