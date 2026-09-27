import type { ChangeEvent } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

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

// Formatting moves the caret to the end; put it back after the digit the user just typed.
const keepCaret = (input: HTMLInputElement, caret: number) => {
  requestAnimationFrame(() => {
    if (document.activeElement === input) {
      input.setSelectionRange(caret, caret);
    }
  });
};

export function CardSection() {
  const { control, register, formState } = useFormContext<CheckoutFormInput>();
  const number = useWatch({ control, name: 'card.number' });
  const brand = detectBrand(number.replace(/\s/g, ''));
  const errors = formState.errors.card;

  return (
    <FormSection title={text.section}>
      <Controller
        control={control}
        name="card.number"
        render={({ field }) => (
          <TextField
            {...field}
            label={text.number}
            placeholder={text.numberPlaceholder}
            autoComplete="cc-number"
            inputMode="numeric"
            maxLength={MAX_FORMATTED_CARD_LENGTH}
            error={errors?.number?.message}
            suffix={<CardBrandIcon brand={brand} label={text.brand[brand]} />}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const formatted = formatCardNumber(
                event.target.value,
                event.target.selectionStart ?? undefined,
              );
              field.onChange(formatted.value);
              keepCaret(event.target, formatted.caret);
            }}
          />
        )}
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
