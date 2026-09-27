export const messages = {
  app: {
    brand: 'Tech Store',
    skipToContent: 'Saltar al contenido',
    footer: {
      copyright: '© 2026 Tech Store',
      payments: 'Pagos con tarjeta procesados por una pasarela de pagos en modo de pruebas.',
    },
  },
  catalog: {
    title: 'Accesorios tecnológicos',
    subtitle: 'Envío a toda Colombia · Paga con tarjeta de crédito',
    error: 'No pudimos cargar los productos.',
    empty: {
      title: 'Pronto tendremos productos',
      body: 'Vuelve más tarde.',
    },
  },
  stock: {
    inStock: (units: number) => `${units} disponibles`,
    lowStock: (units: number) => `Últimas ${units}`,
    outOfStock: 'Agotado',
  },
  notFound: {
    page: {
      title: 'Página no encontrada',
      body: 'Revisa el enlace o vuelve a la tienda.',
    },
  },
  common: {
    goToStore: 'Ir a la tienda',
    retry: 'Reintentar',
  },
} as const;
