import { DataTable } from "@/components/data-table"
import { Toaster } from "@/components/ui/toaster"

export default function DataPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <DataTable
          title="BMI Calculator Database"
          description="Comprehensive view of all BMI calculations and user data"
        />
      </div>
      <Toaster />
    </div>
  )
}
