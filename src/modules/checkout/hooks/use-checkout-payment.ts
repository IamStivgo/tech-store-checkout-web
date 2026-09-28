import { useState } from 'react';

import type { ApiError } from '../../../services/api/api-error';
import type {
  AcceptanceTokens,
  CreateCustomerRequest,
  ShippingAddressRequest,
  Transaction,
} from '../../../services/api/contract';
import {
  useCreateCustomerMutation,
  useCreateTransactionMutation,
  usePayTransactionMutation,
} from '../../../services/api/payments.api';
import type { CustomerFormValues } from '../schemas/customer.schema';
import type { ShippingFormValues } from '../schemas/shipping.schema';
import type { CheckoutDetails } from '../store/checkout.slice';

export interface CheckoutPaymentRequest {
  readonly productId: string;
  readonly quantity: number;
  readonly details: CheckoutDetails;
  readonly cardToken: string;
  readonly acceptance: AcceptanceTokens;
}

export type CheckoutPaymentResult =
  | { readonly ok: true; readonly transaction: Transaction }
  | {
      readonly ok: false;
      readonly error: ApiError;
      /** Set when the transaction was created: its payment may still be processed. */
      readonly transactionId?: string;
    };

const toCustomerRequest = ({
  fullName,
  email,
  phone,
  legalIdType,
  legalId,
}: CustomerFormValues): CreateCustomerRequest => ({ fullName, email, phone, legalIdType, legalId });

// Optional fields left empty are not sent: the API validates them when present.
const optional = (key: string, value: string | undefined) => (value ? { [key]: value } : {});

export const toShippingAddress = (
  customer: CustomerFormValues,
  shipping: ShippingFormValues,
): ShippingAddressRequest => ({
  recipientName: shipping.useCustomerData ? customer.fullName : shipping.recipientName,
  phone: shipping.useCustomerData ? customer.phone : shipping.recipientPhone,
  addressLine1: shipping.addressLine1,
  departmentCode: shipping.departmentCode,
  cityCode: shipping.cityCode,
  ...optional('addressLine2', shipping.addressLine2),
  ...optional('postalCode', shipping.postalCode),
  ...optional('notes', shipping.notes),
});

/**
 * Creates the customer and the transaction (which reserves the stock) and pays it with the card
 * token. Every attempt uses new idempotency keys and the fresh, single-use acceptance tokens.
 */
export function useCheckoutPayment(
  /** Called once the transaction exists, before its payment is sent (to recover it on reload). */
  onTransactionCreated: (transactionId: string) => void = () => undefined,
  newKey: () => string = () => crypto.randomUUID(),
) {
  const [createCustomer] = useCreateCustomerMutation();
  const [createTransaction] = useCreateTransactionMutation();
  const [payTransaction] = usePayTransactionMutation();
  const [paying, setPaying] = useState(false);

  const pay = async ({
    productId,
    quantity,
    details,
    cardToken,
    acceptance,
  }: CheckoutPaymentRequest): Promise<CheckoutPaymentResult> => {
    setPaying(true);
    let transactionId: string | undefined;
    try {
      const customer = await createCustomer({
        idempotencyKey: newKey(),
        body: toCustomerRequest(details.customer),
      }).unwrap();
      const transaction = await createTransaction({
        idempotencyKey: newKey(),
        body: {
          productId,
          quantity,
          customerId: customer.id,
          shippingAddress: toShippingAddress(details.customer, details.shipping),
        },
      }).unwrap();
      transactionId = transaction.id;
      onTransactionCreated(transaction.id);
      const paid = await payTransaction({
        transactionId: transaction.id,
        idempotencyKey: newKey(),
        body: {
          cardToken,
          installments: details.installments,
          acceptanceToken: acceptance.endUserPolicy.acceptanceToken,
          personalDataAuthToken: acceptance.personalDataAuth.acceptanceToken,
        },
      }).unwrap();
      return { ok: true, transaction: paid };
    } catch (error) {
      return { ok: false, error: error as ApiError, transactionId };
    } finally {
      setPaying(false);
    }
  };

  return { pay, paying };
}
