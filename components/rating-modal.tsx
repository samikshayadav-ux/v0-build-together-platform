"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, X } from "lucide-react"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, review: string) => void
  userName: string
  existingRating?: number
  existingReview?: string
}

export function RatingModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  userName,
  existingRating,
  existingReview 
}: RatingModalProps) {
  const [rating, setRating] = useState(existingRating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState(existingReview || "")

  if (!isOpen) return null

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, review)
      setRating(0)
      setReview("")
    }
  }

  const handleClose = () => {
    setRating(existingRating || 0)
    setReview(existingReview || "")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {existingRating ? "Edit Your Rating" : "Rate Collaborator"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How was your experience working with {userName}?
          </p>
        </div>

        {/* Rating Stars */}
        <div className="mt-6">
          <p className="text-sm font-medium text-foreground">Rating</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="rounded-lg p-1 transition-colors hover:bg-secondary"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    value <= (hoveredRating || rating)
                      ? "fill-chart-4 text-chart-4"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {rating === 0 && "Click to rate"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        {/* Review */}
        <div className="mt-6">
          <label htmlFor="review" className="text-sm font-medium text-foreground">
            Review (optional)
          </label>
          <Textarea
            id="review"
            placeholder="Share your experience working with this collaborator..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="mt-2"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={rating === 0}>
            {existingRating ? "Update Rating" : "Submit Rating"}
          </Button>
        </div>
      </div>
    </div>
  )
}
