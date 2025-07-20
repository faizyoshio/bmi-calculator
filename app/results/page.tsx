"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, TrendingUp, Target, Clock, Utensils, Activity, CheckCircle, Printer } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/language-context"

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
  const router = useRouter()
  const { t, language } = useLanguage()
  const [result, setResult] = useState<BMIResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [completedTips, setCompletedTips] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const storedResult = sessionStorage.getItem("bmiResult")
    if (storedResult) {
      setResult(JSON.parse(storedResult))
      // Animate progress bar
      setTimeout(() => setProgress(100), 500)
    } else {
      router.push("/")
    }

    // Load completed tips from localStorage
    const savedCompletedTips = localStorage.getItem("bmi-completed-tips")
    if (savedCompletedTips) {
      setCompletedTips(new Set(JSON.parse(savedCompletedTips)))
    }
  }, [router])

  const handlePrint = () => {
    window.print()
  }

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

    // Common tips based on BMI category
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
        icon: <TrendingUp className="w-3 h-3" />,
        priority: "low",
        category: "lifestyle",
        actionable: false,
      })
    } else if (baseAge > 50) {
      tips.push({
        id: "mature-adult",
        title: t("tips.matureAdult.title"),
        description: t("tips.matureAdult.desc"),
        icon: <Target className="w-3 h-3" />,
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
  const filteredTips =
    selectedCategory === "all" ? personalizedTips : personalizedTips.filter((tip) => tip.category === selectedCategory)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "diet":
        return <Utensils className="w-4 h-4" />
      case "exercise":
        return <Activity className="w-4 h-4" />
      case "lifestyle":
        return <Clock className="w-4 h-4" />
      case "medical":
        return <Heart className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      {/* Background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50 no-print">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/30 dark:hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">{t("yourResult")}</h1>
          </div>

          {/* Print Action */}
          <div className="no-print">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              className="bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/30 dark:hover:bg-white/20"
              title={t("printReport")}
            >
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* BMI Score Card */}
        <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mb-6">
          <CardContent className="p-6 text-center">
            <div
              className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${getBMIBgColor(result.category)} backdrop-blur-xl rounded-full mb-4 border border-white/20`}
            >
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{result.bmi.toFixed(1)}</span>
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${getBMIColor(result.category)}`}>
              {t(result.category.toLowerCase())}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{t("bodyMassIndex")}</p>
          </CardContent>
        </Card>

        {/* BMI Range Indicator */}
        <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("bmiRange")}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{t("underweight")}</span>
                <span>{t("normal")}</span>
                <span>{t("overweight")}</span>
                <span>{t("obese")}</span>
              </div>
              <div className="relative h-3 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 w-3 h-3 bg-white border-2 border-gray-800 dark:border-white rounded-full transform -translate-x-1/2 transition-all duration-1000 ease-out shadow-lg"
                  style={{ left: `${getBMIPosition(result.bmi)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{"<18.5"}</span>
                <span>18.5-24.9</span>
                <span>25-29.9</span>
                <span>{"≥30"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Tip Card */}
        <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("healthInsight")}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {t(`healthTips.${result.category.toLowerCase()}`)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Personalized Tips Section */}
        <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {t("personalizedTips")}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {completedTips.size}/{personalizedTips.length} {t("completed")}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="whitespace-nowrap text-xs"
              >
                {t("allCategories")}
              </Button>
              <Button
                variant={selectedCategory === "diet" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("diet")}
                className="whitespace-nowrap text-xs flex items-center gap-1"
              >
                <Utensils className="w-3 h-3" />
                {t("diet")}
              </Button>
              <Button
                variant={selectedCategory === "exercise" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("exercise")}
                className="whitespace-nowrap text-xs flex items-center gap-1"
              >
                <Activity className="w-3 h-3" />
                {t("exercise")}
              </Button>
              <Button
                variant={selectedCategory === "lifestyle" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("lifestyle")}
                className="whitespace-nowrap text-xs flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                {t("lifestyle")}
              </Button>
            </div>

            {/* Tips List */}
            <div className="space-y-3">
              {filteredTips.map((tip, index) => (
                <div
                  key={tip.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    completedTips.has(tip.id)
                      ? "bg-green-50/50 border-green-200/50 dark:bg-green-900/20 dark:border-green-700/50"
                      : "bg-white/30 dark:bg-white/10 border-white/20 hover:bg-white/40 dark:hover:bg-white/15"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          completedTips.has(tip.id)
                            ? "bg-green-500 text-white"
                            : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {completedTips.has(tip.id) ? <CheckCircle className="w-4 h-4" /> : tip.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4
                          className={`font-medium text-sm ${
                            completedTips.has(tip.id)
                              ? "text-green-800 dark:text-green-200 line-through"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {tip.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(tip.priority)}`}
                          >
                            {t(tip.priority)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            {getCategoryIcon(tip.category)}
                            <span>{t(tip.category)}</span>
                          </div>
                        </div>
                      </div>
                      <p
                        className={`text-xs leading-relaxed mb-3 ${
                          completedTips.has(tip.id)
                            ? "text-green-700 dark:text-green-300"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {tip.description}
                      </p>
                      {tip.actionable && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={completedTips.has(tip.id) ? "outline" : "default"}
                            onClick={() => toggleTipCompletion(tip.id)}
                            className="text-xs h-7"
                          >
                            {completedTips.has(tip.id) ? t("markIncomplete") : t("markComplete")}
                          </Button>
                          {tip.category === "medical" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 bg-transparent"
                              onClick={() =>
                                window.open(
                                  "https://www.google.com/search?q=healthcare+professionals+near+me",
                                  "_blank",
                                )
                              }
                            >
                              {t("findProfessional")}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Summary */}
            <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{t("progressSummary")}</span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {Math.round((completedTips.size / personalizedTips.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-blue-200/50 dark:bg-blue-800/50 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedTips.size / personalizedTips.length) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Print Button for Mobile */}
        <div className="flex gap-3 mb-6 no-print">
          <Button
            onClick={handlePrint}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
          >
            <Printer className="w-4 h-4 mr-2" />
            {t("printReport")}
          </Button>
        </div>

        {/* Summary Stats */}
        <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("yourDetails")}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t("gender")}</span>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {result.gender === "male" ? t("male") : t("female")}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t("height")}</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {result.height} {t("cm")}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t("weight")}</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {result.weight} {t("kg")}
                </p>
              </div>
              {result.age && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t("age")}</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {result.age} {t("years")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
