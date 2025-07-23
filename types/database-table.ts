export interface User {
  id: string
  name: string
  gender: "male" | "female" | "unknown"
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
  genders: Array<{ value: string; label: string; count: number }>
}

export interface SortInfo {
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface DatabaseTableResponse {
  data: User[]
  pagination: PaginationInfo
  filters: FilterOptions
  sort: SortInfo
  debug?: {
    appliedFilters: any
    genderStatsRaw: any[]
    totalRecords: number
  }
}

export interface TableFilters {
  search: string
  category: string
  gender: string
}
