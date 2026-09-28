/** Privacy policy of the store (Colombian personal data law, Ley 1581 de 2012). */
export const privacyPolicy = {
  title: 'Política de privacidad',
  updated: 'Última actualización: 28 de septiembre de 2026',
  intro:
    'Tech Store es una tienda de demostración: los pagos se hacen en el ambiente de pruebas de una pasarela de pagos y no se cobra dinero real. Esta política explica qué datos usamos y para qué.',
  sections: [
    {
      title: 'Qué datos recogemos',
      paragraphs: [
        'Para procesar una compra pedimos tu nombre, correo, celular, tipo y número de documento, y la dirección de entrega (y, si es otra persona, el nombre y el celular de quien recibe).',
        'No guardamos el número de la tarjeta ni el código de seguridad: se cifran en tu navegador y los recibe directamente la pasarela de pagos, que nos devuelve un token. Solo conservamos la marca y los últimos cuatro dígitos.',
      ],
    },
    {
      title: 'Para qué los usamos',
      paragraphs: [
        'Usamos tus datos solo para procesar el pago, asignar y hacer seguimiento a la entrega, y atender reclamos sobre esa compra. No los usamos para publicidad ni los vendemos.',
      ],
    },
    {
      title: 'Con quién los compartimos',
      paragraphs: [
        'Con la pasarela de pagos, para procesar el pago, y con el responsable de la entrega. Cada uno los usa solo para esa finalidad.',
      ],
    },
    {
      title: 'Cómo los protegemos',
      paragraphs: [
        'Todo viaja cifrado (HTTPS). Mientras completas el formulario, lo que escribes se guarda cifrado en tu navegador para no perderlo si recargas la página, y se borra a los 30 minutos. Las respuestas del servicio muestran tus datos enmascarados.',
      ],
    },
    {
      title: 'Tus derechos',
      paragraphs: [
        'Puedes conocer, actualizar, rectificar y pedir la eliminación de tus datos, y revocar la autorización que diste al aceptar el tratamiento de datos personales, según la Ley 1581 de 2012.',
      ],
    },
  ],
  back: 'Volver a la tienda',
} as const;
