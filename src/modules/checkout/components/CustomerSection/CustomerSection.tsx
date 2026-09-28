import { useFormContext } from 'react-hook-form';

import { SelectField } from '../../../../components/molecules/SelectField';
import { TextField } from '../../../../components/molecules/TextField';
import { LEGAL_ID_TYPE_LABELS, LEGAL_ID_TYPES } from '../../../../data/legal-id-types';
import { messages } from '../../../../data/messages.es-CO';
import type { CheckoutFormInput } from '../../schemas/checkout-form.schema';
import { FormSection } from '../FormSection';
import rowStyles from '../FormSection/FormSection.module.scss';

const { customer: text } = messages.checkout;
const LEGAL_ID_TYPE_OPTIONS = LEGAL_ID_TYPES.map((type) => ({
  value: type,
  label: LEGAL_ID_TYPE_LABELS[type],
}));
const NUMERIC_LEGAL_ID_TYPES: readonly string[] = ['CC', 'NIT'];

export function CustomerSection() {
  const { register, formState, watch } = useFormContext<CheckoutFormInput>();
  const errors = formState.errors.customer;
  const legalIdType = watch('customer.legalIdType');

  return (
    <FormSection title={text.section}>
      <TextField
        {...register('customer.fullName')}
        label={text.fullName}
        placeholder={text.fullNamePlaceholder}
        autoComplete="name"
        error={errors?.fullName?.message}
      />
      <TextField
        {...register('customer.email')}
        type="email"
        label={text.email}
        placeholder={text.emailPlaceholder}
        autoComplete="email"
        inputMode="email"
        error={errors?.email?.message}
      />
      <TextField
        {...register('customer.phone')}
        type="tel"
        label={text.phone}
        placeholder={text.phonePlaceholder}
        autoComplete="tel-national"
        inputMode="tel"
        error={errors?.phone?.message}
      />
      <div className={rowStyles.documentRow}>
        <SelectField
          {...register('customer.legalIdType')}
          label={text.legalIdType}
          options={LEGAL_ID_TYPE_OPTIONS}
          autoComplete="off"
          error={errors?.legalIdType?.message}
        />
        <TextField
          {...register('customer.legalId')}
          label={text.legalId}
          autoComplete="off"
          inputMode={NUMERIC_LEGAL_ID_TYPES.includes(legalIdType) ? 'numeric' : 'text'}
          error={errors?.legalId?.message}
        />
      </div>
    </FormSection>
  );
}
