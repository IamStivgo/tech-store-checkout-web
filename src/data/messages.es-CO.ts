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
    inStockDetail: (units: number) => `En stock · ${units} unidades`,
    lowStockDetail: (units: number) => `Últimas ${units} unidades`,
    outOfStock: 'Agotado',
  },
  product: {
    back: 'Tienda',
    vatIncluded: 'IVA incluido',
    quantity: 'Cantidad',
    decreaseQuantity: 'Disminuir cantidad',
    increaseQuantity: 'Aumentar cantidad',
    quantityMax: (units: number) => `Máximo ${units} por pedido`,
    fees: (serviceFee: string) =>
      `Se suman ${serviceFee} de tarifa de servicio y el envío según tu ciudad.`,
    freeShipping: (threshold: string) =>
      `Envío gratis en compras desde ${threshold} (excepto trayectos especiales).`,
    payWithCard: 'Pagar con tarjeta de crédito',
    soldOut: 'Agotado',
    error: 'No pudimos cargar el producto.',
  },
  notFound: {
    page: {
      title: 'Página no encontrada',
      body: 'Revisa el enlace o vuelve a la tienda.',
    },
    product: {
      title: 'Producto no encontrado',
      body: 'Es posible que el enlace esté incompleto o que el producto ya no esté disponible.',
    },
  },
  common: {
    goToStore: 'Ir a la tienda',
    retry: 'Reintentar',
  },
} as const;
