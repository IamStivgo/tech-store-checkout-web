import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';

import { useModalBehavior } from '../../src/hooks/use-modal-behavior';

function EmptyDialog({ onClose }: { readonly onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useModalBehavior(true, ref, onClose);

  return <div ref={ref} role="dialog" aria-label="Sin controles" tabIndex={-1} />;
}

describe('useModalBehavior', () => {
  it('focuses the dialog itself when it has no focusable content', () => {
    render(<EmptyDialog onClose={jest.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Sin controles' })).toHaveFocus();
  });

  it('keeps focus on the dialog when Tab has nowhere to go', async () => {
    render(<EmptyDialog onClose={jest.fn()} />);

    await userEvent.tab();

    expect(screen.getByRole('dialog', { name: 'Sin controles' })).toHaveFocus();
  });

  it('ignores other keys', async () => {
    const onClose = jest.fn();
    render(<EmptyDialog onClose={onClose} />);

    await userEvent.keyboard('a');

    expect(onClose).not.toHaveBeenCalled();
  });
});
