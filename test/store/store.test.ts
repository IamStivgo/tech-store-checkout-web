import { baseApi } from '../../src/services/api/base-api';
import { createAppStore } from '../../src/store/store';

describe('createAppStore', () => {
  it('registers the RTK Query API state', () => {
    const store = createAppStore();

    expect(store.getState()).toHaveProperty(baseApi.reducerPath);
  });
});
