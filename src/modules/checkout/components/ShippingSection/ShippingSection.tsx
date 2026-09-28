import { useFormContext, useWatch } from 'react-hook-form';

import { CheckboxField } from '../../../../components/molecules/CheckboxField';
import { SelectField } from '../../../../components/molecules/SelectField';
import { TextField } from '../../../../components/molecules/TextField';
import { messages } from '../../../../data/messages.es-CO';
import {
  useListCitiesQuery,
  useListDepartmentsQuery,
} from '../../../../services/api/locations.api';
import { formatPhone } from '../../../../utils/format-phone';
import type { CheckoutFormInput } from '../../schemas/checkout-form.schema';
import { normalizePhone } from '../../schemas/field-rules';
import { MAX_ADDRESS_LENGTH, MAX_NOTES_LENGTH } from '../../schemas/shipping.schema';
import { FormSection } from '../FormSection';

import styles from './ShippingSection.module.scss';

const { shipping: text } = messages.checkout;
const POSTAL_CODE_LENGTH = 6;

const toOptions = (items: readonly { code: string; name: string }[] = []) =>
  items.map(({ code, name }) => ({ value: code, label: name }));

type ShippingErrors = Partial<Record<string, { readonly message?: string }>>;

export function ShippingSection() {
  const { control, register, formState, setValue } = useFormContext<CheckoutFormInput>();
  const [departmentCode, useCustomerData, notes, fullName, phone] = useWatch({
    control,
    name: [
      'shipping.departmentCode',
      'shipping.useCustomerData',
      'shipping.notes',
      'customer.fullName',
      'customer.phone',
    ],
  });
  const departments = useListDepartmentsQuery();
  const cities = useListCitiesQuery(departmentCode, { skip: departmentCode === '' });
  // The recipient fields only exist in one branch of the schema, so errors are read by name.
  const errors = formState.errors.shipping as ShippingErrors | undefined;
  const departmentField = register('shipping.departmentCode');

  return (
    <FormSection title={text.section}>
      <SelectField
        {...departmentField}
        onChange={(event) => {
          // A city of the previous department is no longer valid.
          setValue('shipping.cityCode', '');
          void departmentField.onChange(event);
        }}
        label={text.department}
        placeholder={text.departmentPlaceholder}
        options={toOptions(departments.data?.data)}
        autoComplete="address-level1"
        error={errors?.departmentCode?.message}
      />
      <SelectField
        {...register('shipping.cityCode')}
        label={text.city}
        placeholder={text.cityPlaceholder}
        options={toOptions(cities.data?.data)}
        disabled={departmentCode === '' || !cities.data}
        autoComplete="address-level2"
        error={errors?.cityCode?.message}
      />
      <TextField
        {...register('shipping.addressLine1')}
        label={text.address}
        placeholder={text.addressPlaceholder}
        autoComplete="address-line1"
        maxLength={MAX_ADDRESS_LENGTH}
        error={errors?.addressLine1?.message}
      />
      <TextField
        {...register('shipping.addressLine2')}
        label={text.address2}
        autoComplete="address-line2"
        maxLength={MAX_ADDRESS_LENGTH}
        error={errors?.addressLine2?.message}
      />
      <TextField
        {...register('shipping.postalCode')}
        label={text.postalCode}
        autoComplete="postal-code"
        inputMode="numeric"
        maxLength={POSTAL_CODE_LENGTH}
        error={errors?.postalCode?.message}
      />
      <CheckboxField {...register('shipping.useCustomerData')} label={text.useMyData} />
      {useCustomerData ? (
        fullName.trim() !== '' && (
          <p className={styles.recipient}>
            {text.recipientSummary(fullName.trim(), formatPhone(normalizePhone(phone)))}
          </p>
        )
      ) : (
        <>
          <TextField
            {...register('shipping.recipientName')}
            label={text.recipientName}
            autoComplete="shipping name"
            error={errors?.recipientName?.message}
          />
          <TextField
            {...register('shipping.recipientPhone')}
            type="tel"
            label={text.recipientPhone}
            autoComplete="shipping tel-national"
            inputMode="tel"
            error={errors?.recipientPhone?.message}
          />
        </>
      )}
      <TextField
        {...register('shipping.notes')}
        label={text.notes}
        placeholder={text.notesPlaceholder}
        autoComplete="off"
        maxLength={MAX_NOTES_LENGTH}
        characterCount={{ current: notes.length, max: MAX_NOTES_LENGTH }}
        error={errors?.notes?.message}
      />
    </FormSection>
  );
}
