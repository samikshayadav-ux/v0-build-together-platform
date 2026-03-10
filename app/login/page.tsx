"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToastNotification } from "@/components/toast-notification"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Rocket, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  GraduationCap, 
  Linkedin,
  X,
  Plus,
  CheckCircle
} from "lucide-react"
import { 
  getUserByEmail, 
  createUser, 
  setCurrentUser,
  type User as UserType
} from "@/lib/store"

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
]

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  })

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    skills: [] as string[],
    collegeEmail: "",
    linkedIn: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const mode = searchParams.get("mode")
    if (mode === "signup") {
      setActiveTab("signup")
    }
  }, [searchParams])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!loginData.email) newErrors.email = "Email is required"
    if (!loginData.password) newErrors.password = "Password is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Check if user exists
    const user = getUserByEmail(loginData.email)
    if (!user) {
      setToast({ isVisible: true, message: "User not found. Please sign up.", type: "error" })
      return
    }

    if (user.password !== loginData.password) {
      setToast({ isVisible: true, message: "Invalid password", type: "error" })
      return
    }

    // Login successful
    setCurrentUser(user.id)
    setToast({ isVisible: true, message: "Login successful!", type: "success" })
    
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!signupData.name) newErrors.name = "Name is required"
    if (!signupData.email) newErrors.email = "Email is required"
    if (!signupData.password) newErrors.password = "Password is required"
    if (signupData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    if (signupData.skills.length === 0) newErrors.skills = "Select at least one skill"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Check if user already exists
    if (getUserByEmail(signupData.email)) {
      setToast({ isVisible: true, message: "Email already registered. Please login.", type: "error" })
      return
    }

    // Create new user
    const newUser = createUser({
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      skills: signupData.skills,
      collegeEmail: signupData.collegeEmail || undefined,
      linkedIn: signupData.linkedIn || undefined,
      isVerifiedStudent: !!signupData.collegeEmail && signupData.collegeEmail.endsWith(".edu"),
      isLinkedInVerified: !!signupData.linkedIn,
    })

    setCurrentUser(newUser.id)
    setToast({ isVisible: true, message: "Account created successfully!", type: "success" })
    
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  const addSkill = (skill: string) => {
    if (!signupData.skills.includes(skill)) {
      setSignupData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }))
    }
    setShowSkillDropdown(false)
  }

  const removeSkill = (skill: string) => {
    setSignupData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Rocket className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Build Together</span>
            </Link>
            <p className="mt-4 text-muted-foreground">
              {activeTab === "login" ? "Welcome back! Sign in to continue." : "Create an account to get started."}
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                      className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full">
                  Sign In
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Demo accounts: alex@university.edu, sarah@tech.com, mike@college.edu (password: password123)
                </p>
              </form>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      placeholder="John Doe"
                      value={signupData.name}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, name: e.target.value }))}
                      className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, email: e.target.value }))}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={signupData.password}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, password: e.target.value }))}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm *</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className={errors.confirmPassword ? "border-destructive" : ""}
                    />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Skills *</Label>
                  <div className="flex flex-wrap gap-2">
                    {signupData.skills.map((skill) => (
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
                        Add
                      </Button>
                      {showSkillDropdown && (
                        <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-48 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg">
                          {AVAILABLE_SKILLS.filter((skill) => !signupData.skills.includes(skill)).map((skill) => (
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
                  {errors.skills && <p className="text-sm text-destructive">{errors.skills}</p>}
                </div>

                {/* Verification (Optional) */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Shield className="h-4 w-4 text-accent" />
                    Identity Verification (Optional)
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Get verified badges to build trust
                  </p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="college-email" className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4" />
                        College Email (.edu)
                      </Label>
                      <Input
                        id="college-email"
                        type="email"
                        placeholder="you@university.edu"
                        value={signupData.collegeEmail}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, collegeEmail: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn Profile
                      </Label>
                      <Input
                        id="linkedin"
                        placeholder="linkedin.com/in/yourprofile"
                        value={signupData.linkedIn}
                        onChange={(e) => setSignupData((prev) => ({ ...prev, linkedIn: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-accent" />
              <span>NDA Protected</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-accent" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-accent" />
              <span>Verified Users</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
