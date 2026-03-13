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
      <section className="relative overflow-hidden pt-16 bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Background Glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-5xl text-center animate-fade-in">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-6 py-3 text-sm font-medium text-muted-foreground shadow-lg transition-all duration-300 hover:shadow-xl">
              <Shield className="h-5 w-5 text-primary animate-pulse" />
              <span>Protected by NDA agreements</span>
            </div>
            
            <h1 className="text-balance text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:text-8xl leading-tight animate-fade-in-up">
              Turn Ideas Into Startups —{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Find Your Team.</span>
            </h1>
            
            <p className="mx-auto mt-8 max-w-3xl text-xl text-muted-foreground leading-relaxed animate-fade-in-up animation-delay-200">
              The trusted platform for entrepreneurs to share startup ideas safely. 
              Connect with co-founders, protect your intellectual property, and build something amazing together.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row animate-fade-in-up animation-delay-400">
              <Link href="/post-idea">
                <Button size="lg" className="min-w-[200px] h-14 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <Rocket className="mr-3 h-6 w-6" />
                  Post Your Idea
                </Button>
              </Link>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="min-w-[200px] h-14 text-lg font-semibold border-2 transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground hover:border-primary">
                  Browse Ideas
                  <ChevronRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-24 grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4 animate-fade-in-up animation-delay-600">
            {[
              { value: "500+", label: "Ideas Posted" },
              { value: "1,200+", label: "Entrepreneurs" },
              { value: "150+", label: "Teams Formed" },
              { value: "100%", label: "NDA Protected" },
            ].map((stat, index) => (
              <div key={stat.label} className="group text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-card">
                <p className="text-4xl font-extrabold text-foreground group-hover:text-primary transition-colors duration-300">{stat.value}</p>
                <p className="mt-2 text-base font-medium text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border/50 bg-gradient-to-b from-card to-background py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl">How It Works</h2>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Three simple steps to start building your startup with the right team.
            </p>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-3">
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
              <div key={step.title} className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:bg-card animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-lg font-bold text-primary-foreground shadow-lg">
                  {index + 1}
                </div>
                <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-8 text-2xl font-bold text-foreground">{step.title}</h3>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed">{step.description}</p>
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

              <div className="mt-10 space-y-8">
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
                ].map((feature, index) => (
                  <div key={feature.title} className="group flex gap-6 p-4 rounded-xl hover:bg-card/50 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                      <p className="mt-2 text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl" />
              <div className="relative rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm p-10 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-secondary/20 p-6 transition-all duration-300 hover:shadow-md hover:bg-secondary/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                      <Shield className="h-7 w-7 text-accent" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">NDA Agreement Signed</p>
                      <p className="text-sm text-muted-foreground">March 10, 2026 at 2:45 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-secondary/20 p-6 transition-all duration-300 hover:shadow-md hover:bg-secondary/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">Idea Timestamped</p>
                      <p className="text-sm text-muted-foreground">ID: BT-2026-03-10-001</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-secondary/20 p-6 transition-all duration-300 hover:shadow-md hover:bg-secondary/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chart-4/10">
                      <Star className="h-7 w-7 text-chart-4" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">Reputation Score</p>
                      <p className="text-sm text-muted-foreground">4.8/5.0 - Trusted Member</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 bg-gradient-to-b from-card to-background py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl leading-tight">
              Ready to Build Something Amazing?
            </h2>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Join thousands of entrepreneurs who trust Build Together to protect their ideas 
              and find the perfect co-founders.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link href="/login?mode=signup">
                <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  Get Started Free
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold border-2 transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground hover:border-primary">
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
