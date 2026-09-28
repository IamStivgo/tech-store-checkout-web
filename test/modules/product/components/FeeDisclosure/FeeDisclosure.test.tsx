import { render, screen } from '@testing-library/react';

import { FeeDisclosure } from '../../../../../src/modules/product/components/FeeDisclosure/FeeDisclosure';

describe('FeeDisclosure', () => {
  it('announces the service fee, the delivery fee and the free shipping threshold', () => {
    render(<FeeDisclosure />);

    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent(
      'Se suman $ 3.000 de tarifa de servicio y el envío según tu ciudad.',
    );
    expect(notice).toHaveTextContent(
      'Envío gratis en compras desde $ 150.000 (excepto trayectos especiales).',
    );
  });
});
