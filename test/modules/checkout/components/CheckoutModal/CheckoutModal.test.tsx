import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import {
  CheckoutModal,
  type CheckoutModalProps,
} from '../../../../../src/modules/checkout/components/CheckoutModal/CheckoutModal';
import type { CheckoutFormValues } from '../../../../../src/modules/checkout/schemas/checkout-form.schema';
import type { CheckoutDraft } from '../../../../../src/modules/checkout/store/checkout.slice';
import { createAppStore } from '../../../../../src/store/store';
import { stubFetch } from '../../../../services/api/fetch-stub';
import {
  chooseBogota,
  citiesOf,
  DEPARTMENTS,
  field,
  fillValidCheckoutForm,
} from '../../fill-checkout-form';

const NOW = () => new Date(2026, 8, 24);
const renderModal = (props: Partial<CheckoutModalProps> = {}) => {
  const onSubmit = jest.fn<undefined, [CheckoutFormValues]>();
  const onClose = jest.fn();
  render(
    <Provider store={createAppStore()}>
      <CheckoutModal open onClose={onClose} onSubmit={onSubmit} now={NOW} {...props} />
    </Provider>,
  );
  return { onSubmit, onClose, user: userEvent.setup() };
};

describe('CheckoutModal', () => {
  let fetchStub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    fetchStub = stubFetch();
    fetchStub.respondJson(DEPARTMENTS);
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('shows the order with its VAT above the form when there is one', () => {
    renderModal({ order: { quantity: 1, unitPriceInCents: 11_990_000 } });

    expect(screen.getByRole('region', { name: 'Tu pedido' })).toBeInTheDocument();
  });

  it('shows no order without one', () => {
    renderModal();

    expect(screen.queryByRole('region', { name: 'Tu pedido' })).not.toBeInTheDocument();
  });

  it('shows the card, customer and delivery sections in a dialog that can be closed', async () => {
    const { onClose, user } = renderModal();

    const dialog = screen.getByRole('dialog', { name: 'Pago con tarjeta' });
    expect(within(dialog).getByRole('group', { name: 'Tarjeta' })).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: 'Tus datos' })).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: 'Entrega' })).toBeInTheDocument();
    expect(field('Cuotas')).toHaveDisplayValue('1 cuota');
    expect(field('Tipo de documento')).toHaveDisplayValue('Cédula de ciudadanía (CC)');

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('formats the card number as it is typed and shows the detected brand', async () => {
    const { user } = renderModal();
    const number = field('Número de tarjeta');

    expect(screen.getByRole('img', { name: 'Marca de la tarjeta no reconocida' })).toBeVisible();
    await user.type(number, '4242424242424242');

    expect(number).toHaveValue('4242 4242 4242 4242');
    expect(screen.getByRole('img', { name: 'Visa' })).toBeVisible();

    await user.clear(number);
    await user.type(number, '5555');
    expect(screen.getByRole('img', { name: 'Mastercard' })).toBeVisible();
  });

  it('keeps the caret after the digit typed in the middle of the number', async () => {
    const { user } = renderModal();
    const number = field('Número de tarjeta') as HTMLInputElement;
    await user.type(number, '42424242');

    await user.type(number, '9', { initialSelectionStart: 2, initialSelectionEnd: 2 });

    expect(number).toHaveValue('4294 2424 2');
    expect(number.selectionStart).toBe(3);
  });

  it('offers a text keyboard for documents with letters', async () => {
    const { user } = renderModal();

    expect(field('Número de documento')).toHaveAttribute('inputmode', 'numeric');
    await user.selectOptions(field('Tipo de documento'), 'CE');

    expect(field('Número de documento')).toHaveAttribute('inputmode', 'text');
  });

  it('adds the slash to the expiry date', async () => {
    const { user } = renderModal();

    await user.type(field('Vencimiento'), '1228');

    expect(field('Vencimiento')).toHaveValue('12/28');
  });

  it('validates a field when it loses the focus', async () => {
    const { user } = renderModal();

    await user.type(field('Email'), 'ana@');
    await user.tab();

    expect(field('Email')).toHaveAccessibleDescription('Ingresa un email válido');
    expect(field('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('lists the number of errors and focuses the first invalid field on submit', async () => {
    const { onSubmit, user } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Revisa los campos marcados (11).');
    await waitFor(() => {
      expect(field('Número de tarjeta')).toHaveFocus();
    });
    expect(field('Número de tarjeta')).toHaveAccessibleDescription('Número de tarjeta inválido');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects card brands the store does not accept', async () => {
    const { user } = renderModal();

    await user.type(field('Número de tarjeta'), '378282246310005');
    await user.tab();

    expect(field('Número de tarjeta')).toHaveAccessibleDescription(
      'Solo aceptamos VISA y MasterCard',
    );
  });

  it('enables the cities once a department is chosen and resets them when it changes', async () => {
    fetchStub.respondJson(citiesOf('11001', 'Bogotá, D.C.'));
    fetchStub.respondJson(citiesOf('05001', 'Medellín'));
    const { user } = renderModal();

    expect(field('Municipio')).toBeDisabled();
    await chooseBogota(user);
    expect(field('Municipio')).toHaveValue('11001');

    await user.selectOptions(field('Departamento'), '05');

    expect(
      await within(field('Municipio')).findByRole('option', { name: 'Medellín' }),
    ).toBeInTheDocument();
    expect(field('Municipio')).toHaveValue('');
    expect(fetchStub.requestUrls()).toEqual([
      'http://localhost/api/v1/locations/departments',
      'http://localhost/api/v1/locations/departments/11/cities',
      'http://localhost/api/v1/locations/departments/05/cities',
    ]);
  });

  it('delivers to the customer by default and asks for another recipient otherwise', async () => {
    const { user } = renderModal();

    await user.type(field('Nombre completo'), 'Ana María Gómez');
    await user.type(field('Celular'), '3001234567');
    expect(screen.getByText('Recibe: Ana María Gómez · 300 123 4567')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre de quien recibe')).not.toBeInTheDocument();

    await user.click(field('Usar mis datos para la entrega'));

    expect(field('Nombre de quien recibe')).toBeInTheDocument();
    expect(field('Teléfono de contacto')).toBeInTheDocument();
    expect(screen.queryByText(/^Recibe:/)).not.toBeInTheDocument();
  });

  it('counts the characters of the delivery notes', async () => {
    const { user } = renderModal();

    expect(screen.getByText('0/200')).toBeInTheDocument();
    await user.type(field(/Indicaciones para la entrega/), 'Portería');

    expect(screen.getByText('8/200')).toBeInTheDocument();
  });

  it('submits the validated and normalized data', async () => {
    fetchStub.respondJson(citiesOf('11001', 'Bogotá, D.C.'));
    const { onSubmit, user } = renderModal();

    await fillValidCheckoutForm(user);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      card: {
        number: '4242 4242 4242 4242',
        holder: 'ANA MARÍA GÓMEZ',
        expiry: '12/28',
        cvc: '123',
        installments: 3,
      },
      customer: {
        fullName: 'Ana María Gómez',
        email: 'ana.gomez@example.com',
        phone: '3001234567',
        legalIdType: 'CC',
        legalId: '1020304050',
      },
      shipping: {
        departmentCode: '11',
        cityCode: '11001',
        addressLine1: 'Calle 100 # 10-20',
        addressLine2: '',
        postalCode: '',
        notes: '',
        useCustomerData: true,
      },
    });
  });

  describe('after a reload', () => {
    const draft = {
      customer: {
        fullName: 'Ana María Gómez',
        email: 'ana.gomez@example.com',
        phone: '3001234567',
        legalIdType: 'CC' as const,
        legalId: '1020304050',
      },
      shipping: {
        departmentCode: '',
        cityCode: '',
        addressLine1: 'Calle 100 # 10-20',
        addressLine2: '',
        postalCode: '',
        notes: '',
        useCustomerData: false,
        recipientName: 'Luis Pérez',
        recipientPhone: '3100000000',
      },
      installments: '6',
    };

    it('starts with the saved customer, delivery and installments, but never the card', () => {
      renderModal({ initialValues: draft });

      expect(field('Email')).toHaveValue('ana.gomez@example.com');
      expect(field('Dirección')).toHaveValue('Calle 100 # 10-20');
      expect(field('Nombre de quien recibe')).toHaveValue('Luis Pérez');
      expect(field('Cuotas')).toHaveDisplayValue('6 cuotas');
      expect(field('Número de tarjeta')).toHaveValue('');
    });

    it('keeps the delivery to the customer when that was chosen', () => {
      renderModal({
        initialValues: { ...draft, shipping: { ...draft.shipping, useCustomerData: true } },
      });

      expect(field('Usar mis datos para la entrega')).toBeChecked();
      expect(screen.queryByLabelText('Nombre de quien recibe')).not.toBeInTheDocument();
    });

    it('explains why the card has to be typed again', () => {
      renderModal({ cardReentryRequired: true });

      expect(
        within(screen.getByRole('group', { name: 'Tarjeta' })).getByRole('status'),
      ).toHaveTextContent('Por seguridad, ingresa de nuevo los datos de tu tarjeta.');
    });

    it('reports what the buyer types, without the card', async () => {
      const onDraftChange = jest.fn<undefined, [CheckoutDraft]>();
      const { user } = renderModal({ onDraftChange });

      await user.type(field('Email'), 'a');
      await user.type(field('Número de tarjeta'), '4');

      const last = onDraftChange.mock.lastCall?.[0];
      expect(last).toMatchObject({ customer: { email: 'a' }, installments: '1' });
      expect(JSON.stringify(last)).not.toContain('"number"');
    });
  });
});
