"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, X, FileText, Lock } from "lucide-react"

interface NdaModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  ideaTitle: string
}

export function NdaModal({ isOpen, onClose, onAccept, ideaTitle }: NdaModalProps) {
  const [isAgreed, setIsAgreed] = useState(false)

  if (!isOpen) return null

  const handleAccept = () => {
    if (isAgreed) {
      onAccept()
      setIsAgreed(false)
    }
  }

  const handleClose = () => {
    setIsAgreed(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">NDA Agreement Required</h2>
            <p className="text-sm text-muted-foreground">Protection for startup ideas</p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Viewing Full Details For:</p>
                <p className="text-sm text-muted-foreground">{ideaTitle}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>By viewing the full details of this startup idea, you agree to the following terms:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>You will not copy, distribute, or share this idea with third parties</li>
              <li>You will not use this idea to create a competing product without permission</li>
              <li>You acknowledge that this idea is the intellectual property of the original poster</li>
              <li>Your access will be logged and timestamped for legal protection</li>
            </ul>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
            <Checkbox
              id="nda-agreement"
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor="nda-agreement" className="cursor-pointer text-sm text-foreground">
              I agree not to copy, distribute, or misuse this idea. I understand that my access is being logged for legal protection.
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Your agreement is legally binding and timestamped</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Decline
          </Button>
          <Button className="flex-1" onClick={handleAccept} disabled={!isAgreed}>
            Accept NDA
          </Button>
        </div>
      </div>
    </div>
  )
}
