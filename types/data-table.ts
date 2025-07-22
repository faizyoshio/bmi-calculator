export interface User {
  id: string
  name: string
  gender: "male" | "female"
  age: number | string
  height: number
  weight: number
  currentBmi: number | null
  currentCategory: string
  lastCalculation: string
  calculationCount: number
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface FilterOptions {
  categories: Array<{ value: string; count: number }>
  genders: Array<{ value: string; label: string }>
}

export interface SortInfo {
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface DataTableResponse {
  data: User[]
  pagination: PaginationInfo
  filters: FilterOptions
  sort: SortInfo
}

export interface TableFilters {
  search: string
  category: string
  gender: string
  minAge: string
  maxAge: string
  minBmi: string
  maxBmi: string
}
