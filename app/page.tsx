"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { 
  Rocket, 
  Shield, 
  Clock, 
  Users, 
  Lock, 
  FileCheck, 
  UserCheck, 
  ChevronRight,
  Zap,
  Star,
  ArrowRight
} from "lucide-react"
import { initializeSampleData } from "@/lib/store"

export default function HomePage() {
  useEffect(() => {
    initializeSampleData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        {/* Background Glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Protected by NDA agreements</span>
            </div>
            
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Turn Ideas Into Startups —{" "}
              <span className="text-primary">Find Your Team.</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              The trusted platform for entrepreneurs to share startup ideas safely. 
              Connect with co-founders, protect your intellectual property, and build something amazing together.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/post-idea">
                <Button size="lg" className="min-w-[180px]">
                  <Rocket className="mr-2 h-5 w-5" />
                  Post Your Idea
                </Button>
              </Link>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="min-w-[180px]">
                  Browse Ideas
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "500+", label: "Ideas Posted" },
              { value: "1,200+", label: "Entrepreneurs" },
              { value: "150+", label: "Teams Formed" },
              { value: "100%", label: "NDA Protected" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-muted-foreground">
              Three simple steps to start building your startup with the right team.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: FileCheck,
                title: "Post Your Idea",
                description: "Share your startup concept with our community. Your idea is timestamped and protected from day one.",
              },
              {
                icon: Users,
                title: "Find Co-founders",
                description: "Browse talented entrepreneurs and developers looking to join innovative projects.",
              },
              {
                icon: Rocket,
                title: "Build Together",
                description: "Form your dream team and start building. We handle the protection, you focus on execution.",
              },
            ].map((step, index) => (
              <div key={step.title} className="relative rounded-xl border border-border bg-background p-8">
                <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protection Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-accent" />
                <span>Enterprise-grade protection</span>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">
                Your Ideas Are <span className="text-primary">Protected</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                We understand that your ideas are valuable. That is why we have built multiple layers 
                of protection to ensure your intellectual property stays safe.
              </p>

              <div className="mt-8 space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "Legal Protection",
                    description: "NDA agreements required before viewing full idea details. Legally binding and timestamped.",
                  },
                  {
                    icon: Clock,
                    title: "Timestamp Verification",
                    description: "Every idea submission is timestamped for proof of original creation date.",
                  },
                  {
                    icon: UserCheck,
                    title: "Verified Users",
                    description: "All users verified through college email or LinkedIn for accountability.",
                  },
                  {
                    icon: Zap,
                    title: "Access Logging",
                    description: "Every view of your idea is logged with user information and timestamp.",
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-3xl" />
              <div className="relative rounded-2xl border border-border bg-card p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                      <Shield className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">NDA Agreement Signed</p>
                      <p className="text-xs text-muted-foreground">March 10, 2026 at 2:45 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Idea Timestamped</p>
                      <p className="text-xs text-muted-foreground">ID: BT-2026-03-10-001</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-4/10">
                      <Star className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Reputation Score</p>
                      <p className="text-xs text-muted-foreground">4.8/5.0 - Trusted Member</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Ready to Build Something Amazing?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of entrepreneurs who trust Build Together to protect their ideas 
              and find the perfect co-founders.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login?mode=signup">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button size="lg" variant="ghost">
                  Explore Ideas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
