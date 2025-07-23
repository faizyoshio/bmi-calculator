"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  RefreshCw,
  Database,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Trash2,
  Eye,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { User, DatabaseTableResponse, TableFilters } from "@/types/database-table"

interface DatabaseTableProps {
  title?: string
  description?: string
  showAdvancedFeatures?: boolean
}

export function DatabaseTable({
  title = "MySQL Database Management",
  description = "Comprehensive database viewer with advanced filtering, sorting, and export capabilities",
  showAdvancedFeatures = true,
}: DatabaseTableProps) {
  // State management
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Sorting state
  const [sortBy, setSortBy] = useState("lastCalculation")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Filter state
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    category: "",
    gender: "",
  })

  // UI state
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    genders: [],
  })
  const [showFilters, setShowFilters] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  /**
   * Main data fetching function with comprehensive error handling
   */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== "")),
      })

      console.log("Fetching data with params:", params.toString())

      const response = await fetch(`/api/database?${params}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result: DatabaseTableResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || "API returned unsuccessful response")
      }

      // Update state with fetched data
      setData(result.data || [])
      setPagination(result.pagination)
      setFilterOptions(result.filters || { categories: [], genders: [] })

      // Clear selections when data changes
      setSelectedRows(new Set())

      console.log("Data fetched successfully:", {
        recordCount: result.data?.length || 0,
        totalCount: result.pagination?.totalCount || 0,
        filters: result.filters,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch database content"
      console.error("Data fetch error:", err)
      setError(errorMessage)

      toast({
        title: "Database Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.limit, sortBy, sortOrder, filters])

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  /**
   * Handle column sorting with toggle functionality
   */
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  /**
   * Handle pagination changes
   */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }))
    }
  }

  /**
   * Handle page size changes
   */
  const handleLimitChange = (newLimit: string) => {
    const limit = Number.parseInt(newLimit)
    if (limit > 0 && limit <= 100) {
      setPagination((prev) => ({
        ...prev,
        limit,
        currentPage: 1,
      }))
    }
  }

  /**
   * Handle filter changes with debouncing for search
   */
  const handleFilterChange = (key: keyof TableFilters, value: string) => {
    console.log(`Filter change: ${key} = ${value}`)
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    console.log("Clearing all filters")
    setFilters({
      search: "",
      category: "",
      gender: "",
    })
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  /**
   * Handle data export in multiple formats
   */
  const handleExport = async (format: "json" | "csv") => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        format,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== "")),
      })

      const response = await fetch(`/api/database/export?${params}`)

      if (!response.ok) {
        throw new Error("Export request failed")
      }

      if (format === "csv") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `bmi-database-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `bmi-database-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      toast({
        title: "Export Successful",
        description: `Database exported as ${format.toUpperCase()} file`,
      })
    } catch (err) {
      console.error("Export error:", err)
      toast({
        title: "Export Failed",
        description: "Failed to export database content",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  /**
   * Handle bulk delete operations
   */
  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select rows to delete",
        variant: "destructive",
      })
      return
    }

    setBulkDeleting(true)
    try {
      const response = await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_delete",
          data: { ids: Array.from(selectedRows) },
        }),
      })

      if (!response.ok) {
        throw new Error("Bulk delete failed")
      }

      const result = await response.json()

      toast({
        title: "Delete Successful",
        description: result.message || `Deleted ${selectedRows.size} records`,
      })

      // Refresh data and clear selections
      setSelectedRows(new Set())
      await fetchData()
    } catch (err) {
      console.error("Bulk delete error:", err)
      toast({
        title: "Delete Failed",
        description: "Failed to delete selected records",
        variant: "destructive",
      })
    } finally {
      setBulkDeleting(false)
    }
  }

  /**
   * Handle row selection
   */
  const handleRowSelect = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedRows)
    if (checked) {
      newSelection.add(userId)
    } else {
      newSelection.delete(userId)
    }
    setSelectedRows(newSelection)
  }

  /**
   * Handle select all rows
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map((user) => user.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  /**
   * Get BMI category styling
   */
  const getBmiCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "underweight":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "normal weight":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "overweight":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "obese":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  /**
   * Get sort icon based on current sort state
   */
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid Date"
    }
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" className="ml-2 bg-transparent" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-1" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{pagination.totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Showing</p>
                <p className="text-2xl font-bold">{data.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Page</p>
                <p className="text-2xl font-bold">{pagination.currentPage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold">{selectedRows.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters & Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search by Name</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Enter name to search..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">BMI Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange("category", value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {filterOptions.categories.map((cat: any) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={filters.gender}
                  onValueChange={(value) => handleFilterChange("gender", value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genders</SelectItem>
                    {filterOptions.genders.map((gender: any) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label} ({gender.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
                {selectedRows.size > 0 && showAdvancedFeatures && (
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkDeleting}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Selected ({selectedRows.size})
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("json")} disabled={exporting}>
                  <FileText className="w-4 h-4 mr-1" />
                  Export JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={exporting}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Data Table */}
      <Card>
        <CardContent className="p-0">
          {/* Table Controls */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Showing {data.length} of {pagination.totalCount} records
              </span>
              {selectedRows.size > 0 && <Badge variant="secondary">{selectedRows.size} selected</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="limit" className="text-sm">
                Per page:
              </Label>
              <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {showAdvancedFeatures && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={data.length > 0 && selectedRows.size === data.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all rows"
                      />
                    </TableHead>
                  )}
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("name")}
                    >
                      Name {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("gender")}
                    >
                      Gender {getSortIcon("gender")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("age")}
                    >
                      Age {getSortIcon("age")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("height")}
                    >
                      Height (cm) {getSortIcon("height")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("weight")}
                    >
                      Weight (kg) {getSortIcon("weight")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("currentBmi")}
                    >
                      BMI {getSortIcon("currentBmi")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("currentCategory")}
                    >
                      Category {getSortIcon("currentCategory")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-semibold"
                      onClick={() => handleSort("lastCalculation")}
                    >
                      Last Updated {getSortIcon("lastCalculation")}
                    </Button>
                  </TableHead>
                  <TableHead>Calculations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: pagination.limit }).map((_, index) => (
                    <TableRow key={index}>
                      {showAdvancedFeatures && (
                        <TableCell>
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                      )}
                      {Array.from({ length: 9 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showAdvancedFeatures ? 11 : 10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Database className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No records found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters or add some data</p>
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      {showAdvancedFeatures && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(user.id)}
                            onCheckedChange={(checked) => handleRowSelect(user.id, checked as boolean)}
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.gender}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.age}</TableCell>
                      <TableCell>{user.height}</TableCell>
                      <TableCell>{user.weight}</TableCell>
                      <TableCell>
                        <span className="font-mono">{user.currentBmi ? user.currentBmi.toFixed(2) : "N/A"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getBmiCategoryColor(user.currentCategory)}>{user.currentCategory}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(user.lastCalculation)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.calculationCount}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {!loading && data.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}({pagination.totalCount} total records)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevPage}
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-3 py-1 bg-muted rounded">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
