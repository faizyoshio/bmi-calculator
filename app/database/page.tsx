"use client"

import { DatabaseTable } from "@/components/database-table"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

export default function DatabasePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            {"Back"}
          </Button>
          {/* You can add other elements here if needed, like a title or filters */}
        </div>
        <DatabaseTable
          title="Database Content Viewer"
          description="Browse, filter, and export BMI calculation records from the database"
        />
      </div>
      <Toaster />
    </div>
  )
}
