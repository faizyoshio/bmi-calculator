"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calculator, User, Ruler, Weight, Calendar, UserCheck } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { LoadingDots } from "@/components/ui/loading-dots"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/language-context"

export default function BMICalculator() {
  const router = useRouter()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    gender: "male",
    height: "",
    weight: "",
    age: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [isValidating, setIsValidating] = useState(false)

  const validateField = async (field: string, value: string) => {
    setIsValidating(true)

    // Simulate validation delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    const errors: { [key: string]: string } = {}

    switch (field) {
      case "name":
        if (value && (value.length < 2 || value.length > 50)) {
          errors.name = t("nameRange")
        } else if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          errors.name = t("nameFormat")
        }
        break
      case "height":
        const height = Number.parseFloat(value)
        if (value && (height < 50 || height > 300)) {
          errors.height = t("heightRange")
        }
        break
      case "weight":
        const weight = Number.parseFloat(value)
        if (value && (weight < 20 || weight > 500)) {
          errors.weight = t("weightRange")
        }
        break
      case "age":
        const age = Number.parseFloat(value)
        if (value && (age < 1 || age > 120)) {
          errors.age = t("ageRange")
        }
        break
    }

    setFieldErrors((prev) => ({ ...prev, [field]: errors[field] || "" }))
    setIsValidating(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (value || field === "name") {
      validateField(field, value)
    } else {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.height || !formData.weight) {
      toast({
        title: t("missingInfo"),
        description: t("missingInfoDesc"),
        variant: "destructive",
      })
      return
    }

    const height = Number.parseFloat(formData.height)
    const weight = Number.parseFloat(formData.weight)

    if (height <= 0 || weight <= 0) {
      toast({
        title: t("invalidInput"),
        description: t("invalidInputDesc"),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/bmi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // Store result in sessionStorage for the results page
        sessionStorage.setItem("bmiResult", JSON.stringify(result))

        // Show success message if name was provided
        if (formData.name) {
          toast({
            title: t("welcomeMessage"),
            description: t("dataStoredMessage").replace("{name}", formData.name),
            variant: "default",
          })
        }

        router.push("/results")
      } else {
        // Log the full error response from the API
        console.error("API Error Response:", result)
        throw new Error(result.error || "Failed to calculate BMI")
      }
    } catch (error) {
      console.error("Submission Error:", error)
      toast({
        title: t("calculationError"),
        description: error instanceof Error ? error.message : t("calculationErrorDesc"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-2xl mb-4 border border-white/20">
            <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("title")}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
        </div>

        {/* Main Form Card */}
        <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {t("name")}
                  <span className="text-xs text-gray-500 dark:text-gray-400">({t("optional")})</span>
                  {isValidating && <LoadingDots size="sm" />}
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("namePlaceholder")}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`bg-white/30 dark:bg-white/10 border-white/20 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 ${
                      fieldErrors.name ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""
                    }`}
                    maxLength={50}
                  />
                  {fieldErrors.name && (
                    <p className="text-red-400 text-xs mt-1 animate-fade-in-up">{fieldErrors.name}</p>
                  )}
                  {formData.name && !fieldErrors.name && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <UserCheck className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Gender Toggle */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t("gender")}
                </Label>
                <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-white/10 rounded-xl border border-white/20">
                  <span
                    className={`text-sm font-medium transition-colors ${formData.gender === "female" ? "text-pink-600 dark:text-pink-400" : "text-gray-500"}`}
                  >
                    {t("female")}
                  </span>
                  <Switch
                    checked={formData.gender === "male"}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, gender: checked ? "male" : "female" }))
                    }
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <span
                    className={`text-sm font-medium transition-colors ${formData.gender === "male" ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}`}
                  >
                    {t("male")}
                  </span>
                </div>
              </div>

              {/* Height Input with validation */}
              <div className="space-y-3">
                <Label
                  htmlFor="height"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Ruler className="w-4 h-4" />
                  {t("height")}
                  {isValidating && <LoadingDots size="sm" />}
                </Label>
                <div className="relative">
                  <Input
                    id="height"
                    type="number"
                    placeholder={t("heightPlaceholder")}
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    className={`bg-white/30 dark:bg-white/10 border-white/20 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 ${
                      fieldErrors.height ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""
                    }`}
                    min="1"
                    max="300"
                  />
                  {fieldErrors.height && (
                    <p className="text-red-400 text-xs mt-1 animate-fade-in-up">{fieldErrors.height}</p>
                  )}
                </div>
              </div>

              {/* Weight Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="weight"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Weight className="w-4 h-4" />
                  {t("weight")}
                </Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="number"
                    placeholder={t("weightPlaceholder")}
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    className={`bg-white/30 dark:bg-white/10 border-white/20 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 ${
                      fieldErrors.weight ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""
                    }`}
                    min="1"
                    max="500"
                  />
                  {fieldErrors.weight && (
                    <p className="text-red-400 text-xs mt-1 animate-fade-in-up">{fieldErrors.weight}</p>
                  )}
                </div>
              </div>

              {/* Age Input (Optional) */}
              <div className="space-y-3">
                <Label
                  htmlFor="age"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {t("age")}
                </Label>
                <div className="relative">
                  <Input
                    id="age"
                    type="number"
                    placeholder={t("agePlaceholder")}
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className={`bg-white/30 dark:bg-white/10 border-white/20 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 ${
                      fieldErrors.age ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""
                    }`}
                    min="1"
                    max="120"
                  />
                  {fieldErrors.age && <p className="text-red-400 text-xs mt-1 animate-fade-in-up">{fieldErrors.age}</p>}
                </div>
              </div>

              {/* Calculate Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="relative">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-4 h-4 border-2 border-transparent border-t-white/50 rounded-full animate-spin animate-reverse"></div>
                    </div>
                    <span className="animate-pulse">{t("calculating")}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    {t("calculateButton")}
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>{t("disclaimer")}</p>
          <p className="mt-1">{t("consultAdvice")}</p>
          {formData.name && (
            <p className="mt-2 text-blue-600 dark:text-blue-400 font-medium">
              {t("personalizedFor")} {formData.name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
