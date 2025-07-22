import { DatabaseTable } from "@/components/database-table"
import { Toaster } from "@/components/ui/toaster"

export default function DatabasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <DatabaseTable
          title="Database Content Viewer"
          description="Browse, filter, and export BMI calculation records from the database"
        />
      </div>
      <Toaster />
    </div>
  )
}
