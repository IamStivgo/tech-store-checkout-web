import { Banner } from '../../../../components/molecules/Banner';
import {
  FREE_SHIPPING_THRESHOLD_IN_CENTS,
  SERVICE_FEE_IN_CENTS,
} from '../../../../config/constants';
import { messages } from '../../../../data/messages.es-CO';
import { formatCop } from '../../../../utils/format-currency';

import styles from './FeeDisclosure.module.scss';

/** Tells the buyer about the extra charges before paying (BR-09, price transparency). */
export function FeeDisclosure() {
  return (
    <Banner variant="info">
      <p className={styles.text}>{messages.product.fees(formatCop(SERVICE_FEE_IN_CENTS))}</p>
      <p className={styles.text}>
        {messages.product.freeShipping(formatCop(FREE_SHIPPING_THRESHOLD_IN_CENTS))}
      </p>
    </Banner>
  );
}
