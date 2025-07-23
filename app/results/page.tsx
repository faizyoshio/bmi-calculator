"use client"

import { useEffect } from "react"

import { useState } from "react"

import { useRouter } from "next/navigation"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, TrendingUp, Target, Clock, Utensils, Activity } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Toaster } from "@/components/ui/toaster"
import Database from "lucide-react"

interface BMIResult {
  bmi: number
  category: string
  gender: string
  height: number
  weight: number
  age?: number
  healthTip: string
  color: string
}

interface PersonalizedTip {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  priority: "high" | "medium" | "low"
  category: "diet" | "exercise" | "lifestyle" | "medical"
  actionable: boolean
  completed?: boolean
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const bmi = searchParams.get("bmi")
  const category = searchParams.get("category")
  const router = useRouter()
  const { t } = useLanguage()
  const [result, setResult] = useState<BMIResult | null>(null)
  const [completedTips, setCompletedTips] = useState<Set<string>>(new Set())

  useEffect(() => {
    const storedResult = sessionStorage.getItem("bmiResult")
    if (storedResult) {
      setResult(JSON.parse(storedResult))
    } else {
      router.push("/")
    }

    // Load completed tips from localStorage
    const savedCompletedTips = localStorage.getItem("bmi-completed-tips")
    if (savedCompletedTips) {
      setCompletedTips(new Set(JSON.parse(savedCompletedTips)))
    }
  }, [router])

  const toggleTipCompletion = (tipId: string) => {
    const newCompletedTips = new Set(completedTips)
    if (completedTips.has(tipId)) {
      newCompletedTips.delete(tipId)
    } else {
      newCompletedTips.add(tipId)
    }
    setCompletedTips(newCompletedTips)
    localStorage.setItem("bmi-completed-tips", JSON.stringify(Array.from(newCompletedTips)))
  }

