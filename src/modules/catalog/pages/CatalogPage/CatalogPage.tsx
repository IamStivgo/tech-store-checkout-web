import { generatePath } from 'react-router';

import { Icon } from '../../../../components/atoms/Icon';
import { Banner } from '../../../../components/molecules/Banner';
import { ProductCard, ProductCardSkeleton } from '../../../../components/organisms/ProductCard';
import { ProductGrid } from '../../../../components/organisms/ProductGrid';
import { ROUTES } from '../../../../config/routes';
import { messages } from '../../../../data/messages.es-CO';
import type { ProductSummary } from '../../../../services/api/contract';
import { useListProductsQuery } from '../../../../services/api/products.api';

import styles from './CatalogPage.module.scss';

const SKELETON_CARDS = 4;

const stockLabel = ({ status, available }: ProductSummary['stock']): string => {
  if (status === 'OUT_OF_STOCK') {
    return messages.stock.outOfStock;
  }
  return status === 'LOW_STOCK'
    ? messages.stock.lowStock(available)
    : messages.stock.inStock(available);
};

// Cards visible without scrolling on phones and tablets: their images load first.
const ABOVE_THE_FOLD_CARDS = 2;

function CatalogContent() {
  const { data, isLoading, isError, refetch } = useListProductsQuery();

  if (isLoading) {
    return (
      <ProductGrid busy label={messages.catalog.title}>
        {Array.from({ length: SKELETON_CARDS }, (_, index) => (
          <li key={index}>
            <ProductCardSkeleton />
          </li>
        ))}
      </ProductGrid>
    );
  }

  if (isError || !data) {
    return (
      <Banner
        variant="danger"
        action={{
          label: messages.common.retry,
          onClick: () => {
            void refetch();
          },
        }}
      >
        {messages.catalog.error}
      </Banner>
    );
  }

  if (data.data.length === 0) {
    return (
      <div className={styles.empty}>
        <Icon name="package" size={48} className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>{messages.catalog.empty.title}</h2>
        <p className={styles.emptyBody}>{messages.catalog.empty.body}</p>
      </div>
    );
  }

  return (
    <ProductGrid label={messages.catalog.title}>
      {data.data.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            href={generatePath(ROUTES.product, { productId: product.id })}
            name={product.name}
            priceInCents={product.price.amountInCents}
            image={product.image}
            stockStatus={product.stock.status}
            stockLabel={stockLabel(product.stock)}
            priority={index < ABOVE_THE_FOLD_CARDS}
          />
        </li>
      ))}
    </ProductGrid>
  );
}

export function CatalogPage() {
  return (
    <section className={styles.page} aria-labelledby="catalog-title">
      <div className={styles.header}>
        <h1 id="catalog-title" className={styles.title}>
          {messages.catalog.title}
        </h1>
        <p className={styles.subtitle}>{messages.catalog.subtitle}</p>
      </div>
      <CatalogContent />
    </section>
  );
}
