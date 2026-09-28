/** Replaces fetch with a queue of canned responses and records every request. */
export const stubFetch = () => {
  const spy = jest.spyOn(globalThis, 'fetch');

  return {
    respondJson: (body: unknown, status = 200, contentType = 'application/json') => {
      spy.mockResolvedValueOnce(
        new Response(JSON.stringify(body), { status, headers: { 'Content-Type': contentType } }),
      );
    },
    failNetwork: () => {
      spy.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    },
    requestUrls: () => spy.mock.calls.map(([input]) => (input as Request).url),
    restore: () => {
      spy.mockRestore();
    },
  };
};
