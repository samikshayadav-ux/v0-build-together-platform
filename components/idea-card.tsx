"use client"

import { Lock, Users, Calendar, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Idea, User } from "@/lib/store"

interface IdeaCardProps {
  idea: Idea
  user?: User | null
  onViewDetails: (idea: Idea) => void
  onJoinProject: (idea: Idea) => void
}

export function IdeaCard({ idea, user, onViewDetails, onJoinProject }: IdeaCardProps) {
  const isOwner = user?.id === idea.postedBy
  const hasJoined = idea.teamMembers.includes(user?.id || "")

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:scale-105 hover:bg-card">
      {/* Protected Badge */}
      <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-md border border-border/50">
        <Lock className="h-4 w-4" />
        <span>Protected</span>
      </div>

      <div className="p-8">
        {/* Title */}
        <h3 className="pr-24 text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary leading-tight">
          {idea.title}
        </h3>

        {/* Problem Statement */}
        <p className="mt-4 line-clamp-3 text-base text-muted-foreground leading-relaxed">
          {idea.problemStatement}
        </p>

        {/* Skills Required */}
        <div className="mt-6 flex flex-wrap gap-2">
          {idea.skillsRequired.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm font-medium transition-all duration-300 hover:bg-primary/20 hover:text-primary">
              {skill}
            </Badge>
          ))}
          {idea.skillsRequired.length > 4 && (
            <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium border-dashed">
              +{idea.skillsRequired.length - 4} more
            </Badge>
          )}
        </div>

        {/* Meta Info */}
        <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">{idea.teamMembers.length} member{idea.teamMembers.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{new Date(idea.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Posted By */}
        <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-lg font-bold text-primary-foreground shadow-md">
              {idea.postedByName.charAt(0)}
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{idea.postedByName}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-accent">Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-chart-4" />
                  <span className="text-sm font-medium text-muted-foreground">4.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-12 text-sm font-semibold border-2 transition-all duration-300 hover:scale-105 hover:border-primary hover:bg-primary/5"
            onClick={() => onViewDetails(idea)}
          >
            <Lock className="mr-2 h-4 w-4" />
            View Details
          </Button>
          {!isOwner && !hasJoined && (
            <Button
              size="sm"
              className="flex-1 h-12 text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => onJoinProject(idea)}
            >
              Join Project
            </Button>
          )}
          {hasJoined && !isOwner && (
            <Button size="sm" variant="secondary" className="flex-1 h-12 text-sm font-semibold" disabled>
              Joined
            </Button>
          )}
          {isOwner && (
            <Button size="sm" variant="secondary" className="flex-1" disabled>
              Your Idea
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
