interface Reply {
  readonly status?: number;
  readonly body: unknown;
}
type Handler = Reply | ((request: Request) => Reply);

/**
 * Answers fetch by "METHOD /path" (after /api/v1), for flows that send several requests at once.
 * An unknown route answers 500, so a missing stub shows up as an error in the UI.
 */
export const routeFetch = (routes: Record<string, Handler | readonly Handler[]>) => {
  const queues = new Map(
    Object.entries(routes).map(([route, handler]) => [
      route,
      Array.isArray(handler) ? [...(handler as Handler[])] : [handler as Handler],
    ]),
  );
  const spy = jest.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const request = input as Request;
    const path = new URL(request.url).pathname.replace('/api/v1', '');
    const queue = queues.get(`${request.method} ${path}`);
    const handler = queue && queue.length > 1 ? queue.shift() : queue?.[0];
    const reply =
      typeof handler === 'function' ? handler(request) : (handler ?? { status: 500, body: {} });
    return Promise.resolve(
      new Response(JSON.stringify(reply.body), {
        status: reply.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });
  return {
    requests: () => spy.mock.calls.map(([input]) => input as Request),
    restore: () => {
      spy.mockRestore();
    },
  };
};
