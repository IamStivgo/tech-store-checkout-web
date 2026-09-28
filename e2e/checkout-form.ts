import type { Locator } from '@playwright/test';

/** Fills the checkout form with the mockup data; the card decides the fake payment result. */
export const fillCheckoutForm = async (dialog: Locator, cardNumber = '4242424242424242') => {
  await dialog.getByLabel('Número de tarjeta').fill(cardNumber);
  await dialog.getByLabel('Nombre del titular').fill('Ana María Gómez');
  await dialog.getByLabel('Vencimiento').fill('1228');
  await dialog.getByLabel('CVC').fill('123');
  await dialog.getByLabel('Nombre completo').fill('Ana María Gómez');
  await dialog.getByLabel('Email').fill('ana.gomez@example.com');
  await dialog.getByLabel('Celular').fill('3001234567');
  await dialog.getByLabel('Número de documento').fill('1020304050');
  await dialog.getByLabel('Departamento').selectOption('11');
  await dialog.getByLabel('Municipio').selectOption('11001');
  await dialog.getByLabel('Dirección').fill('Calle 100 # 10-20');
};
