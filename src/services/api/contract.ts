import type { components } from './generated/api-contract';

// Response shapes come from the API contract; never redeclare them by hand.
type Schemas = components['schemas'];

export type Money = Schemas['Money'];
export type ProductSummary = Schemas['ProductSummary'];
export type ProductList = Schemas['ProductList'];
export type ProductDetail = Schemas['ProductDetail'];
export type ProductStock = Schemas['ProductStock'];
export type StockStatus = Schemas['Stock']['status'];
export type ProductImage = Schemas['Image'];
export type Department = Schemas['Department'];
export type DepartmentList = Schemas['DepartmentList'];
export type City = Schemas['City'];
export type CityList = Schemas['CityList'];
export type ProblemDetails = Schemas['ProblemDetails'];
export type FieldError = Schemas['FieldError'];
