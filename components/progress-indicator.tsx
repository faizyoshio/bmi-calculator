"use client"

import { useEffect, useState } from "react"

interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
  isComplete?: boolean
}

export function ProgressIndicator({ steps, currentStep, isComplete = false }: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((currentStep / (steps.length - 1)) * 100)
    }, 100)
    return () => clearTimeout(timer)
  }, [currentStep, steps.length])

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="relative">
        {/* Progress Bar */}
        <div className="h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  index <= currentStep
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-600 text-white shadow-lg"
                    : "bg-white/20 dark:bg-white/10 border-white/30 text-gray-500 dark:text-gray-400"
                }`}
              >
                {isComplete && index === steps.length - 1 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center max-w-16">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
