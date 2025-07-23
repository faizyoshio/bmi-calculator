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
  RefreshCw,
  Database,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Info,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { User, DatabaseTableResponse, TableFilters } from "@/types/database-table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/lib/language-context" // Import useLanguage

interface DatabaseTableProps {
  title?: string
  description?: string
}

export function DatabaseTable({
  title = "BMI Calculator Database",
  description = "View and manage BMI calculation records stored in the database",
}: DatabaseTableProps) {
  const { t } = useLanguage() // Get translation function
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
  })
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    genders: [],
  })
  const [showFilters, setShowFilters] = useState(true) // Filters are always shown now
  const [exporting, setExporting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: DatabaseTableResponse = await response.json()

      console.log("API Response:", result)

      setData(result.data)
      setPagination(result.pagination)
      setFilterOptions(result.filters)
      setDebugInfo(result.debug)

      // Log filter options for debugging
      console.log("Filter options received:", result.filters)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("failed_to_fetch_database_content")
      setError(errorMessage)
      toast({
        title: t("database_error"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.limit, sortBy, sortOrder, filters, t])

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
    console.log(`Filter change: ${key} = ${value}`)
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const clearFilters = () => {
    console.log("Clearing all filters")
    setFilters({
      search: "",
      category: "",
      gender: "",
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

      const response = await fetch(`/api/database/export?${params}`)

      if (!response.ok) {
        throw new Error(t("database_export_failed"))
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
        title: t("export_successful"),
        description: t("data_exported_as", { format: format.toUpperCase() }),
      })
    } catch (err) {
      toast({
        title: t("export_failed"),
        description: t("failed_to_export_database_content"),
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

  const getHealthTip = (category: string) => {
    switch (category?.toLowerCase()) {
      case "underweight":
        return t("healthTips.underweight")
      case "normal weight":
        return t("healthTips.normal")
      case "overweight":
        return t("healthTips.overweight")
      case "obese":
        return t("healthTips.obese")
      default:
        return t("no_specific_health_tip")
    }
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
                {t("retry")}
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
                <Database className="w-5 h-5" />
                {t("database_title")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t("database_description")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                {t("refresh")}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Debug Info (only show in development) */}
      {debugInfo && process.env.NODE_ENV === "development" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t("debug_information")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-2">
              <div>
                <strong>{t("total_records")}:</strong> {debugInfo.totalRecords}
              </div>
              <div>
                <strong>{t("applied_filters")}:</strong> {JSON.stringify(debugInfo.appliedFilters)}
              </div>
              <div>
                <strong>{t("gender_stats")}:</strong> {JSON.stringify(debugInfo.genderStatsRaw)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && ( // This block will now always be visible
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("database_filters")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">{t("search_name")}</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder={t("search_by_name_placeholder")}
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">{t("bmi_category")}</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange("category", value === "all" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("all_categories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_categories")}</SelectItem>
                    {filterOptions.categories.map((cat: any) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {t(cat.value.toLowerCase().replace(/\s/g, "_"))} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gender">{t("gender")}</Label>
                <Select
                  value={filters.gender}
                  onValueChange={(value) => {
                    console.log("Gender select changed to:", value)
                    handleFilterChange("gender", value === "all" ? "" : value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("all_genders")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_genders")}</SelectItem>
                    {filterOptions.genders.map((gender: any) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {t(gender.label.toLowerCase())} ({gender.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={clearFilters}>
                  {t("clear_all_filters")}
                </Button>
                {/* Removed "Available genders" text */}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("json")} disabled={exporting}>
                  <FileText className="w-4 h-4 mr-1" />
                  {t("export_json")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={exporting}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  {t("export_csv")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Table */}
      <Card>
        <CardContent className="p-0">
          {/* Table Controls */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("showing_records", {
                  count: data.length,
                  total: pagination.totalCount,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="limit" className="text-sm">
                {t("records_per_page")}:
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
            <TooltipProvider>
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
                        {t("name")} {getSortIcon("name")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("gender")}
                      >
                        {t("gender")} {getSortIcon("gender")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("age")}
                      >
                        {t("age")} {getSortIcon("age")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("height")}
                      >
                        {t("height")} ({t("cm")}) {getSortIcon("height")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("weight")}
                      >
                        {t("weight")} ({t("kg")}) {getSortIcon("weight")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("currentBmi")}
                      >
                        {t("bmi")} {getSortIcon("currentBmi")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("currentCategory")}
                      >
                        {t("category")} {getSortIcon("currentCategory")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold"
                        onClick={() => handleSort("lastCalculation")}
                      >
                        {t("lastCalculation")} {getSortIcon("lastCalculation")}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: pagination.limit }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 8 }).map(
                          (
                            _,
                            cellIndex, // Adjusted colSpan from 9 to 8
                          ) => (
                            <TableCell key={cellIndex}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    ))
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        {" "}
                        {/* Adjusted colSpan from 9 to 8 */}
                        <div className="flex flex-col items-center gap-2">
                          <Database className="w-8 h-8 text-muted-foreground" />
                          <p className="text-muted-foreground">{t("no_database_records_found")}</p>
                          <Button variant="outline" size="sm" onClick={clearFilters}>
                            {t("clear_filters")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="capitalize">
                          {user.gender === "unknown" ? t("unknown") : t(user.gender)}
                        </TableCell>
                        <TableCell>{user.age === "N/A" ? "N/A" : user.age}</TableCell>
                        <TableCell>{user.height === 0 ? "N/A" : user.height}</TableCell>
                        <TableCell>{user.weight === 0 ? "N/A" : user.weight}</TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-medium">
                                {user.currentBmi ? user.currentBmi.toFixed(2) : "N/A"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>BMI: {user.currentBmi ? user.currentBmi.toFixed(2) : "N/A"}</p>
                              <p>
                                {t("category")}: {t(user.currentCategory.toLowerCase().replace(/\s/g, "_"))}
                              </p>
                              <p>
                                {t("health_tip")}: {getHealthTip(user.currentCategory)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBmiCategoryColor(user.currentCategory)}>
                            {t(user.currentCategory.toLowerCase().replace(/\s/g, "_"))}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.lastCalculation).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>

          {/* Pagination */}
          {!loading && data.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                {t("page_of_total", {
                  currentPage: pagination.currentPage,
                  totalPages: pagination.totalPages,
                })}
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
