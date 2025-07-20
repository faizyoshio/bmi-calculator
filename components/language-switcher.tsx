"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/30 dark:hover:bg-white/20 text-gray-900 dark:text-white font-medium transition-all duration-300 hover:scale-105"
    >
      <Globe className="w-4 h-4 mr-2" />
      <span className="font-semibold">{language === "en" ? "EN" : "ID"}</span>
      <span className="mx-1 text-gray-400">|</span>
      <span className="text-gray-500 dark:text-gray-400">{language === "en" ? "ID" : "EN"}</span>
    </Button>
  )
}
