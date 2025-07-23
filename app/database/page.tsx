"use client"

import { DatabaseTable } from "@/components/database-table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, ArrowLeft, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function DatabasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Calculator
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Database className="w-8 h-8 text-primary" />
                MySQL Database Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Comprehensive database viewer with advanced filtering, sorting, and export capabilities
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/api/stats">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Statistics
              </Button>
            </Link>
            <Link href="/MYSQL_INTEGRATION_GUIDE.md" target="_blank">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Integration Guide
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">MySQL Integration</h3>
              <p className="text-sm text-muted-foreground">Production-ready database</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Advanced Filtering</h3>
              <p className="text-sm text-muted-foreground">Search & filter data</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold">Data Export</h3>
              <p className="text-sm text-muted-foreground">JSON & CSV export</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ArrowLeft className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <h3 className="font-semibold">Bulk Operations</h3>
              <p className="text-sm text-muted-foreground">Manage multiple records</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Database Table */}
        <DatabaseTable
          title="BMI Calculator Database Records"
          description="View, filter, sort, and export all BMI calculation records stored in MySQL database"
          showAdvancedFeatures={true}
        />
      </div>
    </div>
  )
}
