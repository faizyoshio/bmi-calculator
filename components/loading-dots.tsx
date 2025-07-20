interface LoadingDotsProps {
  size?: "sm" | "md" | "lg"
  color?: string
}

export function LoadingDots({ size = "md", color = "blue-600" }: LoadingDotsProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  }

  return (
    <div className="flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} bg-${color} rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

export function PulsingDot({ color = "blue-600" }: { color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 bg-${color} rounded-full animate-ping`} />
      <div className={`w-2 h-2 bg-${color} rounded-full animate-pulse`} />
    </div>
  )
}
