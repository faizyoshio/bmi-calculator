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
  createdAt?: string
  calculationCount: number
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
  offset?: number
}

export interface FilterOptions {
  categories: Array<{ value: string; label?: string; count: number }>
  genders: Array<{ value: string; label: string; count: number }>
}

export interface SortInfo {
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface DatabaseTableResponse {
  success: boolean
  data: User[]
  pagination: PaginationInfo
  filters: FilterOptions
  sort: SortInfo
  metadata?: {
    queryExecutionTime: number
    appliedFilters: any
    totalRecordsInDatabase: number
  }
  error?: string
}

export interface TableFilters {
  search: string
  category: string
  gender: string
}

export interface BulkOperationRequest {
  action: "bulk_delete" | "bulk_update"
  data: {
    ids: string[]
    updates?: Partial<User>
  }
}

export interface ExportOptions {
  format: "json" | "csv"
  includeHistory?: boolean
  dateRange?: {
    start: string
    end: string
  }
}
