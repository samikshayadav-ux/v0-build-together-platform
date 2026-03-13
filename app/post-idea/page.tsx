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
        <section className="border-b border-border/50 bg-gradient-to-b from-card to-background">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 animate-fade-in-up">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">Post Your Idea</h1>
                <p className="mt-2 text-xl text-muted-foreground leading-relaxed">Share your startup concept with the community</p>
              </div>
            </div>

            {/* Protection Info */}
            <div className="mt-8 flex flex-wrap gap-6 animate-fade-in-up animation-delay-200">
              <div className="flex items-center gap-3 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                <Shield className="h-5 w-5 text-accent" />
                <span>NDA Protected</span>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                <Clock className="h-5 w-5 text-primary" />
                <span>Timestamped Submission</span>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                <FileCheck className="h-5 w-5 text-chart-4" />
                <span>Access Logging</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="py-20 bg-gradient-to-b from-background to-card/20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-10 shadow-2xl animate-fade-in-up">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Idea Title */}
                <div className="space-y-4 animate-fade-in-up">
                  <Label htmlFor="title" className="text-lg font-semibold text-foreground">Idea Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., AI-Powered Resume Optimizer"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className={`h-14 text-lg border-2 transition-all duration-300 focus:scale-105 focus:shadow-lg ${errors.title ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                  />
                  {errors.title && <p className="text-sm text-destructive font-medium">{errors.title}</p>}
                </div>

                {/* Problem Statement */}
                <div className="space-y-4 animate-fade-in-up animation-delay-100">
                  <Label htmlFor="problemStatement" className="text-lg font-semibold text-foreground">Problem Statement *</Label>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    A brief description of the problem you are solving (visible to all users)
                  </p>
                  <Textarea
                    id="problemStatement"
                    placeholder="What problem does your idea solve?"
                    rows={5}
                    value={formData.problemStatement}
                    onChange={(e) => setFormData((prev) => ({ ...prev, problemStatement: e.target.value }))}
                    className={`text-lg border-2 transition-all duration-300 focus:shadow-lg ${errors.problemStatement ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                  />
                  {errors.problemStatement && <p className="text-sm text-destructive font-medium">{errors.problemStatement}</p>}
                </div>

                {/* Full Description */}
                <div className="space-y-4 animate-fade-in-up animation-delay-200">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="fullDescription" className="text-lg font-semibold text-foreground">Full Idea Description *</Label>
                    <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium border-2">
                      <Shield className="mr-2 h-4 w-4" />
                      NDA Protected
                    </Badge>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Detailed description (only visible after NDA agreement)
                  </p>
                  <Textarea
                    id="fullDescription"
                    placeholder="Describe your idea in detail: how it works, target market, revenue model, competitive advantage..."
                    rows={12}
                    value={formData.fullDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullDescription: e.target.value }))}
                    className={`text-lg border-2 transition-all duration-300 focus:shadow-lg ${errors.fullDescription ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                  />
                  {errors.fullDescription && <p className="text-sm text-destructive font-medium">{errors.fullDescription}</p>}
                </div>

                {/* Skills Required */}
                <div className="space-y-4 animate-fade-in-up animation-delay-300">
                  <Label className="text-lg font-semibold text-foreground">Skills Required *</Label>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    What skills are needed to build this project?
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {formData.skillsRequired.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    ))}
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                        className="h-12 px-6 text-base font-semibold border-2 transition-all duration-300 hover:scale-105 hover:border-primary hover:bg-primary/5"
                      >
                        <Plus className="mr-3 h-5 w-5" />
                        Add Skill
                      </Button>
                      {showSkillDropdown && (
                        <div className="absolute left-0 top-full z-20 mt-3 max-h-64 w-64 overflow-y-auto rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm p-3 shadow-2xl">
                          {AVAILABLE_SKILLS.filter((skill) => !formData.skillsRequired.includes(skill)).map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => addSkill(skill)}
                              className="w-full rounded-lg px-4 py-3 text-left text-base font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.skillsRequired && <p className="text-sm text-destructive font-medium">{errors.skillsRequired}</p>}
                </div>

                {/* Contact Email */}
                <div className="space-y-4 animate-fade-in-up animation-delay-400">
                  <Label htmlFor="contactEmail" className="text-lg font-semibold text-foreground">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    className={`h-14 text-lg border-2 transition-all duration-300 focus:scale-105 focus:shadow-lg ${errors.contactEmail ? "border-destructive focus:border-destructive" : "focus:border-primary"}`}
                  />
                  {errors.contactEmail && <p className="text-sm text-destructive font-medium">{errors.contactEmail}</p>}
                </div>

                {/* Submit */}
                <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-secondary/20 to-accent/10 p-8 animate-fade-in-up animation-delay-500">
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 shadow-lg">
                      <Shield className="h-7 w-7 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-lg">Your idea will be protected</p>
                      <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                        By submitting, your idea will be timestamped and all viewers will be required 
                        to sign an NDA before seeing the full details.
                      </p>
                    </div>
                  </div>
                  <Button type="submit" className="mt-8 w-full h-14 text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Idea"}
                  </Button>
                </div>
              </form>
            </div>
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
