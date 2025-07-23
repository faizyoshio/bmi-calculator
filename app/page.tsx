"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Toaster } from "@/components/ui/toaster"
import { Database } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [name, setName] = useState("")
  const [gender, setGender] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [age, setAge] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!name || !height || !weight || !age) {
      toast({
        title: t("error"),
        description: t("please_fill_all_fields"),
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const numericHeight = Number.parseFloat(height)
    const numericWeight = Number.parseFloat(weight)
    const numericAge = Number.parseInt(age)

    if (
      isNaN(numericHeight) ||
      isNaN(numericWeight) ||
      isNaN(numericAge) ||
      numericHeight <= 0 ||
      numericWeight <= 0 ||
      numericAge <= 0
    ) {
      toast({
        title: t("error"),
        description: t("please_enter_valid_numbers"),
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/bmi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, gender, height: numericHeight, weight: numericWeight, age: numericAge }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: t("success"),
          description: data.message,
        })
        router.push(`/results?bmi=${data.bmi}&category=${data.category}`)
      } else {
        toast({
          title: t("error"),
          description: data.message || t("failed_to_calculate_bmi"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error calculating BMI:", error)
      toast({
        title: t("error"),
        description: t("failed_to_calculate_bmi_try_again"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-gray-900 dark:to-black">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Link href="/database" passHref>
          <Button variant="outline" size="sm">
            <Database className="w-4 h-4 mr-2" />
            {t("view_database")}
          </Button>
        </Link>
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">{t("bmi_calculator")}</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t("enter_your_details")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                {t("name")}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t("your_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">
                {t("gender")}
              </Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder={t("select_gender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("male")}</SelectItem>
                  <SelectItem value="female">{t("female")}</SelectItem>
                  <SelectItem value="other">{t("other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="height" className="text-gray-700 dark:text-gray-300">
                {t("height_cm")}
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="e.g., 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="weight" className="text-gray-700 dark:text-gray-300">
                {t("weight_kg")}
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="age" className="text-gray-700 dark:text-gray-300">
                {t("age")}
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g., 30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full py-2 mt-6 text-lg" disabled={loading}>
              {loading ? t("calculating") : t("calculate_bmi")}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
