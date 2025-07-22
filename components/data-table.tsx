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
  Download,
  RefreshCw,
  Users,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { User, DataTableResponse, TableFilters } from "@/types/data-table"

interface DataTableProps {
  title?: string
  description?: string
}

export function DataTable({
  title = "BMI Calculator Data",
  description = "View and manage user BMI calculations",
}: DataTableProps) {
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [sortBy, setSortBy] = useState("lastCalculation")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    category: "",
    gender: "",
    minAge: "",
    maxAge: "",
    minBmi: "",
    maxBmi: "",
  })
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    genders: [],
  })
  const [showFilters, setShowFilters] = useState(false)
  const [exporting, setExporting] = useState(false)

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

      const response = await fetch(`/api/data?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: DataTableResponse = await response.json()

      setData(result.data)
      setPagination(result.pagination)
      setFilterOptions(result.filters)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.limit, sortBy, sortOrder, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }))
  }

  const handleLimitChange = (newLimit: string) => {
    setPagination((prev) => ({
      ...prev,
      limit: Number.parseInt(newLimit),
      currentPage: 1,
    }))
  }

  const handleFilterChange = (key: keyof TableFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      gender: "",
      minAge: "",
      maxAge: "",
      minBmi: "",
      maxBmi: "",
    })
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleExport = async (format: "json" | "csv") => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        format,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== "")),
      })

      const response = await fetch(`/api/data/export?${params}`)

      if (!response.ok) {
        throw new Error("Export failed")
      }

      if (format === "csv") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `bmi-data-${new Date().toISOString().split("T")[0]}.csv`
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
        a.download = `bmi-data-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      toast({
        title: "Export Successful",
        description: `Data exported as ${format.toUpperCase()}`,
      })
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

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

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" className="ml-2 bg-transparent" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </Button>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Name</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">BMI Category</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {filterOptions.categories.map((cat: any) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.value} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={filters.gender} onValueChange={(value) => handleFilterChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genders</SelectItem>
                    {filterOptions.genders.map((gender: any) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Age Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minAge}
                    onChange={(e) => handleFilterChange("minAge", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAge}
                    onChange={(e) => handleFilterChange("maxAge", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>BMI Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Min BMI"
                    value={filters.minBmi}
                    onChange={(e) => handleFilterChange("minBmi", e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Max BMI"
                    value={filters.maxBmi}
                    onChange={(e) => handleFilterChange("maxBmi", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("json")} disabled={exporting}>
                  <Download className="w-4 h-4 mr-1" />
                  Export JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={exporting}>
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {/* Table Controls */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {data.length} of {pagination.totalCount} results
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="limit" className="text-sm">
                Show:
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

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                      Last Calculation {getSortIcon("lastCalculation")}
                    </Button>
                  </TableHead>
                  <TableHead>Calculations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: pagination.limit }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 9 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No data found</p>
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="capitalize">{user.gender}</TableCell>
                      <TableCell>{user.age}</TableCell>
                      <TableCell>{user.height}</TableCell>
                      <TableCell>{user.weight}</TableCell>
                      <TableCell>{user.currentBmi ? user.currentBmi.toFixed(2) : "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={getBmiCategoryColor(user.currentCategory)}>{user.currentCategory}</Badge>
                      </TableCell>
                      <TableCell>{new Date(user.lastCalculation).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.calculationCount}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && data.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-2">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
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
