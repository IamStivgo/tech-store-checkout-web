import { baseApi } from './base-api';
import type { CityList, DepartmentList } from './contract';

// The DIVIPOLA coverage changes with a new API release, not during a visit.
const ONE_HOUR_IN_SECONDS = 3600;

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // `void` is RTK Query's documented argument type for a query called without arguments.
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    listDepartments: build.query<DepartmentList, void>({
      query: () => 'locations/departments',
      keepUnusedDataFor: ONE_HOUR_IN_SECONDS,
    }),
    listCities: build.query<CityList, string>({
      query: (departmentCode) =>
        `locations/departments/${encodeURIComponent(departmentCode)}/cities`,
      keepUnusedDataFor: ONE_HOUR_IN_SECONDS,
    }),
  }),
});

export const { useListDepartmentsQuery, useListCitiesQuery } = locationsApi;
