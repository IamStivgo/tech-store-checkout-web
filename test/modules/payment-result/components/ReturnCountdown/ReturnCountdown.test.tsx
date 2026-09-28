import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';

import { ReturnCountdown } from '../../../../../src/modules/payment-result/components/ReturnCountdown';

const renderCountdown = () =>
  render(
    <MemoryRouter initialEntries={['/transactions/tx-1']}>
      <Routes>
        <Route
          path="/transactions/:id"
          element={<ReturnCountdown to="/products/p-1" seconds={3} />}
        />
        <Route path="/products/:id" element={<h1>Producto</h1>} />
      </Routes>
    </MemoryRouter>,
  );

// One second at a time: each second schedules the next one after React renders it.
const advance = async (ms: number) => {
  for (let elapsed = 0; elapsed < ms; elapsed += 1000) {
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });
  }
};

describe('ReturnCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('counts down and goes back to the product', async () => {
    renderCountdown();

    expect(screen.getByText('Volverás al producto en 3 s')).toBeInTheDocument();
    await advance(1000);
    expect(screen.getByText('Volverás al producto en 2 s')).toBeInTheDocument();
    await advance(2000);

    expect(await screen.findByRole('heading', { name: 'Producto' })).toBeInTheDocument();
  });

  it('can be paused and resumed', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderCountdown();
    await advance(1000);

    await user.click(screen.getByRole('button', { name: 'Pausar' }));
    await advance(5000);

    expect(screen.getByRole('status')).toHaveTextContent('Regreso automático en pausa');
    expect(screen.getByRole('button', { name: 'Reanudar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByRole('heading', { name: 'Producto' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reanudar' }));
    expect(screen.getByText('Volverás al producto en 2 s')).toBeInTheDocument();
    await advance(2000);

    expect(await screen.findByRole('heading', { name: 'Producto' })).toBeInTheDocument();
  });
});
