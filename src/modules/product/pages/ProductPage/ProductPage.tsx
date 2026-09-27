import { Link, useParams } from 'react-router';

import { Divider } from '../../../../components/atoms/Divider';
import { Icon } from '../../../../components/atoms/Icon';
import { Price } from '../../../../components/atoms/Price';
import { Skeleton } from '../../../../components/atoms/Skeleton';
import { Banner } from '../../../../components/molecules/Banner';
import { QuantityStepper } from '../../../../components/molecules/QuantityStepper';
import { StockBadge } from '../../../../components/molecules/StockBadge';
import { PayWithCardButton } from '../../../../components/organisms/PayWithCardButton';
import { ProductGallery } from '../../../../components/organisms/ProductGallery';
import { ROUTES } from '../../../../config/routes';
import { messages } from '../../../../data/messages.es-CO';
import type { ApiError } from '../../../../services/api/api-error';
import type { ProductDetail } from '../../../../services/api/contract';
import { useGetProductQuery } from '../../../../services/api/products.api';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { cardDigits, detectBrand } from '../../../../utils/card';
import {
  CheckoutModal,
  checkoutClosed,
  checkoutStarted,
  detailsSubmitted,
  quantitySelected,
  selectCheckoutProductId,
  selectCheckoutStep,
  selectQuantityFor,
  type CheckoutFormValues,
} from '../../../checkout';
import { NotFoundPage } from '../../../not-found';
import { FeeDisclosure } from '../../components/FeeDisclosure';

import styles from './ProductPage.module.scss';

const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;

// A malformed id (400) and an unknown or inactive product (404) are the same for the buyer.
const isMissingProduct = (error: unknown): boolean => {
  const status = (error as Partial<ApiError>).status;
  return status === HTTP_NOT_FOUND || status === HTTP_BAD_REQUEST;
};

const stockDetailLabel = ({ status, available }: ProductDetail['stock']): string => {
  if (status === 'OUT_OF_STOCK') {
    return messages.stock.outOfStock;
  }
  return status === 'LOW_STOCK'
    ? messages.stock.lowStockDetail(available)
    : messages.stock.inStockDetail(available);
};

function BackToStore() {
  return (
    <Link to={ROUTES.home} className={styles.back}>
      <Icon name="chevron-left" size={20} />
      {messages.product.back}
    </Link>
  );
}

function ProductPageSkeleton() {
  return (
    <div className={styles.layout} aria-busy="true" data-testid="product-skeleton">
      <div className={styles.gallerySkeleton}>
        <Skeleton variant="rect" />
      </div>
      <div className={styles.info}>
        <Skeleton variant="text" width="80%" height="1.75rem" />
        <Skeleton variant="text" width="40%" height="1.5rem" />
        <Skeleton variant="text" width="8rem" height="1.5rem" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="90%" />
      </div>
    </div>
  );
}

const LAST_FOUR = -4;

// Only the brand and the last four digits leave the form (the card is tokenized in the browser).
const toCheckoutDetails = ({ card, customer, shipping }: CheckoutFormValues) => {
  const digits = cardDigits(card.number);
  return {
    customer,
    shipping,
    installments: card.installments,
    card: { brand: detectBrand(digits), lastFour: digits.slice(LAST_FOUR) },
  };
};

function ProductDetails({ product }: { readonly product: ProductDetail }) {
  const dispatch = useAppDispatch();
  const step = useAppSelector(selectCheckoutStep);
  const checkoutProductId = useAppSelector(selectCheckoutProductId);
  const selected = useAppSelector((state) => selectQuantityFor(state, product.id));
  const maxUnits = product.maxUnitsPerOrder;
  const available = maxUnits > 0;
  // The stock may have dropped since the quantity was chosen: never offer more than it allows.
  const quantity = available ? Math.min(selected, maxUnits) : 1;

  return (
    <div className={styles.layout}>
      <ProductGallery image={product.images[0] ?? product.image} />
      <div className={styles.info}>
        <h1 id="product-title" className={styles.name}>
          {product.name}
        </h1>
        <Price
          amountInCents={product.price.amountInCents}
          size="xl"
          note={messages.product.vatIncluded}
        />
        <div>
          <StockBadge status={product.stock.status} label={stockDetailLabel(product.stock)} />
        </div>
        <p className={styles.description}>{product.description}</p>
        <Divider />
        <QuantityStepper
          label={messages.product.quantity}
          decreaseLabel={messages.product.decreaseQuantity}
          increaseLabel={messages.product.increaseQuantity}
          value={quantity}
          max={Math.max(maxUnits, 1)}
          hint={available ? messages.product.quantityMax(maxUnits) : undefined}
          disabled={!available}
          onChange={(next) => dispatch(quantitySelected({ productId: product.id, quantity: next }))}
        />
        <FeeDisclosure />
        <PayWithCardButton
          label={messages.product.payWithCard}
          unavailableLabel={messages.product.soldOut}
          available={available}
          onClick={() => dispatch(checkoutStarted({ productId: product.id, quantity }))}
        />
      </div>
      <CheckoutModal
        open={step === 'DETAILS' && checkoutProductId === product.id}
        onClose={() => dispatch(checkoutClosed())}
        onSubmit={(values) => {
          dispatch(detailsSubmitted(toCheckoutDetails(values)));
        }}
      />
    </div>
  );
}

export function ProductPage() {
  const { productId = '' } = useParams();
  const { data: product, error, isLoading, refetch } = useGetProductQuery(productId);

  if (error && isMissingProduct(error)) {
    return <NotFoundPage variant="product" />;
  }

  return (
    <article className={styles.page} aria-labelledby={product ? 'product-title' : undefined}>
      <BackToStore />
      {isLoading && <ProductPageSkeleton />}
      {!isLoading && !product && (
        <Banner
          variant="danger"
          action={{
            label: messages.common.retry,
            onClick: () => {
              void refetch();
            },
          }}
        >
          {messages.product.error}
        </Banner>
      )}
      {product && <ProductDetails product={product} />}
    </article>
  );
}
