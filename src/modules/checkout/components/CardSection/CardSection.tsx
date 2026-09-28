import { useLayoutEffect, useRef, type ChangeEvent } from 'react';
import { Controller, useFormContext, type ControllerRenderProps } from 'react-hook-form';

import { CardBrandIcon } from '../../../../components/atoms/CardBrandIcon';
import { SelectField } from '../../../../components/molecules/SelectField';
import { TextField } from '../../../../components/molecules/TextField';
import { INSTALLMENTS, installmentsLabel } from '../../../../data/installments';
import { messages } from '../../../../data/messages.es-CO';
import { detectBrand, formatCardNumber, formatExpiry } from '../../../../utils/card';
import type { CheckoutFormInput } from '../../schemas/checkout-form.schema';
import { FormSection } from '../FormSection';
import rowStyles from '../FormSection/FormSection.module.scss';

const { card: text } = messages.checkout;
const INSTALLMENT_OPTIONS = INSTALLMENTS.map((count) => ({
  value: String(count),
  label: installmentsLabel(count),
}));
const MAX_FORMATTED_CARD_LENGTH = 23;
const EXPIRY_LENGTH = 5;
const CVC_LENGTH = 3;

interface CardNumberFieldProps {
  readonly field: ControllerRenderProps<CheckoutFormInput, 'card.number'>;
  readonly error?: string;
}

function CardNumberField({ field, error }: CardNumberFieldProps) {
  const input = useRef<HTMLInputElement | null>(null);
  const pendingCaret = useRef<number | null>(null);
  const brand = detectBrand(field.value.replace(/\s/g, ''));

  // Writing the formatted value moves the caret to the end. Right after React writes it, put
  // the caret back after the digit the user typed (a later frame could undo a newer move).
  useLayoutEffect(() => {
    const caret = pendingCaret.current;
    pendingCaret.current = null;
    if (caret !== null && input.current === document.activeElement) {
      input.current?.setSelectionRange(caret, caret);
    }
  }, [field.value]);

  return (
    <TextField
      {...field}
      ref={(element: HTMLInputElement | null) => {
        field.ref(element);
        input.current = element;
      }}
      label={text.number}
      placeholder={text.numberPlaceholder}
      autoComplete="cc-number"
      inputMode="numeric"
      maxLength={MAX_FORMATTED_CARD_LENGTH}
      error={error}
      suffix={<CardBrandIcon brand={brand} label={text.brand[brand]} />}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(
          event.target.value,
          event.target.selectionStart ?? undefined,
        );
        pendingCaret.current = formatted.caret;
        field.onChange(formatted.value);
      }}
    />
  );
}

export function CardSection() {
  const { control, register, formState } = useFormContext<CheckoutFormInput>();
  const errors = formState.errors.card;

  return (
    <FormSection title={text.section}>
      <Controller
        control={control}
        name="card.number"
        render={({ field }) => <CardNumberField field={field} error={errors?.number?.message} />}
      />
      <TextField
        {...register('card.holder')}
        label={text.holder}
        placeholder={text.holderPlaceholder}
        autoComplete="cc-name"
        error={errors?.holder?.message}
      />
      <div className={rowStyles.row}>
        <Controller
          control={control}
          name="card.expiry"
          render={({ field }) => (
            <TextField
              {...field}
              label={text.expiry}
              placeholder={text.expiryPlaceholder}
              autoComplete="cc-exp"
              inputMode="numeric"
              maxLength={EXPIRY_LENGTH}
              error={errors?.expiry?.message}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                field.onChange(formatExpiry(event.target.value));
              }}
            />
          )}
        />
        <TextField
          {...register('card.cvc')}
          label={text.cvc}
          placeholder={text.cvcPlaceholder}
          hint={text.cvcHint}
          autoComplete="cc-csc"
          inputMode="numeric"
          maxLength={CVC_LENGTH}
          error={errors?.cvc?.message}
        />
      </div>
      <SelectField
        {...register('card.installments')}
        label={text.installments}
        options={INSTALLMENT_OPTIONS}
        autoComplete="off"
      />
    </FormSection>
  );
}