  const generatePersonalizedTips = (category: string, gender: string, age?: number): PersonalizedTip[] => {
    const baseAge = age || 25
    const tips: PersonalizedTip[] = []

    // BMI Category-specific tips
    switch (category.toLowerCase()) {
      case "underweight":
        tips.push(
          {
            id: "underweight-nutrition",
            title: t("tips.underweight.nutrition.title"),
            description: t("tips.underweight.nutrition.desc"),
            icon: <Utensils className="w-5 h-5" />,
            priority: "high",
            category: "diet",
            actionable: true,
          },
          {
            id: "underweight-exercise",
            title: t("tips.underweight.exercise.title"),
            description: t("tips.underweight.exercise.desc"),
            icon: <Activity className="w-5 h-5" />,
            priority: "high",
            category: "exercise",
            actionable: true,
          },
          {
            id: "underweight-meals",
            title: t("tips.underweight.meals.title"),
            description: t("tips.underweight.meals.desc"),
            icon: <Clock className="w-5 h-5" />,
            priority: "medium",
            category: "lifestyle",
            actionable: true,
          },
        )
        break

      case "normal":
        tips.push(
          {
            id: "normal-maintain",
            title: t("tips.normal.maintain.title"),
            description: t("tips.normal.maintain.desc"),
            icon: <Target className="w-5 h-5" />,
            priority: "high",
            category: "lifestyle",
            actionable: true,
          },
          {
            id: "normal-exercise",
            title: t("tips.normal.exercise.title"),
            description: t("tips.normal.exercise.desc"),
            icon: <Activity className="w-5 h-5" />,
            priority: "high",
            category: "exercise",
            actionable: true,
          },
          {
            id: "normal-hydration",
            title: t("tips.normal.hydration.title"),
            description: t("tips.normal.hydration.desc"),
            icon: <Utensils className="w-5 h-5" />,
            priority: "medium",
            category: "lifestyle",
            actionable: true,
          },
        )
        break

      case "overweight":
        tips.push(
          {
            id: "overweight-deficit",
            title: t("tips.overweight.deficit.title"),
            description: t("tips.overweight.deficit.desc"),
            icon: <Target className="w-5 h-5" />,
            priority: "high",
            category: "diet",
            actionable: true,
          },
          {
            id: "overweight-portions",
            title: t("tips.overweight.portions.title"),
            description: t("tips.overweight.portions.desc"),
            icon: <Utensils className="w-5 h-5" />,
            priority: "high",
            category: "diet",
            actionable: true,
          },
          {
            id: "overweight-cardio",
            title: t("tips.overweight.cardio.title"),
            description: t("tips.overweight.cardio.desc"),
            icon: <Activity className="w-5 h-5" />,
            priority: "medium",
            category: "exercise",
            actionable: true,
          },
        )
        break

      case "obese":
        tips.push(
          {
            id: "obese-gradual",
            title: t("tips.obese.gradual.title"),
            description: t("tips.obese.gradual.desc"),
            icon: <Target className="w-5 h-5" />,
            priority: "high",
            category: "lifestyle",
            actionable: true,
          },
          {
            id: "obese-professional",
            title: t("tips.obese.professional.title"),
            description: t("tips.obese.professional.desc"),
            icon: <Heart className="w-5 h-5" />,
            priority: "high",
            category: "medical",
            actionable: true,
          },
          {
            id: "obese-lowimpact",
            title: t("tips.obese.lowimpact.title"),
            description: t("tips.obese.lowimpact.desc"),
            icon: <Activity className="w-5 h-5" />,
            priority: "medium",
            category: "exercise",
            actionable: true,
          },
        )
        break
    }

    // Add gender-specific tips
    if (gender === "female") {
      tips.push({
        id: "female-specific",
        title: t("tips.female.title"),
        description: t("tips.female.desc"),
        icon: <Heart className="w-5 h-5" />,
        priority: "medium",
        category: "medical",
        actionable: false,
      })
    }

    // Add age-specific tips
    if (baseAge < 25) {
      tips.push({
        id: "young-adult",
        title: t("tips.youngAdult.title"),
        description: t("tips.youngAdult.desc"),
        icon: <TrendingUp className="w-5 h-5" />,
        priority: "low",
        category: "lifestyle",
        actionable: false,
      })
    } else if (baseAge > 50) {
      tips.push({
        id: "mature-adult",
        title: t("tips.matureAdult.title"),
        description: t("tips.matureAdult.desc"),
        icon: <Target className="w-5 h-5" />,
        priority: "medium",
        category: "exercise",
        actionable: true,
      })
    }

    return tips.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
        {/* Background blur elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center">
          <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-600/50 rounded-full animate-spin animate-reverse"></div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("loadingResults")}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm animate-pulse">{t("preparingInsights")}</p>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getBMIColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "underweight":
        return "text-blue-600 dark:text-blue-400"
      case "normal":
        return "text-green-600 dark:text-green-400"
      case "overweight":
        return "text-yellow-600 dark:text-yellow-400"
      case "obese":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getBMIBgColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "underweight":
        return "from-blue-500/20 to-blue-600/20"
      case "normal":
        return "from-green-500/20 to-green-600/20"
      case "overweight":
        return "from-yellow-500/20 to-yellow-600/20"
      case "obese":
        return "from-red-500/20 to-red-600/20"
      default:
        return "from-gray-500/20 to-gray-600/20"
    }
  }

  const getBMIPosition = (bmi: number) => {
    if (bmi < 18.5) return Math.min((bmi / 18.5) * 25, 25)
    if (bmi < 25) return 25 + ((bmi - 18.5) / (25 - 18.5)) * 25
    if (bmi < 30) return 50 + ((bmi - 25) / (30 - 25)) * 25
    return Math.min(75 + ((bmi - 30) / 10) * 25, 100)
  }

  const personalizedTips = generatePersonalizedTips(result.category, result.gender, result.age)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/50"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700/50"
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/50"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700/50"
    }
  }

  const getCategoryColor = (cat: string | null) => {
    switch (cat?.toLowerCase()) {
      case "underweight":
        return "text-blue-500"
      case "normal weight":
        return "text-green-500"
      case "overweight":
        return "text-yellow-500"
      case "obese":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getCategoryDescription = (cat: string | null) => {
    switch (cat?.toLowerCase()) {
      case "underweight":
        return t("underweight_desc")
      case "normal weight":
        return t("normal_weight_desc")
      case "overweight":
        return t("overweight_desc")
      case "obese":
        return t("obese_desc")
      default:
        return t("unknown_category_desc")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-gray-900 dark:to-black">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">{t("your_bmi_result")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">{t("your_bmi_is")}</p>
            <p className="text-6xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
              {bmi ? Number.parseFloat(bmi).toFixed(2) : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">{t("which_is")}</p>
            <p className={`text-4xl font-bold ${getCategoryColor(category)} mt-2`}>
              {category ? t(category.toLowerCase().replace(/\s/g, "_")) : "N/A"}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-4">{getCategoryDescription(category)}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/" passHref>
              <Button variant="outline" className="w-full sm:w-auto py-2 text-lg bg-transparent">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("recalculate_bmi")}
              </Button>
            </Link>
            <Link href="/database" passHref>
              <Button className="w-full sm:w-auto py-2 text-lg">
                <Database className="w-5 h-5 mr-2" />
                {t("view_database")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
