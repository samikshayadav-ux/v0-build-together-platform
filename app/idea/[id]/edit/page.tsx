"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToastNotification } from "@/components/toast-notification"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  X,
  Save,
  AlertCircle,
  Shield
} from "lucide-react"
import { 
  getIdeaById, 
  getCurrentUser, 
  updateIdea,
  type Idea,
  type User
} from "@/lib/store"

const SKILL_SUGGESTIONS = [
  "AI/ML", "Python", "Web Development", "React", "Node.js", "Mobile App",
  "UI/UX", "Marketing", "Data Science", "IoT", "Hardware", "Cloud Backend",
  "Blockchain", "DevOps", "Product Management", "Finance", "Legal"
]

export default function EditIdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    const fetchedIdea = getIdeaById(id)
    const user = getCurrentUser()
    
    setIdea(fetchedIdea || null)
    setCurrentUser(user)
    
    if (fetchedIdea) {
      setFormData({
        title: fetchedIdea.title,
        problemStatement: fetchedIdea.problemStatement,
        fullDescription: fetchedIdea.fullDescription,
        skillsRequired: fetchedIdea.skillsRequired,
        contactEmail: fetchedIdea.contactEmail,
      })
    }
  }, [id])

  const handleAddSkill = (skill: string) => {
    if (skill && !formData.skillsRequired.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skill]
      }))
    }
    setNewSkill("")
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(s => s !== skill)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!idea || !currentUser) return
    
    if (!formData.title.trim() || !formData.problemStatement.trim() || !formData.fullDescription.trim()) {
      setToast({ isVisible: true, message: "Please fill in all required fields", type: "error" })
      return
    }
    
    if (formData.skillsRequired.length === 0) {
      setToast({ isVisible: true, message: "Please add at least one required skill", type: "error" })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      updateIdea(idea.id, {
        title: formData.title.trim(),
        problemStatement: formData.problemStatement.trim(),
        fullDescription: formData.fullDescription.trim(),
        skillsRequired: formData.skillsRequired,
        contactEmail: formData.contactEmail.trim() || currentUser.email,
      })
      
      setToast({ isVisible: true, message: "Idea updated successfully!", type: "success" })
      
      // Redirect after short delay
      setTimeout(() => {
        router.push(`/idea/${idea.id}`)
      }, 1500)
    } catch {
      setToast({ isVisible: true, message: "Failed to update idea. Please try again.", type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isOwner = currentUser?.id === idea?.postedBy

  if (!idea) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Idea Not Found</h1>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/browse")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!currentUser || !isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <Shield className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-xl font-semibold text-foreground">Access Denied</h1>
            <p className="mt-2 text-muted-foreground">
              Only the idea owner can edit this idea.
            </p>
            <Button className="mt-4" onClick={() => router.push(`/idea/${id}`)}>
              View Idea
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
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/idea/${id}`)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Idea
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Edit Idea</h1>
            <p className="mt-2 text-muted-foreground">
              Update your idea details and requirements.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Idea Title *</Label>
                <Input
                  id="title"
                  placeholder="A concise title for your startup idea"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Problem Statement */}
              <div className="space-y-2">
                <Label htmlFor="problemStatement">Problem Statement *</Label>
                <Textarea
                  id="problemStatement"
                  placeholder="What problem does your idea solve? (2-3 sentences)"
                  value={formData.problemStatement}
                  onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be visible before NDA signing as a teaser.
                </p>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Description (NDA Protected) *</Label>
                <Textarea
                  id="fullDescription"
                  placeholder="Detailed description of your idea, features, market opportunity, etc."
                  value={formData.fullDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Only visible to users who sign the NDA.
                </p>
              </div>

              {/* Skills Required */}
              <div className="space-y-2">
                <Label>Skills Required *</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skillsRequired.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill(newSkill)
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => handleAddSkill(newSkill)}
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Suggested skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {SKILL_SUGGESTIONS.filter(s => !formData.skillsRequired.includes(s)).slice(0, 8).map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleAddSkill(skill)}
                        className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder={currentUser.email}
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use your account email.
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push(`/idea/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />

      {/* Toast */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
