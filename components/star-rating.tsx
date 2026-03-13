"use client"

import { useMemo, useState } from "react"
import { FaStar } from "react-icons/fa"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  max?: number
  className?: string
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  max = 5,
  className,
}: StarRatingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)

  const displayValue = hoveredValue ?? value

  const sizeClasses = useMemo(
    () => ({
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    }),
    []
  )

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
          const isFilled = star <= displayValue
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onMouseEnter={() => !readonly && setHoveredValue(star)}
              onMouseLeave={() => !readonly && setHoveredValue(null)}
              onClick={() => !readonly && onChange?.(star)}
              className={
                "transition-all duration-200 " +
                (readonly ? "cursor-default" : "cursor-pointer hover:scale-110")
              }
            >
              <FaStar
                className={`${sizeClasses[size]} ${
                  isFilled ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            </button>
          )
        })}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {value} / {max}
      </span>
    </div>
  )
}
