import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useMemo, useRef } from 'react';
import { FormProvider, useForm, type DeepPartial } from 'react-hook-form';

import { Button } from '../../../../components/atoms/Button';
import { Banner } from '../../../../components/molecules/Banner';
import { Modal } from '../../../../components/organisms/Modal';
import { DEFAULT_INSTALLMENTS } from '../../../../data/installments';
import { DEFAULT_LEGAL_ID_TYPE } from '../../../../data/legal-id-types';
import { messages } from '../../../../data/messages.es-CO';
import {
  createCheckoutFormSchema,
  type CheckoutFormInput,
  type CheckoutFormValues,
} from '../../schemas/checkout-form.schema';
import type { CheckoutDraft } from '../../store/checkout.slice';
import { CardSection } from '../CardSection';
import { CustomerSection } from '../CustomerSection';
import { ShippingSection } from '../ShippingSection';

import styles from './CheckoutModal.module.scss';
import { countErrors } from './count-errors';

const EMPTY_FORM: CheckoutFormInput = {
  card: { number: '', holder: '', expiry: '', cvc: '', installments: String(DEFAULT_INSTALLMENTS) },
  customer: {
    fullName: '',
    email: '',
    phone: '',
    legalIdType: DEFAULT_LEGAL_ID_TYPE,
    legalId: '',
  },
  shipping: {
    departmentCode: '',
    cityCode: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    notes: '',
    useCustomerData: true,
  },
};

// The restored draft never includes the card: it always starts empty.
const initialForm = (draft?: CheckoutDraft): CheckoutFormInput => {
  if (!draft) {
    return EMPTY_FORM;
  }
  const { useCustomerData, recipientName = '', recipientPhone = '', ...shipping } = draft.shipping;
  return {
    card: { ...EMPTY_FORM.card, installments: draft.installments },
    customer: draft.customer,
    shipping: useCustomerData
      ? { ...shipping, useCustomerData: true }
      : { ...shipping, useCustomerData: false, recipientName, recipientPhone },
  };
};

const toDraft = ({ customer, shipping, card }: DeepPartial<CheckoutFormInput>): CheckoutDraft => {
  const recipient = shipping as { recipientName?: string; recipientPhone?: string } | undefined;
  return {
    customer: { ...EMPTY_FORM.customer, ...customer },
    shipping: {
      ...EMPTY_FORM.shipping,
      ...shipping,
      useCustomerData: shipping?.useCustomerData ?? true,
      recipientName: recipient?.recipientName,
      recipientPhone: recipient?.recipientPhone,
    },
    installments: String(card?.installments ?? EMPTY_FORM.card.installments),
  };
};

export interface CheckoutModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  /** Receives the validated form; the card data must only be used to tokenize the card. */
  readonly onSubmit: (values: CheckoutFormValues) => void | Promise<void>;
  /** Clock used to reject expired cards (injectable for tests). */
  readonly now?: () => Date;
  /** Customer, delivery and installments to start with, e.g. after a reload. */
  readonly initialValues?: CheckoutDraft;
  /** The card data was lost: show why the card fields are empty. */
  readonly cardReentryRequired?: boolean;
  /** Receives what the buyer types (never the card) to keep it across reloads. */
  readonly onDraftChange?: (draft: CheckoutDraft) => void;
}

/** Step 2 of the checkout: card, customer and delivery data in one validated form. */
export function CheckoutModal({
  open,
  onClose,
  onSubmit,
  now = () => new Date(),
  initialValues,
  cardReentryRequired = false,
  onDraftChange,
}: CheckoutModalProps) {
  const formId = useId();
  const schema = useMemo(() => createCheckoutFormSchema(now), [now]);
  const form = useForm<CheckoutFormInput, unknown, CheckoutFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: initialForm(initialValues),
    // React Hook Form focuses in registration order, which differs from the visual order.
    shouldFocusError: false,
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!onDraftChange) {
      return undefined;
    }
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        onDraftChange(toDraft(values));
      },
    });
  }, [form, onDraftChange]);

  const { isSubmitted, isSubmitting, errors, submitCount } = form.formState;

  // After each submit, once React has rendered the errors (aria-invalid), focus the first one
  // in visual order: React Hook Form would focus in registration order instead.
  useEffect(() => {
    if (submitCount > 0) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [submitCount]);
  const errorCount = countErrors(errors);

  return (
    <Modal
      open={open}
      title={messages.checkout.title}
      closeLabel={messages.common.close}
      onClose={onClose}
      footer={
        <Button
          type="submit"
          form={formId}
          size="lg"
          fullWidth
          loading={isSubmitting}
          loadingText={messages.checkout.validating}
        >
          {messages.checkout.continue}
        </Button>
      }
    >
      <FormProvider {...form}>
        <form
          ref={formRef}
          id={formId}
          className={styles.form}
          noValidate
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
        >
          {isSubmitted && errorCount > 0 && (
            <Banner variant="danger">{messages.checkout.errorSummary(errorCount)}</Banner>
          )}
          <fieldset className={styles.sections} disabled={isSubmitting}>
            <CardSection reentryRequired={cardReentryRequired} />
            <CustomerSection />
            <ShippingSection />
          </fieldset>
        </form>
      </FormProvider>
    </Modal>
  );
}
