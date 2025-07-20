"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, TrendingUp, Download, Printer } from "lucide-react"

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

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<BMIResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const storedResult = sessionStorage.getItem("bmiResult")
    if (storedResult) {
      setResult(JSON.parse(storedResult))
      // Animate progress bar
      setTimeout(() => setProgress(100), 500)
    } else {
      router.push("/")
    }
  }, [router])

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = async () => {
    setIsExporting(true)

    try {
      // Create a new window for PDF generation
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("Popup blocked")
      }

      const printContent = generatePrintContent()

      printWindow.document.write(printContent)
      printWindow.document.close()

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
      }
    } catch (error) {
      console.error("Export failed:", error)
      // Fallback to regular print
      handlePrint()
    } finally {
      setIsExporting(false)
    }
  }

  const generatePrintContent = () => {
    if (!result) return ""

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>BMI Report - ${currentDate}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: white;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
            }
            
            .header h1 {
              font-size: 2.5rem;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 8px;
            }
            
            .header p {
              color: #6b7280;
              font-size: 1.1rem;
            }
            
            .date {
              text-align: right;
              color: #6b7280;
              margin-bottom: 30px;
              font-size: 0.9rem;
            }
            
            .bmi-score {
              text-align: center;
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
              padding: 30px;
              border-radius: 16px;
              margin-bottom: 30px;
              border: 2px solid #e5e7eb;
            }
            
            .bmi-value {
              font-size: 4rem;
              font-weight: bold;
              color: ${getBMIColorForPrint(result.category)};
              margin-bottom: 10px;
            }
            
            .bmi-category {
              font-size: 1.8rem;
              font-weight: bold;
              color: ${getBMIColorForPrint(result.category)};
              margin-bottom: 8px;
            }
            
            .bmi-label {
              color: #6b7280;
              font-size: 1rem;
            }
            
            .section {
              margin-bottom: 30px;
              background: #f9fafb;
              padding: 25px;
              border-radius: 12px;
              border-left: 4px solid #3b82f6;
            }
            
            .section h3 {
              font-size: 1.3rem;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .detail-item {
              background: white;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            
            .detail-label {
              color: #6b7280;
              font-size: 0.9rem;
              margin-bottom: 4px;
            }
            
            .detail-value {
              font-weight: bold;
              color: #1f2937;
              font-size: 1.1rem;
            }
            
            .tips-list {
              list-style: none;
              counter-reset: tip-counter;
            }
            
            .tips-list li {
              counter-increment: tip-counter;
              margin-bottom: 15px;
              padding-left: 40px;
              position: relative;
              line-height: 1.6;
            }
            
            .tips-list li::before {
              content: counter(tip-counter);
              position: absolute;
              left: 0;
              top: 0;
              background: #3b82f6;
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.8rem;
              font-weight: bold;
            }
            
            .health-insight {
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 0.9rem;
            }
            
            .disclaimer {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 15px;
              margin-top: 20px;
              font-size: 0.9rem;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BMI Health Report</h1>
            <p>Body Mass Index Analysis & Health Recommendations</p>
          </div>
          
          <div class="date">
            Generated on ${currentDate}
          </div>
          
          <div class="bmi-score">
            <div class="bmi-value">${result.bmi.toFixed(1)}</div>
            <div class="bmi-category">${result.category}</div>
            <div class="bmi-label">Body Mass Index</div>
          </div>
          
          <div class="section">
            <h3>📊 Your Details</h3>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Gender</div>
                <div class="detail-value">${result.gender.charAt(0).toUpperCase() + result.gender.slice(1)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Height</div>
                <div class="detail-value">${result.height} cm</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Weight</div>
                <div class="detail-value">${result.weight} kg</div>
              </div>
              ${
                result.age
                  ? `
              <div class="detail-item">
                <div class="detail-label">Age</div>
                <div class="detail-value">${result.age} years</div>
              </div>
              `
                  : ""
              }
            </div>
          </div>
          
          <div class="section">
            <h3>💡 Health Insight</h3>
            <div class="health-insight">
              ${result.healthTip}
            </div>
          </div>
          
          <div class="section">
            <h3>🎯 Personalized Recommendations</h3>
            <ul class="tips-list">
              ${getPersonalizedTips(result.category, result.gender, result.age)
                .map((tip) => `<li>${tip}</li>`)
                .join("")}
            </ul>
          </div>
          
          <div class="disclaimer">
            <strong>Important:</strong> BMI is a screening tool and not a diagnostic tool. 
            This report is for informational purposes only and should not replace professional medical advice. 
            Please consult with a healthcare professional for personalized medical guidance.
          </div>
          
          <div class="footer">
            <p>BMI Calculator - Health & Wellness Report</p>
            <p>Keep this report for your health records</p>
          </div>
        </body>
      </html>
    `
  }

  const getBMIColorForPrint = (category: string) => {
    switch (category.toLowerCase()) {
      case "underweight":
        return "#2563eb"
      case "normal":
        return "#059669"
      case "overweight":
        return "#d97706"
      case "obese":
        return "#dc2626"
      default:
        return "#6b7280"
    }
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Your Results</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm animate-pulse">
                  Preparing your personalized health insights...
                </p>
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

  const getPersonalizedTips = (category: string, gender: string, age?: number) => {
    const baseAge = age || 25
    const tips: string[] = []

    switch (category.toLowerCase()) {
      case "underweight":
        tips.push(
          "Focus on nutrient-dense, calorie-rich foods like nuts, avocados, and lean proteins to gain healthy weight.",
          "Incorporate strength training exercises 3-4 times per week to build muscle mass rather than just fat.",
          "Eat smaller, frequent meals throughout the day to increase your overall caloric intake.",
          "Consider adding healthy smoothies with protein powder, fruits, and nut butters to your diet.",
        )
        if (gender === "female") {
          tips.push("Ensure adequate iron and calcium intake, especially important for women's bone health.")
        }
        break

      case "normal":
        tips.push(
          "Maintain your healthy weight with a balanced diet of 50% vegetables, 25% lean protein, and 25% whole grains.",
          "Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly.",
          "Stay hydrated with 8-10 glasses of water daily and limit processed foods and sugary drinks.",
          "Get 7-9 hours of quality sleep each night to support your metabolism and overall health.",
        )
        if (baseAge > 40) {
          tips.push("Include calcium and vitamin D rich foods to maintain bone density as you age.")
        }
        break

      case "overweight":
        tips.push(
          "Create a moderate caloric deficit of 300-500 calories per day through diet and exercise for sustainable weight loss.",
          "Fill half your plate with non-starchy vegetables, one quarter with lean protein, and one quarter with whole grains.",
          "Incorporate both cardio (30 minutes, 5 days/week) and strength training (2-3 days/week) into your routine.",
          "Practice portion control by using smaller plates and eating slowly to recognize fullness cues.",
        )
        if (gender === "male") {
          tips.push("Men typically lose weight faster than women, so be patient and consistent with your approach.")
        }
        break

      case "obese":
        tips.push(
          "Start with small, sustainable changes like replacing sugary drinks with water and taking a 10-minute walk daily.",
          "Focus on whole, unprocessed foods and consider meal prep to avoid impulsive food choices.",
          "Begin with low-impact exercises like swimming, walking, or cycling to protect your joints.",
          "Consider working with a registered dietitian to create a personalized meal plan that fits your lifestyle.",
        )
        if (baseAge > 50) {
          tips.push(
            "Prioritize joint-friendly exercises and consider consulting your doctor before starting an intense exercise program.",
          )
        }
        break
    }

    // Add age-specific tips
    if (baseAge < 25) {
      tips.push(
        "Your metabolism is naturally higher at your age - focus on building healthy habits that will last a lifetime.",
      )
    } else if (baseAge > 50) {
      tips.push("Include resistance training to combat age-related muscle loss and maintain bone density.")
    }

    return tips.slice(0, 4) // Return maximum 4 tips
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4">
      {/* Background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">Your BMI Result</h1>
          </div>

          {/* Export Actions */}
          <div className="flex gap-2 no-print">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              className="bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/30 dark:hover:bg-white/20"
              title="Print Results"
            >
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/30 dark:hover:bg-white/20"
              title="Export as PDF"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-gray-600/30 border-t-gray-600 rounded-full animate-spin"></div>
              ) : (
                <Download className="w-4 h-4" />
              )}
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
            <h2 className={`text-2xl font-bold mb-2 ${getBMIColor(result.category)}`}>{result.category}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Body Mass Index</p>
          </CardContent>
        </Card>

        {/* BMI Range Indicator */}
        <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">BMI Range</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Health Insight</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{result.healthTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Tips Section */}
        <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Personalized Tips for You
            </h3>
            <div className="space-y-4">
              {getPersonalizedTips(result.category, result.gender, result.age).map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/20 dark:bg-white/10 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Button for Mobile */}
        <div className="flex gap-3 mb-6 no-print">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isExporting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Exporting...
              </div>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>

        {/* Summary Stats */}
        <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Gender</span>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{result.gender}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Height</span>
                <p className="font-medium text-gray-900 dark:text-white">{result.height} cm</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Weight</span>
                <p className="font-medium text-gray-900 dark:text-white">{result.weight} kg</p>
              </div>
              {result.age && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Age</span>
                  <p className="font-medium text-gray-900 dark:text-white">{result.age} years</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
