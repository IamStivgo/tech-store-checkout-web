import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useMemo, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

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

export interface CheckoutModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  /** Receives the validated form; the card data must only be used to tokenize the card. */
  readonly onSubmit: (values: CheckoutFormValues) => void | Promise<void>;
  /** Clock used to reject expired cards (injectable for tests). */
  readonly now?: () => Date;
}

/** Step 2 of the checkout: card, customer and delivery data in one validated form. */
export function CheckoutModal({
  open,
  onClose,
  onSubmit,
  now = () => new Date(),
}: CheckoutModalProps) {
  const formId = useId();
  const schema = useMemo(() => createCheckoutFormSchema(now), [now]);
  const form = useForm<CheckoutFormInput, unknown, CheckoutFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: EMPTY_FORM,
    // React Hook Form focuses in registration order, which differs from the visual order.
    shouldFocusError: false,
  });
  const formRef = useRef<HTMLFormElement>(null);

  const focusFirstInvalidField = () => {
    // Runs after React renders the errors, when the fields carry aria-invalid.
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  };
  const { isSubmitted, isSubmitting, errors } = form.formState;
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
          onSubmit={(event) => void form.handleSubmit(onSubmit, focusFirstInvalidField)(event)}
        >
          {isSubmitted && errorCount > 0 && (
            <Banner variant="danger">{messages.checkout.errorSummary(errorCount)}</Banner>
          )}
          <fieldset className={styles.sections} disabled={isSubmitting}>
            <CardSection />
            <CustomerSection />
            <ShippingSection />
          </fieldset>
        </form>
      </FormProvider>
    </Modal>
  );
}
