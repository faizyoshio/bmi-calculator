"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingDots } from "@/components/loading-dots"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/language-context"
import { Calculator, Database, Heart, TrendingUp, Users, Activity } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface BMIResult {
  bmi: number
  category: string
  userId?: number
  calculatedAt: string
}

export default function HomePage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
  })
  const [result, setResult] = useState<BMIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required"
    if (!formData.gender) return "Gender is required"
    if (!formData.age || Number.parseInt(formData.age) <= 0 || Number.parseInt(formData.age) > 150) {
      return "Age must be between 1 and 150"
    }
    if (!formData.height || Number.parseFloat(formData.height) <= 0 || Number.parseFloat(formData.height) > 300) {
      return "Height must be between 1 and 300 cm"
    }
    if (!formData.weight || Number.parseFloat(formData.weight) <= 0 || Number.parseFloat(formData.weight) > 1000) {
      return "Weight must be between 1 and 1000 kg"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/bmi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          gender: formData.gender,
          age: Number.parseInt(formData.age),
          height: Number.parseFloat(formData.height),
          weight: Number.parseFloat(formData.weight),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate BMI")
      }

      if (data.success) {
        setResult({
          bmi: data.data.bmi,
          category: data.data.category,
          userId: data.data.userId,
          calculatedAt: data.data.calculatedAt,
        })

        toast({
          title: "BMI Calculated Successfully",
          description: `Your BMI is ${data.data.bmi} (${data.data.category})`,
        })
      } else {
        throw new Error(data.error || "Calculation failed")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Calculation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "",
      age: "",
      height: "",
      weight: "",
    })
    setResult(null)
    setError(null)
  }

  const getBMIColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "underweight":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "normal weight":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "overweight":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "obese":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">MySQL BMI Calculator</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional BMI calculator with MySQL database integration, advanced analytics, and comprehensive data
            management
          </p>
          <div className="flex justify-center mt-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/database">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Database className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold">Database</h3>
                <p className="text-sm text-muted-foreground">View all records</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/api/health">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold">Health Check</h3>
                <p className="text-sm text-muted-foreground">System status</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/api/stats">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <h3 className="font-semibold">Statistics</h3>
                <p className="text-sm text-muted-foreground">Analytics data</p>
              </CardContent>
            </Card>
          </Link>
          <Card className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <h3 className="font-semibold">MySQL Guide</h3>
              <p className="text-sm text-muted-foreground">Integration docs</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BMI Calculator Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                BMI Calculator
              </CardTitle>
              <CardDescription>
                Enter your details to calculate your Body Mass Index and save to MySQL database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      min="1"
                      max="150"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      min="1"
                      max="300"
                      step="0.1"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      min="1"
                      max="1000"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <LoadingDots />
                        <span className="ml-2">Calculating...</span>
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate BMI
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Display */}
          <div className="space-y-6">
            {result && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Your BMI Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{result.bmi.toFixed(2)}</div>
                    <Badge className={getBMIColor(result.category)} variant="secondary">
                      {result.category}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Gender:</span>
                      <span className="font-medium capitalize">{formData.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Age:</span>
                      <span className="font-medium">{formData.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Height:</span>
                      <span className="font-medium">{formData.height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Weight:</span>
                      <span className="font-medium">{formData.weight} kg</span>
                    </div>
                    {result.userId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">User ID:</span>
                        <span className="font-medium">#{result.userId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Calculated:</span>
                      <span className="font-medium">{new Date(result.calculatedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">
                      <strong>BMI Categories:</strong>
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Underweight:</span>
                        <span>Below 18.5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Normal weight:</span>
                        <span>18.5 - 24.9</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overweight:</span>
                        <span>25.0 - 29.9</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Obese:</span>
                        <span>30.0 and above</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Database className="w-4 h-4 mt-0.5 text-blue-500" />
                  <div>
                    <strong>MySQL Integration:</strong> All calculations are stored in a MySQL database with proper
                    indexing and optimization.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 mt-0.5 text-green-500" />
                  <div>
                    <strong>Health Monitoring:</strong> Real-time database health checks and performance monitoring.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-purple-500" />
                  <div>
                    <strong>Analytics:</strong> Comprehensive statistics and data visualization capabilities.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-orange-500" />
                  <div>
                    <strong>Data Management:</strong> Advanced filtering, sorting, pagination, and export features.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
