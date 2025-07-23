"use client"

import { DatabaseTable } from "@/components/database-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function DatabasePage() {
  const router = useRouter()
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("back")}
          </Button>
          <LanguageSwitcher />
        </div>
        <DatabaseTable />
      </div>
    </div>
  )
}
