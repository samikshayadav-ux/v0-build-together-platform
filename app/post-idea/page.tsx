"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToastNotification } from "@/components/toast-notification"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Shield, Clock, X, Plus, FileCheck, AlertCircle } from "lucide-react"
import { getCurrentUser, createIdea, type User } from "@/lib/store"

const AVAILABLE_SKILLS = [
  "AI/ML",
  "Web Development",
  "Mobile App",
  "IoT",
  "Data Science",
  "UI/UX",
  "Cloud Backend",
  "Blockchain",
  "Marketing",
  "Hardware",
  "Python",
  "React",
  "Node.js",
  "NLP",
  "DevOps",
]

export default function PostIdeaPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  })

  const [formData, setFormData] = useState({
    title: "",
    problemStatement: "",
    fullDescription: "",
    skillsRequired: [] as string[],
    contactEmail: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    if (user) {
      setFormData((prev) => ({ ...prev, contactEmail: user.email }))
    }
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Idea title is required"
    }
    if (!formData.problemStatement.trim()) {
      newErrors.problemStatement = "Problem statement is required"
    }
    if (!formData.fullDescription.trim()) {
      newErrors.fullDescription = "Full description is required"
    }
    if (formData.skillsRequired.length === 0) {
      newErrors.skillsRequired = "At least one skill is required"
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      setToast({ isVisible: true, message: "Please sign in to post an idea", type: "info" })
      setTimeout(() => router.push("/login"), 1500)
      return
    }

    if (!validateForm()) {
      setToast({ isVisible: true, message: "Please fix the errors below", type: "error" })
      return
    }

    setIsSubmitting(true)

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Create the idea
    const newIdea = createIdea({
      title: formData.title,
      problemStatement: formData.problemStatement,
      fullDescription: formData.fullDescription,
      skillsRequired: formData.skillsRequired,
      contactEmail: formData.contactEmail,
      postedBy: currentUser.id,
      postedByName: currentUser.name,
    })

    setIsSubmitting(false)
    setToast({
      isVisible: true,
      message: `Idea submitted successfully — timestamp recorded: ${newIdea.timestamp}`,
      type: "success",
    })

    // Redirect to the idea page after a short delay
    setTimeout(() => {
      router.push(`/idea/${newIdea.id}`)
    }, 2000)
  }

  const addSkill = (skill: string) => {
    if (!formData.skillsRequired.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skill],
      }))
    }
    setShowSkillDropdown(false)
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((s) => s !== skill),
    }))
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-secondary">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">Sign In Required</h1>
            <p className="mt-2 text-muted-foreground">
              You need to sign in to post a startup idea.
            </p>
            <Button className="mt-6" onClick={() => router.push("/login")}>
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Header */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Post Your Idea</h1>
                <p className="text-muted-foreground">Share your startup concept with the community</p>
              </div>
            </div>

            {/* Protection Info */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-accent" />
                <span>NDA Protected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>Timestamped Submission</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileCheck className="h-4 w-4 text-chart-4" />
                <span>Access Logging</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Idea Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Idea Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., AI-Powered Resume Optimizer"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Problem Statement */}
              <div className="space-y-2">
                <Label htmlFor="problemStatement">Problem Statement *</Label>
                <p className="text-sm text-muted-foreground">
                  A brief description of the problem you are solving (visible to all users)
                </p>
                <Textarea
                  id="problemStatement"
                  placeholder="What problem does your idea solve?"
                  rows={3}
                  value={formData.problemStatement}
                  onChange={(e) => setFormData((prev) => ({ ...prev, problemStatement: e.target.value }))}
                  className={errors.problemStatement ? "border-destructive" : ""}
                />
                {errors.problemStatement && <p className="text-sm text-destructive">{errors.problemStatement}</p>}
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="fullDescription">Full Idea Description *</Label>
                  <Badge variant="outline" className="text-xs">
                    <Shield className="mr-1 h-3 w-3" />
                    NDA Protected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detailed description (only visible after NDA agreement)
                </p>
                <Textarea
                  id="fullDescription"
                  placeholder="Describe your idea in detail: how it works, target market, revenue model, competitive advantage..."
                  rows={8}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullDescription: e.target.value }))}
                  className={errors.fullDescription ? "border-destructive" : ""}
                />
                {errors.fullDescription && <p className="text-sm text-destructive">{errors.fullDescription}</p>}
              </div>

              {/* Skills Required */}
              <div className="space-y-2">
                <Label>Skills Required *</Label>
                <p className="text-sm text-muted-foreground">
                  What skills are needed to build this project?
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.skillsRequired.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Skill
                    </Button>
                    {showSkillDropdown && (
                      <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-48 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg">
                        {AVAILABLE_SKILLS.filter((skill) => !formData.skillsRequired.includes(skill)).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="w-full rounded px-3 py-2 text-left text-sm hover:bg-secondary"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {errors.skillsRequired && <p className="text-sm text-destructive">{errors.skillsRequired}</p>}
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  className={errors.contactEmail ? "border-destructive" : ""}
                />
                {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail}</p>}
              </div>

              {/* Submit */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-accent" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Your idea will be protected</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      By submitting, your idea will be timestamped and all viewers will be required 
                      to sign an NDA before seeing the full details.
                    </p>
                  </div>
                </div>
                <Button type="submit" className="mt-4 w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Idea"}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />

      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        duration={3000}
      />
    </div>
  )
}
