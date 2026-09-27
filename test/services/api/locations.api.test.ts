import { locationsApi } from '../../../src/services/api/locations.api';
import { createAppStore } from '../../../src/store/store';

import { stubFetch } from './fetch-stub';

describe('locationsApi', () => {
  let fetchStub: ReturnType<typeof stubFetch>;

  beforeEach(() => {
    fetchStub = stubFetch();
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('lists the departments and the cities of one of them', async () => {
    const store = createAppStore();
    const departments = { data: [{ code: '05', name: 'Antioquia' }], meta: { count: 1 } };
    const cities = {
      data: [{ code: '05001', name: 'Medellín', zone: 'NATIONAL_MAIN' }],
      meta: { count: 1 },
    };
    fetchStub.respondJson(departments);
    fetchStub.respondJson(cities);

    const departmentList = await store.dispatch(locationsApi.endpoints.listDepartments.initiate());
    const cityList = await store.dispatch(locationsApi.endpoints.listCities.initiate('05'));

    expect(departmentList.data).toEqual(departments);
    expect(cityList.data).toEqual(cities);
    expect(fetchStub.requestUrls()).toEqual([
      'http://localhost/api/v1/locations/departments',
      'http://localhost/api/v1/locations/departments/05/cities',
    ]);
  });
});
