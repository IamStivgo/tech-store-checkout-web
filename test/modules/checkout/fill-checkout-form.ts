import { screen, within } from '@testing-library/react';
import type { userEvent } from '@testing-library/user-event';

type User = ReturnType<typeof userEvent.setup>;

/** Departments served in the checkout tests, with Bogotá as the delivery city. */
export const DEPARTMENTS = {
  data: [
    { code: '05', name: 'Antioquia' },
    { code: '11', name: 'Bogotá, D.C.' },
  ],
  meta: { count: 2 },
};

export const citiesOf = (code: string, name: string) => ({
  data: [{ code, name, zone: 'NATIONAL_MAIN' }],
  meta: { count: 1 },
});

export const field = (name: string | RegExp) => screen.getByLabelText(name);

export const chooseBogota = async (user: User) => {
  await screen.findByRole('option', { name: 'Antioquia' });
  await user.selectOptions(field('Departamento'), '11');
  await within(field('Municipio')).findByRole('option', { name: 'Bogotá, D.C.' });
  await user.selectOptions(field('Municipio'), '11001');
};

/** Fills the checkout form with the mockup data (copy deck §7.2 and §7.4), paying in 3 installments. */
export const fillValidCheckoutForm = async (user: User) => {
  await user.type(field('Número de tarjeta'), '4242424242424242');
  await user.type(field('Nombre del titular'), 'Ana María Gómez');
  await user.type(field('Vencimiento'), '1228');
  await user.type(field('CVC'), '123');
  await user.selectOptions(field('Cuotas'), '3');
  await user.type(field('Nombre completo'), 'Ana María Gómez');
  await user.type(field('Email'), 'Ana.Gomez@Example.com');
  await user.type(field('Celular'), '+57 300 123 4567');
  await user.type(field('Número de documento'), '1020304050');
  await chooseBogota(user);
  await user.type(field('Dirección'), 'Calle 100 # 10-20');
};
