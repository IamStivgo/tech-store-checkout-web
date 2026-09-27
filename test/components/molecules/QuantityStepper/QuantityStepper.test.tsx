import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import {
  QuantityStepper,
  type QuantityStepperProps,
} from '../../../../src/components/molecules/QuantityStepper/QuantityStepper';

type Props = Partial<Omit<QuantityStepperProps, 'value' | 'onChange'>> & {
  readonly initial?: number;
  readonly onChange?: (value: number) => void;
};

function Stepper({ initial = 1, onChange, ...props }: Props) {
  const [value, setValue] = useState(initial);
  return (
    <QuantityStepper
      label="Cantidad"
      decreaseLabel="Disminuir cantidad"
      increaseLabel="Aumentar cantidad"
      max={5}
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const spinbutton = () => screen.getByRole('spinbutton', { name: 'Cantidad' });
const decrease = () => screen.getByRole('button', { name: 'Disminuir cantidad' });
const increase = () => screen.getByRole('button', { name: 'Aumentar cantidad' });

describe('QuantityStepper', () => {
  it('exposes the value and its limits as a labelled spin button with its hint', () => {
    render(<Stepper initial={2} hint="Máximo 5 por pedido" />);

    expect(spinbutton()).toHaveAttribute('aria-valuenow', '2');
    expect(spinbutton()).toHaveAttribute('aria-valuemin', '1');
    expect(spinbutton()).toHaveAttribute('aria-valuemax', '5');
    expect(spinbutton()).toHaveAccessibleDescription('Máximo 5 por pedido');
    expect(spinbutton()).toHaveTextContent('2');
  });

  it('changes the quantity with the − and + buttons', async () => {
    const onChange = jest.fn();
    render(<Stepper initial={2} onChange={onChange} />);

    await userEvent.click(increase());
    await userEvent.click(increase());
    await userEvent.click(decrease());

    expect(onChange.mock.calls).toEqual([[3], [4], [3]]);
    expect(spinbutton()).toHaveTextContent('3');
  });

  it('disables − at the minimum and + at the maximum', async () => {
    render(<Stepper initial={1} max={2} />);

    expect(decrease()).toBeDisabled();
    await userEvent.click(increase());

    expect(increase()).toBeDisabled();
    expect(decrease()).toBeEnabled();
  });

  it('answers to the arrow, Home and End keys and ignores other keys', async () => {
    const onChange = jest.fn();
    render(<Stepper initial={2} onChange={onChange} />);

    spinbutton().focus();
    await userEvent.keyboard('{ArrowUp}{ArrowRight}{ArrowDown}{ArrowLeft}{End}{Home}a');

    expect(onChange.mock.calls).toEqual([[3], [4], [3], [2], [5], [1]]);
  });

  it('never goes past its limits from the keyboard', async () => {
    const onChange = jest.fn();
    render(<Stepper initial={5} onChange={onChange} />);

    spinbutton().focus();
    await userEvent.keyboard('{ArrowUp}{End}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the buttons out of the tab order', async () => {
    render(<Stepper initial={2} />);

    await userEvent.tab();

    expect(spinbutton()).toHaveFocus();
    expect(increase()).toHaveAttribute('tabindex', '-1');
  });

  it('blocks every change when disabled', async () => {
    const onChange = jest.fn();
    render(<Stepper initial={2} disabled onChange={onChange} />);

    expect(decrease()).toBeDisabled();
    expect(increase()).toBeDisabled();
    expect(spinbutton()).toHaveAttribute('aria-disabled', 'true');
    expect(spinbutton()).toHaveAttribute('tabindex', '-1');

    spinbutton().focus();
    await userEvent.keyboard('{ArrowUp}');

    expect(onChange).not.toHaveBeenCalled();
  });
});
