"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToastNotification } from "@/components/toast-notification"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User as UserIcon, 
  ArrowLeft,
  Save,
  X,
  Plus,
  Linkedin
} from "lucide-react"
import { 
  getCurrentUser, 
  updateUser,
  type User
} from "@/lib/store"

export default function EditProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    linkedIn: "",
    profilePicture: "",
    skills: [] as string[]
  })

  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }
    setCurrentUser(user)
    setFormData({
      name: user.name,
      bio: user.bio || "",
      linkedIn: user.linkedIn || "",
      profilePicture: user.profilePicture || "",
      skills: [...user.skills]
    })
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = () => {
    const skill = newSkill.trim()
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }))
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) return
    
    if (!formData.name.trim()) {
      setToast({ isVisible: true, message: "Name is required", type: "error" })
      return
    }

    setIsLoading(true)

    try {
      updateUser(currentUser.id, {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        linkedIn: formData.linkedIn.trim(),
        profilePicture: formData.profilePicture.trim(),
        skills: formData.skills
      })

      setToast({ isVisible: true, message: "Profile updated successfully", type: "success" })
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/profile")
      }, 1500)
    } catch {
      setToast({ isVisible: true, message: "Failed to update profile", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center pt-16">
          <div className="mx-auto max-w-md px-4 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-secondary">
              <UserIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">Loading...</h1>
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
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
            <Button variant="ghost" size="sm" onClick={() => router.push("/profile")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
            <p className="mt-1 text-muted-foreground">Update your personal information</p>
          </div>
        </section>

        {/* Form */}
        <section className="py-8">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">Profile Picture</h2>
                <div className="mt-4 flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    {formData.profilePicture ? (
                      <AvatarImage src={formData.profilePicture} alt={formData.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                      {formData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <label htmlFor="profilePicture" className="text-sm font-medium text-foreground">
                      Image URL
                    </label>
                    <Input
                      id="profilePicture"
                      name="profilePicture"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={formData.profilePicture}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Enter a URL to your profile picture
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="text-sm font-medium text-foreground">
                      Bio
                    </label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="mt-1"
                      rows={4}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      A brief description that appears on your profile
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">Skills</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your skills to help others find you for collaboration
                </p>
                <div className="mt-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add a skill (e.g., React, Python)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button type="button" variant="secondary" onClick={handleAddSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 rounded-full p-0.5 hover:bg-secondary-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">Social Links</h2>
                <div className="mt-4">
                  <label htmlFor="linkedIn" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Profile
                  </label>
                  <Input
                    id="linkedIn"
                    name="linkedIn"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/profile")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
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
