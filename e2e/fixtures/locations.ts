import type { CityList, DepartmentList } from '../../src/services/api/contract';

export const DEPARTMENTS: DepartmentList = {
  data: [
    { code: '05', name: 'Antioquia' },
    { code: '11', name: 'Bogotá, D.C.' },
  ],
  meta: { count: 2 },
};

export const CITIES: Readonly<Record<string, CityList>> = {
  '05': { data: [{ code: '05001', name: 'Medellín', zone: 'NATIONAL_MAIN' }], meta: { count: 1 } },
  '11': { data: [{ code: '11001', name: 'Bogotá, D.C.', zone: 'LOCAL' }], meta: { count: 1 } },
};
