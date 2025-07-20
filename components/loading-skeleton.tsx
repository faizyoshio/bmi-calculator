import { Card, CardContent } from "@/components/ui/card"

export function BMIResultSkeleton() {
  return (
    <div className="max-w-md mx-auto pt-8 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg animate-pulse"></div>
        <div className="ml-4 h-8 w-48 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg animate-pulse"></div>
      </div>

      {/* BMI Score Card Skeleton */}
      <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-full mb-4 border border-white/20 animate-pulse"></div>
          <div className="h-8 w-32 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 w-24 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg mx-auto animate-pulse"></div>
        </CardContent>
      </Card>

      {/* BMI Range Skeleton */}
      <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardContent className="p-6">
          <div className="h-6 w-24 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg mb-4 animate-pulse"></div>
          <div className="space-y-3">
            <div className="flex justify-between">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-3 w-16 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded animate-pulse"
                ></div>
              ))}
            </div>
            <div className="h-3 bg-gradient-to-r from-blue-400/50 via-green-400/50 via-yellow-400/50 to-red-400/50 rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      {/* Health Tip Skeleton */}
      <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 w-32 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg animate-pulse"></div>
              <div className="space-y-1">
                <div className="h-4 w-full bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function FormLoadingSkeleton() {
  return (
    <div className="max-w-md mx-auto pt-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-2xl mb-4 border border-white/20 animate-pulse"></div>
        <div className="h-8 w-48 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg mx-auto mb-2 animate-pulse"></div>
        <div className="h-4 w-32 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded mx-auto animate-pulse"></div>
      </div>

      <Card className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardContent className="p-6 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-20 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded animate-pulse"></div>
              <div className="h-12 w-full bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl animate-pulse"></div>
            </div>
          ))}
          <div className="h-12 w-full bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-xl animate-pulse"></div>
        </CardContent>
      </Card>
    </div>
  )
}
