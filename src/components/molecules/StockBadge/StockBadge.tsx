import { Badge, type BadgeTone } from '../../atoms/Badge';
import type { IconName } from '../../atoms/Icon';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface StockBadgeProps {
  readonly status: StockStatus;
  /** Text from the copy deck, e.g. "30 disponibles", "Últimas 3" or "Agotado". */
  readonly label: string;
}

const APPEARANCE: Readonly<Record<StockStatus, { tone: BadgeTone; icon: IconName }>> = {
  IN_STOCK: { tone: 'success', icon: 'check-circle' },
  LOW_STOCK: { tone: 'warning', icon: 'alert-triangle' },
  OUT_OF_STOCK: { tone: 'danger', icon: 'x-circle' },
};

export function StockBadge({ status, label }: StockBadgeProps) {
  const { tone, icon } = APPEARANCE[status];

  return (
    <Badge tone={tone} icon={icon}>
      {label}
    </Badge>
  );
}
